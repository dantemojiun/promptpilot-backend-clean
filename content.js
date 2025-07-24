console.log("🚀 PromptPilot content script loaded on", window.location.href);

function createSuggestionBox() {
  console.log("🛠️ Creating suggestion box...");
  const container = document.createElement("div");
  container.id = "promptpilot-box-container";
  const shadow = container.attachShadow({ mode: "open" });
  const box = document.createElement("div");
  box.id = "promptpilot-box";
  box.style.display = "none";
  box.style.opacity = "0";
  box.style.transition = "opacity 0.3s ease";

  // Toggle button
  const toggle = document.createElement("div");
  toggle.id = "promptpilot-toggle";
  toggle.textContent = "✨";
  toggle.style.position = "fixed";
  toggle.style.bottom = "20px";
  toggle.style.right = "20px";
  toggle.style.padding = "8px";
  toggle.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  toggle.style.color = "white";
  toggle.style.borderRadius = "50%";
  toggle.style.cursor = "pointer";
  toggle.style.zIndex = "99998";
  toggle.style.display = "block"; // Ensure toggle is visible by default
  document.body.appendChild(toggle);

  // Initial styling
  Object.assign(box.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: "99999",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    maxWidth: "300px",
    width: "90%",
    maxHeight: "200px",
    overflowY: "auto",
    color: "#333"
  });

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode) {
    box.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
    box.style.color = "#ddd";
    box.style.borderColor = "#555";
  }

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "5px";
  closeBtn.style.right = "5px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "16px";
  closeBtn.onclick = () => {
    box.style.display = "none";
    toggle.style.display = "block";
  };
  box.appendChild(closeBtn);

  shadow.appendChild(box);
  document.body.appendChild(container);
  console.log("✅ Suggestion box and toggle created");
  return { box, toggle };
}

function sendUsageData(input, suggestion) {
  const usageData = {
    sessionId: crypto.randomUUID(),
    inputLength: input.length,
    suggestionUsed: suggestion.substring(0, 50),
    timestamp: new Date().toISOString(),
    userAction: "suggestion_click"
  };
  fetch('https://promptpilot-app-4c3dd6ade6e0.herokuapp.com/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usageData)
  }).catch(err => console.error("❌ Usage data send failed:", err));
}

function updateSuggestions(inputText, box, toggle, textarea) {
  console.log("🔍 Updating suggestions for input:", inputText);
  if (!inputText) {
    box.style.display = "none";
    toggle.style.display = "block"; // Ensure toggle is visible when input is empty
    return;
  }

  box.style.display = "block";
  box.style.opacity = "0";
  setTimeout(() => box.style.opacity = "1", 10);

  chrome.runtime.sendMessage(
    { action: "generateIntents", keywords: inputText },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error communicating with background script:", chrome.runtime.lastError);
        renderSuggestions(["Find", "Buy", "Repair"], box, textarea, inputText);
        return;
      }
      if (response.error) {
        console.error("❌ API error:", response.error);
        renderSuggestions(["Find", "Buy", "Repair"], box, textarea, inputText);
      } else {
        console.log("📌 Received AI intents:", response.intents);
        renderSuggestions(response.intents, box, textarea, inputText);
      }
    }
  );
}

