chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAISuggestions") {
    console.log("📡 Received request for AI suggestions:", request.prompt);
    
    fetch("https://promptpilot-app.herokuapp.com/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a world-class prompt engineering expert. Your task is to analyze the user's input and generate 3 highly tailored, creative, and sophisticated prompt suggestions that enhance the original query's effectiveness. Infer the user's likely area of interest or expertise based on the input's tone, domain (e.g., technical, creative, business), and complexity, adapting suggestions to reflect this inferred context. Use advanced techniques such as:\n- Assigning specific roles (e.g., expert, educator) with detailed context relevant to the inferred domain.\n- Implementing chain-of-thought prompting to encourage step-by-step reasoning.\n- Adding constraints or multi-part structures for clarity and depth.\n- Incorporating analogies, examples, or justifications to improve response quality.\nOutput *only* the suggestions as a JSON array (e.g., [\"suggestion1\", \"suggestion2\", \"suggestion3\"]), ensuring each suggestion is a complete, well-formed prompt that a top-level prompt engineer would craft. Do not include any explanatory text outside the JSON."
          },
          {
            role: "user",
            content: `User prompt: "${request.prompt}". Generate 3 prompt suggestions.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })
      .then((response) => {
        console.log("📡 Proxy response status:", response.status);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP error ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Raw AI response:", data);
        if (data.error) {
          console.error("❌ OpenAI API error:", data.error);
          sendResponse({ error: data.error.message });
        } else {
          let suggestions = data.choices[0].message.content.trim();
          try {
            suggestions = JSON.parse(suggestions);
            if (!Array.isArray(suggestions) || suggestions.length !== 3) {
              throw new Error("Invalid suggestion format: expected array of 3");
            }
            console.log("✅ Parsed suggestions:", suggestions);
            sendResponse({ suggestions });
          } catch (e) {
            console.error("❌ Failed to parse suggestions:", e, "Raw:", suggestions);
            const fallback = [
              `Act as an expert: ${request.prompt}`,
              `Explain simply: ${request.prompt}`,
              `Step-by-step: ${request.prompt}`
            ];
            sendResponse({ suggestions: fallback });
          }
        }
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error.message);
        sendResponse({ error: error.message });
      });

    return true;
  } else if (request.action === "generateIntents") {
    console.log("📡 Received request for AI intents:", request.keywords);
    fetch("https://promptpilot-app.herokuapp.com/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an intent inference expert. Given user keywords, generate 4-6 relevant intent/context buttons for a prompt autocomplete extension. Examples: for 'laptop kota kinabalu', suggest 'Find Stores', 'Buy Online', 'Repair Service', 'Review Product', 'Compare Prices'. Output *only* as a JSON array of strings, e.g., [\"Find Stores\", \"Buy Online\", \"Repair Service\", \"Review Product\"]. No explanatory text."
          },
          {
            role: "user",
            content: `User keywords: "${request.keywords}". Generate 4-6 intent buttons.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })
      .then((response) => {
        console.log("📡 Proxy response status:", response.status);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP error ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Raw AI intents response:", data);
        if (data.error) {
          console.error("❌ OpenAI API error:", data.error);
          sendResponse({ error: data.error.message });
        } else {
          let intents = data.choices[0].message.content.trim();
          try {
            intents = JSON.parse(intents);
            if (!Array.isArray(intents)) {
              throw new Error("Invalid intents format: expected array");
            }
            console.log("✅ Parsed intents:", intents);
            sendResponse({ intents });
          } catch (e) {
            console.error("❌ Failed to parse intents:", e, "Raw:", intents);
            const fallback = ["Find", "Buy", "Repair", "Review"];
            sendResponse({ intents: fallback });
          }
        }
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error.message);
        sendResponse({ error: error.message });
      });

    return true;
  } else if (request.action === "generateSentences") {
    console.log("📡 Received request for AI sentences:", request);
    fetch("https://promptpilot-app.herokuapp.com/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a world-class prompt engineering expert. Given the chat history, user keywords, and selected intent, generate EXACTLY 3 highly tailored, creative, and sophisticated prompt suggestions that align with the intent, incorporate the keywords naturally, and continue or enhance the conversation based on the history. ALL prompts MUST be written in the first-person perspective (e.g., starting with 'I want to', 'How can I', 'Tell me about' from the user's viewpoint) and ABSOLUTELY NO second-person ('you') or third-person perspectives are allowed. Each suggestion must use advanced techniques such as: assigning specific roles (e.g., expert, educator) with detailed context; implementing chain-of-thought prompting for step-by-step reasoning; adding constraints or multi-part structures for clarity and depth; incorporating analogies, examples, or justifications. Output ABSOLUTELY NOTHING but a JSON array of exactly 3 strings, like this: [\"I want to analyze X using chain-of-thought reasoning...\", \"How can I implement Y with a step-by-step approach...\", \"Tell me about Z as if I'm an expert in...\"]. No introductions, explanations, or extra text—ONLY the JSON array. Examples: For keywords 'laptop performance' and intent 'Analyze', output: [\"I want to analyze laptop performance metrics using chain-of-thought reasoning to compare CPU benchmarks.\", \"How can I evaluate laptop performance with a structured framework, considering battery life and processing speed?\", \"Tell me about laptop performance optimization as if I'm a hardware engineer, focusing on thermal management.\"]"
          },
          {
            role: "user",
            content: `Chat history: ${request.history || 'No history available'}\nUser keywords: "${request.keywords}". Selected intent: "${request.intent}". Generate 3 sophisticated prompt suggestions in first-person perspective.`
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      })
    })
      .then((response) => {
        console.log("📡 Proxy response status:", response.status);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP error ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Raw AI sentences response:", data);
        if (data.error) {
          console.error("❌ OpenAI API error:", data.error);
          sendResponse({ error: data.error.message });
        } else {
          const rawContent = data.choices[0].message.content.trim();
          console.log("Raw content before parsing:", rawContent);
          try {
            sentences = JSON.parse(rawContent);
            if (!Array.isArray(sentences) || sentences.length !== 3) {
              throw new Error("Invalid sentences format: expected array of 3");
            }
            console.log("✅ Parsed sentences:", sentences);
            sendResponse({ sentences });
          } catch (e) {
            console.error("❌ Failed to parse sentences:", e, "Raw:", rawContent);
            const fallback = [
              `I want to explore ${request.keywords} as an expert in ${request.intent}, using a chain-of-thought approach to break down key concepts.`,
              `How can I approach ${request.keywords} with a step-by-step ${request.intent} process, ensuring clarity and depth?`,
              `Tell me about ${request.keywords} as if I'm a professional in ${request.intent}, incorporating detailed examples and justifications.`
            ];
            sendResponse({ sentences: fallback });
          }
        }
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error.message);
        sendResponse({ error: error.message });
      });

    return true;
  }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  console.log("📝 Omnibox input entered:", text);
  chrome.runtime.sendMessage({ action: "generateIntents", keywords: text }, (response) => {
    console.log("📡 Omnibox response:", response);
    if (response.intents && response.intents.length > 0) {
      const prompt = response.intents[0];
      chrome.tabs.create({ url: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}` });
    } else {
      chrome.tabs.create({ url: `https://chatgpt.com/?q=${encodeURIComponent(text)}` });
    }
  });
});