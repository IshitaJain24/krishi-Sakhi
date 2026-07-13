import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Mock database values for tools
const MANDI_PRICES_DATABASE = {
  rajasthan: [
    { crop: "Bajra (Pearl Millet)", price: "₹2,350 / quintal", trend: "up" },
    { crop: "Moong (Green Gram)", price: "₹7,800 / quintal", trend: "stable" },
    { crop: "Mustard", price: "₹5,650 / quintal", trend: "up" }
  ],
  default: [
    { crop: "Wheat (Kanak)", price: "₹2,275 / quintal", trend: "stable" },
    { crop: "Rice (Paddy)", price: "₹2,180 / quintal", trend: "up" },
    { crop: "Cotton", price: "₹6,800 / quintal", trend: "down" }
  ]
};

const WEATHER_ALERTS_DATABASE = {
  rajasthan: {
    temp: "34°C",
    condition: "Sunny and Dry",
    humidity: "35%",
    alert: "Increased reports of white grub activity in dry soil. Irrigate in early mornings."
  },
  default: {
    temp: "29°C",
    condition: "Partly Cloudy",
    humidity: "65%",
    alert: "High humidity might lead to fungal leaf spot. Apply organic neem oil if symptoms appear."
  }
};

// 1. Weather Tool
const weatherTool = tool(
  async ({ location }) => {
    const loc = (location || "").toLowerCase();
    const weather = loc.includes("rajasthan") || loc.includes("jaipur")
      ? WEATHER_ALERTS_DATABASE.rajasthan
      : WEATHER_ALERTS_DATABASE.default;
    return JSON.stringify({ location, ...weather });
  },
  {
    name: "get_weather_alerts",
    description: "Fetch live agricultural weather condition, humidity levels, and pest alerts for a specific location.",
    schema: z.object({
      location: z.string().describe("The farmer's farm location or city (e.g. Jaipur, Rajasthan)")
    })
  }
);

