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

  const toggle = document.createElement("div");
  toggle.id = "promptpilot-toggle";
  toggle.textContent = "✨";
  toggle.style.cssText = "position:fixed;bottom:20px;right:20px;padding:8px;background-color:rgba(0,0,0,0.7);color:white;border-radius:50%;cursor:pointer;z-index:99998;display:none;";
  document.body.appendChild(toggle);

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

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  closeBtn.style.cssText = "position:absolute;top:5px;right:5px;cursor:pointer;font-size:16px;";
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
  console.log("🔍 Input text:", inputText, "Length:", inputText.length);
  if (!inputText.trim()) {
    box.style.display = "none";
    toggle.style.display = "none";
    return;
  }

  if (!document.getElementById("promptpilot-toggle")) {
    document.body.appendChild(toggle);
    toggle.style.display = "block";
  }
  box.style.display = "block";
  box.style.opacity = "0";
  setTimeout(() => box.style.opacity = "1", 10);

  chrome.runtime.sendMessage(
    { action: "getAISuggestions", prompt: inputText },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error communicating with background script:", chrome.runtime.lastError);
        renderSuggestions([
          `Act as an expert: ${inputText}`,
          `Explain simply: ${inputText}`,
          `Step-by-step: ${inputText}`
        ], box, textarea, inputText);
        return;
      }
      if (response.error) {
        console.error("❌ API error:", response.error);
        renderSuggestions([
          `Act as an expert: ${inputText}`,
          `Explain simply: ${inputText}`,
          `Step-by-step: ${inputText}`
        ], box, textarea, inputText);
      } else {
        console.log("📌 Received AI suggestions:", response.suggestions);
        renderSuggestions(response.suggestions, box, textarea, inputText);
      }
    }
  );
}

function renderSuggestions(suggestions, box, textarea, inputText) {
  box.innerHTML = "<strong>✨ PromptPilot Suggestions:</strong><br><br>";
  suggestions.forEach((text) => {
    const s = document.createElement("div");
    s.textContent = text;
    Object.assign(s.style, {
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: "rgba(240, 240, 240, 0.8)",
      borderRadius: "6px",
      cursor: "pointer",
      display: "block"
    });
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) s.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    s.addEventListener("click", () => {
      if (textarea.tagName === "TEXTAREA" || textarea.tagName === "INPUT") {
        textarea.value = text;
      } else {
        textarea.textContent = text;
      }
      textarea.focus();
      sendUsageData(inputText, text);
    });
    const copyBtn = document.createElement("span");
    copyBtn.textContent = "📋";
    copyBtn.style.cssText = "margin-left:5px;cursor:pointer;";
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "📋", 1000);
      });
    };
    s.appendChild(copyBtn);
    box.appendChild(s);
  });
}

function initialize() {
  console.log("🔍 Searching for input element on", window.location.href);
  const textarea = document.querySelector('textarea, [contenteditable="true"], [role="textbox"], [data-testid*="prompt"]');
  console.log("🔎 Initial element check:", textarea);
  if (!textarea || !textarea.offsetParent) {
    console.log("⏳ No visible input found, observing DOM...");
    const observer = new MutationObserver((mutations) => {
      const textarea = document.querySelector('textarea, [contenteditable="true"], [role="textbox"], [data-testid*="prompt"]');
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

  const handleInput = () => {
    const userPrompt = textarea.value || textarea.textContent || "";
    console.log("⌨️ User input changed:", userPrompt);
    updateSuggestions(userPrompt, box, toggle, textarea);
    if (userPrompt.trim() && !document.getElementById("promptpilot-toggle")) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
    }
  };

  const setupToggle = () => {
    if (!toggle.onclick) {
      toggle.onclick = () => {
        isBoxVisible = !isBoxVisible;
        box.style.display = isBoxVisible ? "block" : "none";
        box.style.opacity = isBoxVisible ? "1" : "0";
        toggle.style.display = isBoxVisible ? "none" : "block";
        console.log("Toggle clicked, box visible:", isBoxVisible, "Toggle display:", toggle.style.display);
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