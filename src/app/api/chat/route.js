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

// Local Basic Q&A Database to handle direct queries offline/without API call limits
const BASIC_QUESTIONS_DATABASE = {
  en: [
    {
      keywords: [/who are you/i, /what is krishi sakhi/i, /your name/i, /about you/i],
      answer: "I am Krishi Sakhi, your AI agricultural advisor. I am here to help you with crop recommendations, disease scanning, current mandi prices, and general farming advice. How can I help you today?"
    },
    {
      keywords: [/soil.*fertility/i, /soil.*health/i, /improve.*soil/i, /make soil better/i],
      answer: "To improve soil health and fertility, you can: \n1. Add well-rotted organic manure or compost.\n2. Grow leguminous plants (like Moong or Chickpea) to fix nitrogen naturally.\n3. Avoid excessive chemical fertilizers.\n4. Get a soil test to check and balance NPK levels."
    },
    {
      keywords: [/acidic.*soil/i, /acid soil/i, /soil pH low/i, /pH.*below 5/i],
      answer: "For acidic soil (pH below 5.5): \n1. Crops like Potato, Oats, and Tea grow well in acidic conditions.\n2. Apply agricultural lime (calcium carbonate) to help raise the soil pH to a neutral range (6.0-7.0) before planting."
    },
    {
      keywords: [/alkaline.*soil/i, /alkaline soil/i, /soil pH high/i, /pH.*above 7.5/i],
      answer: "For alkaline soil (pH above 7.5): \n1. Crops like Bajra (Pearl Millet), Cotton, and Mustard have high tolerance for alkaline soils.\n2. Apply organic mulch, compost, or elemental sulfur to help lower the soil pH over time."
    },
    {
      keywords: [/mandi price/i, /mandi rate/i, /market rate/i, /crop price/i],
      answer: "Here are the current market prices (Mandi rates): \nRajasthan Mandi:\n- Bajra (Pearl Millet): ₹2,350 / quintal (Trend: Up)\n- Moong (Green Gram): ₹7,800 / quintal (Trend: Stable)\n- Mustard: ₹5,650 / quintal (Trend: Up)\n\nOther Regions:\n- Wheat: ₹2,275 / quintal (Trend: Stable)\n- Rice (Paddy): ₹2,180 / quintal (Trend: Up)\n- Cotton: ₹6,800 / quintal (Trend: Down)"
    },
    {
      keywords: [/fungal.*spot/i, /leaf spot/i, /prevent.*fungus/i, /fungal disease/i],
      answer: "To manage and prevent fungal leaf spots: \n1. Avoid overhead watering; water plants at the base to keep foliage dry.\n2. Prune and destroy infected leaves immediately.\n3. Spray organic neem oil or apply appropriate bio-fungicides.\n4. Ensure proper spacing between plants for good ventilation."
    },
    {
      keywords: [/kisan.*centre/i, /call centre/i, /helpline/i, /agricultural officer/i, /krishi adhikari/i],
      answer: "You can contact the national Kisan Call Centre (KCC) toll-free at 1800-180-1551 for expert agricultural guidance, or reach out to your local Krishi Adhikari (Agricultural Officer)."
    }
  ],
  hi: [
    {
      keywords: [/तुम कौन हो/i, /कृषि सखी क्या है/i, /तुम्हारा नाम/i, /आपके बारे में/i, /who are you/i],
      answer: "मैं कृषि सखी हूँ, आपकी एआई (AI) कृषि सलाहकार। मैं आपको फसल की सिफारिश, बीमारी की पहचान, मंडी भाव और खेती से जुड़ी सलाह देने में मदद कर सकती हूँ। आज मैं आपकी क्या मदद करूँ?"
    },
    {
      keywords: [/मिट्टी की उपजाऊ/i, /मिट्टी की गुणवत्ता/i, /मिट्टी सुधार/i, /soil fertility/i, /soil health/i],
      answer: "मिट्टी की उपजाऊ शक्ति और सेहत सुधारने के उपाय:\n1. अच्छी तरह सड़ी हुई गोबर की खाद या कम्पोस्ट डालें।\n2. मूंग या चने जैसी दलहनी फसलें उगाएं ताकि मिट्टी में प्राकृतिक नाइट्रोजन बढ़े।\n3. रासायनिक खादों का अत्यधिक उपयोग न करें।\n4. मिट्टी की जांच (Soil Test) करवाकर एनपीके (NPK) स्तर को संतुलित करें।"
    },
    {
      keywords: [/अम्लीय मिट्टी/i, /acidic soil/i, /कम पीएच/i],
      answer: "अम्लीय मिट्टी (pH 5.5 से कम) के लिए उपाय:\n1. आलू और जई (Oats) जैसी फसलें अम्लीय मिट्टी में अच्छी बढ़ती हैं।\n2. बुवाई से पहले मिट्टी में कृषि चूना (Agricultural Lime) मिलाएं, जिससे मिट्टी का पीएच स्तर सामान्य (6.0-7.0) हो सके।"
    },
    {
      keywords: [/क्षारीയ मिट्टी/i, /क्षारीय मिट्टी/i, /alkaline soil/i, /ज्यादा पीएच/i],
      answer: "क्षारीय मिट्टी (pH 7.5 से अधिक) के लिए उपाय:\n1. बाजरा, कपास और सरसों जैसी फसलें क्षारीय मिट्टी को सहन कर सकती हैं।\n2. मिट्टी का पीएच घटाने के लिए जैविक खाद, कम्पോസ്റ്റ് या गंधक (Sulfur) का उपयोग करें।"
    },
    {
      keywords: [/मंडी भाव/i, /मंडी रेट/i, /फसल का दाम/i, /mandi price/i],
      answer: "वर्तमान मंडी भाव (मंडी दरें) इस प्रकार हैं:\nराजस्थान मंडी:\n- बाजरा: ₹2,350 / क्विंटल (बढ़त)\n- मूंग: ₹7,800 / क्विंटल (स्थिर)\n- सरसों: ₹5,650 / क्विंटल (बढ़त)\n\nअन्य क्षेत्र:\n- गेहूं: ₹2,275 / क्विंटल (स्थिर)\n- धान (चावल): ₹2,180 / क्विंटल (बढ़त)\n- कपास: ₹6,800 / क्विंटल (गिरावट)"
    },
    {
      keywords: [/पत्ती धब्बा/i, /फंगस/i, /कवक/i, /fungal/i, /leaf spot/i],
      answer: "फंगल पत्ती धब्बा रोग की रोकथाम के उपाय:\n1. पौधों के ऊपर से पानी न डालें; हमेशा जड़ों में पानी दें ताकि पत्तियां सूखी रहें।\n2. संक्रमित पत्तियों को तोड़कर नष्ट कर दें।\n3. जैविक नीम तेल का छिड़काव करें या उपयुक्त कवकनाशी का प्रयोग करें।\n4. पौधों के बीच उचित दूरी रखें ताकि हवा का संचार सही हो।"
    },
    {
      keywords: [/किसान कॉल/i, /हेल्पलाइन/i, /कृषि अधिकारी/i, /kisan call/i, /helpline/i],
      answer: "आप कृषि विशेषज्ञ से सलाह के लिए राष्ट्रीय किसान कॉल सेंटर (KCC) के टोल-फ्री नंबर 1800-180-1551 पर कॉल कर सकते हैं, या अपने स्थानीय कृषि अधिकारी से संपर्क कर सकते हैं।"
    }
  ],
  ml: [
    {
      keywords: [/ആരാണ്/i, /കൃഷി സഖി/i, /പേര്/i, /who are you/i],
      answer: "ഞാൻ കൃഷി സഖിയാണ്, നിങ്ങളുടെ AI കാർഷിക സഹായി. വിള ശുപാർശകൾ, രോഗനിർണ്ണയം, മണ്ടി നിരക്കുകൾ, കൃഷി ഉപദേശങ്ങൾ എന്നിവയിൽ ഞാൻ നിങ്ങളെ സഹായിക്കും. ഇന്ന് ഞാൻ നിങ്ങൾക്ക് എന്താണ് ചെയ്യേണ്ടത്?"
    },
    {
      keywords: [/മണ്ണ്/i, /ഫലഭൂയിഷ്ഠത/i, /soil/i],
      answer: "മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത വർദ്ധിപ്പിക്കാൻ:\n1. ജൈവവളങ്ങളോ കമ്പോസ്റ്റോ ചേർക്കുക.\n2. ചെറുപയർ, കടല തുടങ്ങിയ പയറുവർഗ്ഗ വിളകൾ കൃഷി ചെയ്യുക.\n3. രാസവളങ്ങളുടെ അമിത ഉപയോഗം ഒഴിവാക്കുക.\n4. കൃത്യമായ മണ്ണ് പരിശോധന നടത്തുക."
    }
  ]
};