// 2. Mandi Price Tool
const mandiPricesTool = tool(
  async ({ location }) => {
    const loc = (location || "").toLowerCase();
    const prices = loc.includes("rajasthan") || loc.includes("jaipur")
      ? MANDI_PRICES_DATABASE.rajasthan
      : MANDI_PRICES_DATABASE.default;
    return JSON.stringify({ location, prices });
  },
  {
    name: "get_mandi_prices",
    description: "Fetch real-time crop market prices (Mandi rates) for the specified region.",
    schema: z.object({
      location: z.string().describe("The farmer's region or state (e.g. Rajasthan)")
    })
  }
);

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { messages, plotData, userProfile, imageData, imageMimeType } = await req.json();
    const latestMessage = messages[messages.length - 1].text;

    // --- MODE 1: LANGFLOW INTEGRATION ---
    if (process.env.LANGFLOW_API_URL) {
      console.log("Routing query to Langflow Flow Backend...");
      try {
        const langflowUrl = process.env.LANGFLOW_API_URL;
        const appToken = process.env.LANGFLOW_APPLICATION_TOKEN;

        const headers = {
          "Content-Type": "application/json",
        };
        if (appToken) {
          headers["Authorization"] = `Bearer ${appToken}`;
        }

        const payload = {
          input_value: latestMessage,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "Prompt-6t8gG": {
              "location": plotData?.location || "N/A",
              "crop": plotData?.crop || "N/A",
              "soil": plotData?.soilType || "N/A"
            }
          }
        };

        const response = await fetch(langflowUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Langflow API responded with status ${response.status}`);
        }

        const data = await response.json();
        
        // Extract output text from typical Langflow output structures
        let text = "";
        if (data.outputs && data.outputs[0]?.outputs[0]?.results?.message?.text) {
          text = data.outputs[0].outputs[0].results.message.text;
        } else if (data.result) {
          text = data.result;
        } else {
          text = JSON.stringify(data);
        }

        return new Response(JSON.stringify({ text }), { headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        console.error("Langflow connection error, falling back to local LangChain agent...", err);
      }
    }

    // --- MODE 2: LOCAL LANGCHAIN AGENT (FALLBACK/DEFAULT) ---
    console.log("Running local LangChain Gemini AI Agent...");
    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY environment variable." }), { status: 500 });
    }

    // Keyword escalation for high-urgency tasks
    const escalationKeywords = /dying|legal|subsidy|soil test|severe infection/i;
    if (escalationKeywords.test(latestMessage) && !imageData) {
      const escalationResponse = "This sounds like a critical issue that requires local support. For the most accurate guidance, I recommend reaching out to your local Krishi Adhikari (Agricultural Officer). You can also contact the national Kisan Call Centre (KCC) toll-free at 1800-180-1551.";
      return new Response(JSON.stringify({ text: escalationResponse }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Initialize LangChain Gemini model
    const chatModel = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-2.5-flash",
      maxOutputTokens: 2048,
      temperature: 0.2
    });

    const languageMap = { 'en': 'English', 'hi': 'Hindi', 'ml': 'Malayalam' };
    const language = languageMap[userProfile?.language] || 'English';
    const hasCrop = plotData && plotData.crop && plotData.crop.trim() !== "";

    const fullContext = `
      - Name: ${userProfile?.name || 'Farmer'}
      - Location: ${plotData?.location || 'N/A'}
      - Land Size: ${plotData?.landSize || 'Not specified'}
      - Irrigation: ${plotData?.irrigationSource || 'Not specified'}
      - Soil Type: ${plotData?.soilType || 'Not specified'}
      - Soil pH: ${plotData?.soilPH || 'Not specified'}
      - NPK Values (N, P, K in kg/ha): ${plotData?.nitrogen || 'N/A'}, ${plotData?.phosphorus || 'N/A'}, ${plotData?.potassium || 'N/A'}
      - Current Crop: ${hasCrop ? plotData.crop : 'Not Selected'}
      - Sowing Date: ${plotData?.sowingDate || 'N/A'}
    `;

    let systemPrompt = "";
    let langchainMessages = [];

    // Multimodal context if user uploaded an image of crop/pest
    if (imageData && imageMimeType) {
      systemPrompt = `You are "Krishi Sakhi," an expert female plant pathologist. Your task is to analyze the uploaded crop image.
      
      **CRITICAL RULES:**
      1. **FORMATTING:** Do NOT use markdown. Use plain text only. Do not use asterisks (*). Use numbered lists (e.g. '1. Step', '2. Step') for step-by-step guidance.
      2. **Identify Issue:** Describe what you see in the leaf or crop (spots, pest holes, nutrient deficiency).
      3. **Actionable Steps:** Provide a clear treatment plan or biological solution in a numbered list.
      4. **LANGUAGE:** You MUST respond in ${language}.
      
      **FARMER'S CONTEXT:**
      ${fullContext}`;

      const previousMessages = messages.slice(0, -1).map(msg => 
        msg.isUser ? new HumanMessage(msg.text) : new AIMessage(msg.text)
      );

      const latestMessageContent = [
        { type: "text", text: latestMessage },
        { type: "image_url", image_url: `data:${imageMimeType};base64,${imageData}` }
      ];

      langchainMessages = [
        new SystemMessage(systemPrompt),
        ...previousMessages,
        new HumanMessage({ content: latestMessageContent })
      ];

      // Invoke model
      const result = await chatModel.invoke(langchainMessages);
      return new Response(JSON.stringify({ text: result.content }), { headers: { 'Content-Type': 'application/json' } });

    } else {
      // General agentic conversation with tool routing
      systemPrompt = `You are "Krishi Sakhi," a friendly, expert female agricultural advisor for farmers in India.
      
      **CRITICAL RULES:**
      1. **FORMATTING:** Do NOT use markdown. Use plain text only. Do not use asterisks (*). Use numbered lists (e.g., '1. Step', '2. Step') for instructions.
      2. **TIMELY:** Recommendations must match the current season and location.
      3. **CONCISE:** Keep your answers short, direct, and practical.
      4. **PROACTIVE UPDATE:** If the farmer commits to growing a crop (e.g., "I will sow wheat"), end your answer with this exact code: "PROACTIVE_UPDATE_SUGGESTION: [Crop Name]".
      5. **LANGUAGE:** You MUST speak and respond only in ${language}.
      
      **FARMER'S CONTEXT:**
      ${fullContext}`;

      const history = messages.slice(0, -1).map(msg => 
        msg.isUser ? new HumanMessage(msg.text) : new AIMessage(msg.text)
      );

      langchainMessages = [
        new SystemMessage(systemPrompt),
        ...history,
        new HumanMessage(latestMessage)
      ];

      // Bind tools
      const modelWithTools = chatModel.bindTools([weatherTool, mandiPricesTool]);

      // Call model with tools
      let response = await modelWithTools.invoke(langchainMessages);

      // Handle tool execution loop if requested by model
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log("Model requested tool invocation:", response.tool_calls);
        
        // Execute tools
        const toolOutputs = [];
        for (const tc of response.tool_calls) {
          if (tc.name === "get_weather_alerts") {
            const out = await weatherTool.invoke(tc.args);
            toolOutputs.push(new AIMessage({ content: `Result from get_weather_alerts: ${out}` }));
          } else if (tc.name === "get_mandi_prices") {
            const out = await mandiPricesTool.invoke(tc.args);
            toolOutputs.push(new AIMessage({ content: `Result from get_mandi_prices: ${out}` }));
          }
        }

        // Send tool results back to LLM to generate final response
        langchainMessages.push(response);
        langchainMessages.push(...toolOutputs);
        
        response = await chatModel.invoke(langchainMessages);
      }

      return new Response(JSON.stringify({ text: response.content }), { headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error("Error in LangChain API route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat agent request." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