function renderSuggestions(intents, box, textarea, inputText) {
  box.innerHTML = "<strong>✨ Suggested Intents:</strong><br><br>";
  intents.forEach((context) => {
    const button = document.createElement("div");
    button.textContent = context;
    Object.assign(button.style, {
      padding: "8px",
      marginBottom: "4px",
      backgroundColor: "rgba(240, 240, 240, 0.8)",
      borderRadius: "6px",
      cursor: "pointer",
      display: "block"
    });
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) button.style.backgroundColor = "rgba(50, 50, 50, 0.8)";

    let suggestionsBox = document.createElement("div");
    suggestionsBox.id = `suggestions-${context.replace(/\s+/g, '-')}`; // Sanitize ID
    suggestionsBox.style.marginTop = "4px";
    suggestionsBox.style.display = "none";

    button.addEventListener("click", () => {
      const existingSuggestions = document.getElementById(`suggestions-${context.replace(/\s+/g, '-')}`);
      if (existingSuggestions && existingSuggestions.parentNode === box) {
        console.log("📌 Toggling existing suggestions for:", context, "Current display:", existingSuggestions.style.display);
        existingSuggestions.style.display = existingSuggestions.style.display === "none" ? "block" : "none"; // Toggle visibility
      } else {
        console.log("📌 Generating new suggestions for:", context);
        chrome.runtime.sendMessage(
          { action: "generateSentences", keywords: inputText, intent: context },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("❌ Error generating sentences:", chrome.runtime.lastError);
              const fallback = getContextSpecificSentences(inputText, context, true);
              renderSentenceSuggestions(fallback, suggestionsBox, textarea, context);
            } else if (response.error) {
              console.error("❌ API error for sentences:", response.error);
              const fallback = getContextSpecificSentences(inputText, context, true);
              renderSentenceSuggestions(fallback, suggestionsBox, textarea, context);
            } else {
              console.log("📝 Received AI sentences:", response.sentences);
              renderSentenceSuggestions(response.sentences, suggestionsBox, textarea, context);
            }
            if (box.contains(suggestionsBox)) {
              box.removeChild(suggestionsBox); // Remove if already present to avoid duplication
            }
            box.insertBefore(suggestionsBox, button.nextSibling); // Insert below the button
            suggestionsBox.style.display = "block";
          }
        );
      }
    });

    box.appendChild(button);
    if (suggestionsBox.children.length > 0 && !box.contains(suggestionsBox)) box.insertBefore(suggestionsBox, button.nextSibling); // Ensure initial placement
  });
}

function renderSentenceSuggestions(sentences, suggestionsBox, textarea, context) {
  suggestionsBox.innerHTML = ""; // Clear previous suggestions
  sentences.forEach((sentence, index) => {
    const suggestion = document.createElement("div");
    suggestion.textContent = `${index + 1}. ${sentence}`;
    suggestion.style.cssText = "margin-left:20px;padding:2px 6px;background:rgba(220,240,255,0.5);border-radius:4px;cursor:pointer;font-size:11px;";
    suggestion.onmouseover = () => suggestion.style.background = "rgba(200,230,255,0.7)";
    suggestion.onmouseout = () => suggestion.style.background = "rgba(220,240,255,0.5)";
    suggestion.onclick = (e) => {
      e.stopPropagation();
      if (textarea.isContentEditable) {
        textarea.innerText = sentence;
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.focus();
      } else {
        textarea.value = sentence;
        textarea.dispatchEvent(new Event("input"));
        textarea.focus();
      }
      sendUsageData(sentence, context);
    };
    suggestionsBox.appendChild(suggestion);
  });
}

