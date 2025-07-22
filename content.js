console.log("🚀 PromptPilot content script loaded on", window.location.href);

function createSuggestionBox() {
  console.log("🛠️ Creating suggestion box...");
  const container = document.createElement("div");
  container.id = "promptpilot-box-container";
  const shadow = container.attachShadow({ mode: "open" });
  const box = document.createElement("div");
  box.id = "promptpilot-box";
  box.style.display = "none"; // Hidden by default
  box.style.opacity = "0"; // For fade effect
  box.style.transition = "opacity 0.3s ease"; // Smooth fade

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
  toggle.style.display = "none"; // Hidden until needed
  document.body.appendChild(toggle);

  // Initial styling (updated for subtlety)
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

  // Theme awareness
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
    suggestionUsed: suggestion.substring(0, 50), // Truncate to avoid PII
    timestamp: new Date().toISOString(),
    userAction: "suggestion_click"
  };
  fetch('https://your-heroku-app.herokuapp.com/usage', { // Replace with your Heroku app URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usageData)
  }).catch(err => console.error("Usage data send failed:", err));
}

function updateSuggestions(prompt, box, toggle, textarea) {
  const inputText = textarea.value || textarea.textContent || "";
  console.log("🔍 Input text:", inputText, "Length:", inputText.length);
  if (!inputText) {
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
        const fallbackSuggestions = [
          `Act as an expert: ${inputText}`,
          `Explain in simple terms: ${inputText}`,
          `Give step-by-step guidance for: ${inputText}`
        ];
        renderSuggestions(fallbackSuggestions, box, textarea);
        return;
      }
      if (response.error) {
        console.error("❌ API error:", response.error);
        const fallbackSuggestions = [
          `Act as an expert: ${inputText}`,
          `Explain in simple terms: ${inputText}`,
          `Give step-by-step guidance for: ${inputText}`
        ];
        renderSuggestions(fallbackSuggestions, box, textarea);
      } else {
        console.log("📌 Received AI suggestions:", response.suggestions);
        try {
          const suggestions = Array.isArray(response.suggestions) ? response.suggestions : JSON.parse(response.suggestions);
          renderSuggestions(suggestions, box, textarea);
        } catch (e) {
          console.error("❌ Failed to parse suggestions:", e);
          const fallbackSuggestions = [
            `Act as an expert: ${inputText}`,
            `Explain in simple terms: ${inputText}`,
            `Give step-by-step guidance for: ${inputText}`
          ];
          renderSuggestions(fallbackSuggestions, box, textarea);
        }
      }
    }
  );
}

function renderSuggestions(suggestions, box, textarea) {
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
    copyBtn.style.marginLeft = "5px";
    copyBtn.style.cursor = "pointer";
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => copyBtn.textContent = "📋", 1000);
    };
    s.appendChild(copyBtn);
    box.appendChild(s);
  });
}

function initialize() {
  console.log("🔍 Searching for input element on", window.location.href);
  const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], [contenteditable="true"], [role="textbox"]');
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

  const handleInput = () => {
    const userPrompt = textarea.value || textarea.textContent || "";
    console.log("⌨️ User input changed:", userPrompt);
    updateSuggestions(userPrompt, box, toggle, textarea);
    if (userPrompt && !document.getElementById("promptpilot-toggle")) {
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