// Local Rule-Based Intelligent Fallback Response Builder
function generateFallbackResponse(latestMessage, language, plotData) {
  const crop = plotData?.crop || "crops";
  const soil = plotData?.soilType || "soil";
  const loc = plotData?.location || "India";

  if (language === 'Hindi') {
    return `नमस्ते! अभी सर्वर व्यस्त होने के कारण मैं पूरी तरह से कनेक्ट नहीं हो पा रही हूँ। लेकिन आपकी जानकारी के अनुसार:\n` +
      `- स्थान: ${loc}\n` +
      `- वर्तमान फसल: ${crop}\n` +
      `- मिट्टी का प्रकार: ${soil}\n\n` +
      `इस फसल और मिट्टी के लिए सामान्य सलाह:\n` +
      `1. अपनी ${crop} की फसल में उचित नमी बनाए रखें और जैविक खादों का अधिक उपयोग करें।\n` +
      `2. ${soil} मिट्टी में पोषक तत्वों को बनाए रखने के लिए समय-समय पर कम्पोस्ट या केंचुआ खाद मिलाएं।\n` +
      `3. किसी भी कीट या बीमारी के लक्षण दिखने पर तुरंत जैविक नीम तेल (Neem Oil) का छिड़काव करें।\n` +
      `आप विस्तृत मार्गदर्शन के लिए हमारे किसान कॉल सेंटर टोल-फ्री नंबर 1800-180-1551 पर भी कॉल कर सकते हैं।`;
  } else if (language === 'Malayalam') {
    return `നമസ്കാരം! കണക്ഷൻ തകരാറിലായതിനാൽ എനിക്ക് പൂർണ്ണമായ ഉത്തരം നൽകാൻ കഴിയുന്നില്ല. എങ്കിലും നിങ്ങളുടെ കൃഷി വിവരങ്ങൾ പ്രകാരം:\n` +
      `- സ്ഥലം: ${loc}\n` +
      `- വിള: ${crop}\n` +
      `- മണ്ണ്: ${soil}\n\n` +
      `പൊതുവായ നിർദ്ദേശങ്ങൾ:\n` +
      `1. ${crop} വിളകൾക്ക് ആവശ്യമായ ജലസേചനം നൽകുക.\n` +
      `2. ${soil} മണ്ണിൽ ജൈവവളങ്ങൾ കൂടുതൽ ഉപയോഗിക്കുക.\n` +
      `കൂടുതൽ വിവരങ്ങൾക്ക് കിസാൻ കോൾ സെന്റർ 1800-180-1551 എന്ന നമ്പറിൽ ബന്ധപ്പെടാം.`;
  } else {
    return `Hello! Due to high server traffic, my live AI connection is temporarily limited. However, looking at your farm details:\n` +
      `- Location: ${loc}\n` +
      `- Current Crop: ${crop}\n` +
      `- Soil Type: ${soil}\n\n` +
      `Here is some practical advice for your farm:\n` +
      `1. Ensure your ${crop} crop receives balanced irrigation according to the soil conditions.\n` +
      `2. For ${soil} soil, applying organic compost or mulch can help retain moisture and improve aeration.\n` +
      `3. Scout the crop fields regularly. If you notice early pest activity, spray organic Neem oil solution immediately.\n` +
      `Feel free to ask a basic question (e.g. soil fertility, acidic/alkaline soils) or contact the Kisan Call Centre at 1800-180-1551.`;
  }
}

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { messages, plotData, userProfile, imageData, imageMimeType } = await req.json();
    const latestMessage = messages[messages.length - 1].text;

    const languageMap = { 'en': 'English', 'hi': 'Hindi', 'ml': 'Malayalam' };
    const language = languageMap[userProfile?.language] || 'English';

    // Intercept basic questions first using BASIC_QUESTIONS_DATABASE
    const userLang = userProfile?.language || 'en';
    const langDb = BASIC_QUESTIONS_DATABASE[userLang] || BASIC_QUESTIONS_DATABASE['en'];
    let matchedAnswer = null;
    for (const q of langDb) {
      for (const rx of q.keywords) {
        if (rx.test(latestMessage)) {
          matchedAnswer = q.answer;
          break;
        }
      }
      if (matchedAnswer) break;
    }

    if (matchedAnswer) {
      console.log(`Matched basic question! Intercepting response: "${matchedAnswer.substring(0, 50)}..."`);
      return new Response(JSON.stringify({ text: matchedAnswer }), { headers: { 'Content-Type': 'application/json' } });
    }

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

    // Keyword escalation for high-urgency tasks
    const escalationKeywords = /dying|legal|subsidy|soil test|severe infection/i;
    if (escalationKeywords.test(latestMessage) && !imageData) {
      const escalationResponse = "This sounds like a critical issue that requires local support. For the most accurate guidance, I recommend reaching out to your local Krishi Adhikari (Agricultural Officer). You can also contact the national Kisan Call Centre (KCC) toll-free at 1800-180-1551.";
      return new Response(JSON.stringify({ text: escalationResponse }), { headers: { 'Content-Type': 'application/json' } });
    }

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

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable.");
      }

      // Initialize LangChain Gemini model
      const chatModel = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-2.0-flash",
        maxOutputTokens: 2048,
        temperature: 0.2
      });

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
    } catch (llmError) {
      console.warn("LLM API failed or is rate-limited. Serving intelligent rule-based fallback response...", llmError);
      const fallbackText = generateFallbackResponse(latestMessage, language, plotData);
      return new Response(JSON.stringify({ text: fallbackText }), { headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error("Error in LangChain API route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat agent request." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