function getContextSpecificSentences(keywords, context, firstPerson = false) {
  const lowerKeywords = keywords.toLowerCase();
  const parts = keywords.trim().split(/\s+/).filter(word => word);
  let subject = parts.join(" ");
  const baseAction = firstPerson ? "I want to" : ""; // Prefix for first-person
  const sentences = [];
  switch (context) {
    case "Find":
      sentences.push(`${baseAction} find ${subject} nearby`);
      sentences.push(`${baseAction} find ${subject} online`);
      sentences.push(`${baseAction} find ${subject} in stores`);
      break;
    case "Buy":
      sentences.push(`${baseAction} buy ${subject} online`);
      sentences.push(`${baseAction} buy ${subject} in a store`);
      sentences.push(`${baseAction} buy ${subject} at a discount`);
      break;
    case "Repair":
      sentences.push(`${baseAction} repair ${subject} at a local shop`);
      sentences.push(`${baseAction} repair ${subject} with online service`);
      sentences.push(`${baseAction} repair ${subject} under warranty`);
      break;
    case "Safety Check":
      sentences.push(`${baseAction} check the safety of ${subject} for kids`);
      sentences.push(`${baseAction} check the safety of ${subject} for adults`);
      sentences.push(`${baseAction} check the safety of ${subject} for travel`);
      break;
    case "Locate":
      sentences.push(`${baseAction} locate ${subject} in this city`);
      sentences.push(`${baseAction} locate ${subject} at a mall`);
      sentences.push(`${baseAction} locate ${subject} at an online retailer`);
      break;
    case "Explain":
      sentences.push(`${baseAction} explain ${subject} in simple terms`);
      sentences.push(`${baseAction} explain ${subject} with examples`);
      sentences.push(`${baseAction} explain ${subject} step by step`);
      break;
    case "Build":
      sentences.push(`${baseAction} build ${subject} with basic tools`);
      sentences.push(`${baseAction} build ${subject} from scratch`);
      sentences.push(`${baseAction} build ${subject} with advanced parts`);
      break;
    case "Design":
      sentences.push(`${baseAction} design ${subject} for users`);
      sentences.push(`${baseAction} design ${subject} for style`);
      sentences.push(`${baseAction} design ${subject} for functionality`);
      break;
    case "Summarize":
      sentences.push(`${baseAction} summarize ${subject} with key points`);
      sentences.push(`${baseAction} summarize ${subject} in brief`);
      sentences.push(`${baseAction} summarize ${subject} with highlights`);
      break;
    case "Write":
      sentences.push(`${baseAction} write about ${subject} with clarity`);
      sentences.push(`${baseAction} describe ${subject} features`);
      sentences.push(`${baseAction} review ${subject} performance`);
      break;
    default:
      sentences.push(`${baseAction} write about ${subject} with clarity`);
      sentences.push(`${baseAction} describe ${subject} features`);
      sentences.push(`${baseAction} review ${subject} performance`);
  }
  return sentences;
}

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function initialize() {
  console.log("🔍 Searching for input element on", window.location.href);
  const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], [contenteditable="true"], [role="textbox"], input[name="q"]');
  console.log("🔎 Initial element check:", textarea);
  if (!textarea || !textarea.offsetParent) {
    console.log("⏳ No visible input found, observing DOM...");
    const observer = new MutationObserver((mutations) => {
      const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], [contenteditable="true"], [role="textbox"]');
      console.log("🔎 Observed element:", textarea);
      if (textarea && textarea.offsetParent) {
        console.log("✅ Found visible input:", textarea);
        observer.disconnect();
        setupPromptPilot(textarea);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return;
  }
  console.log("✅ Found initial input:", textarea);
  setupPromptPilot(textarea);
}

function setupPromptPilot(textarea) {
  console.log("✅ Prompt input found:", textarea, "Visible:", textarea.offsetParent !== null);
  const { box, toggle } = createSuggestionBox();
  let isBoxVisible = false;

  const handleInput = debounce(() => {
    const userPrompt = textarea.value || textarea.textContent || "";
    console.log("⌨️ User input changed:", userPrompt);
    updateSuggestions(userPrompt, box, toggle, textarea);
    if (userPrompt && !document.getElementById("promptpilot-toggle")) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
    }
  }, 300);

const setupToggle = () => {
  if (!toggle.onclick) {
    toggle.onclick = () => {
      isBoxVisible = !isBoxVisible;
      box.style.display = isBoxVisible ? "block" : "none";
      box.style.opacity = isBoxVisible ? "1" : "0";
      console.log("Toggle clicked, box visible:", isBoxVisible, "Toggle display:", toggle.style.display, "Toggle in DOM:", !!document.getElementById("promptpilot-toggle"));
    };
  }
  if (!document.getElementById("promptpilot-toggle")) {
    document.body.appendChild(toggle);
    toggle.style.display = "block";
  }
};
  setupToggle();
  textarea.addEventListener("input", handleInput);
  textarea.addEventListener("keyup", handleInput);
  textarea.addEventListener("change", handleInput);
  textarea.addEventListener("paste", handleInput);

  const toggleObserver = new MutationObserver(() => {
    if (!document.getElementById("promptpilot-toggle") && !isBoxVisible) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("Reattached toggle due to DOM change");
    }
  });
  toggleObserver.observe(document.body, { childList: true, subtree: true });
}

initialize();