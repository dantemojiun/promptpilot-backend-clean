console.log("🚀 PromptPilot content script loaded on", window.location.href);
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Make it a 32-bit integer
  }
  return hash.toString(16); // Turn into hex code
}
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

  // Drag handle for the suggestion box
  const dragHandle = document.createElement("div");
  dragHandle.style.width = "100%";
  dragHandle.style.height = "10px";
  dragHandle.style.backgroundColor = "#ccc";
  dragHandle.style.cursor = "move";
  dragHandle.style.borderRadius = "3px 3px 0 0";
  dragHandle.style.marginBottom = "5px";
  box.appendChild(dragHandle);

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
  toggle.style.zIndex = "1000000";
  toggle.style.display = "block";
  toggle.style.userSelect = "none";
  document.body.appendChild(toggle);
  console.log("✅ Toggle appended to body:", document.getElementById("promptpilot-toggle"));

  // Initial styling for suggestion box
  Object.assign(box.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: "1000001",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    maxWidth: "300px",
    width: "90%",
    maxHeight: "200px",
    overflowY: "auto",
    color: "#333",
    userSelect: "none"
  });

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode) {
    box.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
    box.style.color = "#ddd";
    box.style.borderColor = "#555";
    dragHandle.style.backgroundColor = "#555";
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
    console.log("🔒 Closed suggestion box, toggle visible");
  };
  box.appendChild(closeBtn);

  shadow.appendChild(box);
  document.body.appendChild(container);
  console.log("✅ Suggestion box container appended:", document.getElementById("promptpilot-box-container"));

  makeDraggable(box, toggle, dragHandle);

  return { box, toggle };
}

function makeDraggable(box, toggle, dragHandle) {
  let isDragging = false;
  let currentRight = 20;
  let currentBottom = 80;
  let initialX, initialY;

  [dragHandle, toggle].forEach((el) => {
    el.addEventListener("mousedown", (e) => {
      initialX = e.clientX - (window.innerWidth - currentRight);
      initialY = e.clientY - (window.innerHeight - currentBottom);
      isDragging = true;
      e.preventDefault();
      console.log("🚀 Started dragging, initial position:", { right: currentRight, bottom: currentBottom });
    });
  });

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  function handleMouseMove(e) {
    if (isDragging) {
      e.preventDefault();
      currentRight = window.innerWidth - (e.clientX - initialX);
      currentBottom = window.innerHeight - (e.clientY - initialY);

      currentRight = Math.max(10, Math.min(currentRight, window.innerWidth - 10));
      currentBottom = Math.max(10, Math.min(currentBottom, window.innerHeight - 10));

      box.style.right = `${currentRight}px`;
      box.style.bottom = `${currentBottom}px`;
      box.style.left = "auto";
      box.style.top = "auto";

      toggle.style.right = `${currentRight}px`;
      toggle.style.bottom = `${currentBottom - 60}px`;
      toggle.style.left = "auto";
      toggle.style.top = "auto";

      console.log("🚀 Dragging, new position:", { boxRight: currentRight, boxBottom: currentBottom, toggleBottom: currentBottom - 60 });
    }
  }

  function handleMouseUp() {
    isDragging = false;
    console.log("🚀 Stopped dragging, final position:", { boxRight: currentRight, boxBottom: currentBottom, toggleBottom: currentBottom - 60 });
  }

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function sendUsageData(input, suggestion) {
  const usageData = {
    sessionId: crypto.randomUUID(),
    inputLength: input.length,
    suggestionUsed: simpleHash(suggestion.substring(0, 50)),
    timestamp: new Date().toISOString(),
    userAction: "suggestion_click"
  };
  fetch('https://promptpilot-app-4c3dd6ade6e0.herokuapp.com/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usageData)
  }).then(() => console.log("✅ Usage data sent")).catch(err => console.error("❌ Usage data send failed:", err));
}

function getChatHistory() {
  const history = [];
  const messageElements = document.querySelectorAll('[data-testid^="conversation-turn"], [role="message"], .message, .user-message, .assistant-message, .text-message, .chat-message, .prompt-response, .response-text');
  messageElements.forEach((el) => {
    let role = 'Unknown';
    if (el.querySelector('.user-icon') || el.classList.contains('user-turn') || el.classList.contains('user-message')) {
      role = 'User';
    } else if (el.querySelector('.ai-icon') || el.classList.contains('agent-turn') || el.classList.contains('assistant-message')) {
      role = 'AI';
    }
    const text = el.textContent.trim();
    if (text) {
      history.push(`${role}: ${text}`);
    }
  });
  console.log("🔍 Extracted chat history:", history);
  return history.join('\n\n');
}

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function inferContext(inputText) {
  if (inputText.includes("code") || inputText.includes("build")) return "coder";
  if (inputText.includes("explain") || inputText.includes("teach")) return "educator";
  return "general";
}

function predictNextWords(inputText) {
  const wordMap = {
    "explain": ["to", "how", "in"],
    "build": ["a", "an", "with"],
    "design": ["a", "an", "for"]
  };
  const lastWord = inputText.split(" ").pop();
  return wordMap[lastWord] || ["to", "the", "and"];
}

function generateCompletions(inputText) {
  const patterns = {
    "explain": ["explain to me how it works", "explain in simple terms"],
    "build": ["build a simple example", "build with step-by-step"],
    "design": ["design a basic layout", "design for usability"]
  };
  const lastWord = inputText.split(" ").pop();
  return patterns[lastWord] || [];
}

function showInlineSuggestions(inputText, textarea) {
  if (!textarea || !textarea.parentNode) return;
  const suggestions = predictNextWords(inputText);
  const suggestionDiv = document.createElement("div");
  suggestionDiv.style.cssText = "position: absolute; top: -30px; left: 0; opacity: 0; transition: opacity 0.3s; font-size: 12px; z-index: 1000002;";
  suggestions.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.cssText = "margin-right: 5px; cursor: pointer; background: rgba(0,0,0,0.1); padding: 2px 5px;";
    span.onclick = () => {
      if (textarea.isContentEditable) {
        textarea.innerText += " " + word;
      } else {
        textarea.value += " " + word;
      }
      suggestionDiv.style.opacity = "0";
      sendUsageData(textarea.value || textarea.innerText, word);
    };
    suggestionDiv.appendChild(span);
  });
  textarea.parentNode.appendChild(suggestionDiv);
  setTimeout(() => suggestionDiv.style.opacity = "0.5", 10);
  setTimeout(() => suggestionDiv.remove(), 2000);
}

function updateSuggestions(inputText, box, toggle, textarea) {
  console.log("🔍 Input text:", inputText, "Length:", inputText.length);
  if (!inputText.trim()) {
    box.style.display = "none";
    toggle.style.display = "block";
    console.log("🛑 No input, hiding box");
    return;
  }

  box.style.display = "block";
  box.style.opacity = "0";
  setTimeout(() => {
    box.style.opacity = "1";
    console.log("🛠️ Showing suggestion box");
  }, 10);

  chrome.runtime.sendMessage(
    { action: "generateIntents", keywords: inputText },
    (response) => {
      console.log("📡 chrome.runtime.sendMessage response:", response, "Error:", chrome.runtime.lastError ? chrome.runtime.lastError.message : null);
      if (chrome.runtime.lastError && !response) {
        console.error("❌ Error communicating with background script:", chrome.runtime.lastError.message);
        renderSuggestions(["Find", "Buy", "Explain"], box, textarea, inputText);
        return;
      }
      if (response.error) {
        console.error("❌ API error:", response.error);
        renderSuggestions(["Find", "Buy", "Explain"], box, textarea, inputText);
      } else {
        console.log("📌 Received AI intents:", response.intents);
        renderSuggestions(response.intents, box, textarea, inputText);
      }
    }
  );
}

function renderSuggestions(intents, box, textarea, inputText) {
  box.innerHTML = "<strong>✨ Suggested Intents:</strong><br><br>";
  console.log("🛠️ Rendering intents:", intents);
  intents.forEach((context) => {
    const button = document.createElement("div");
    button.innerHTML = `${context} <span style="font-size: 10px; margin-left: 5px;">🔄</span>`;
    Object.assign(button.style, {
      padding: "8px",
      marginBottom: "4px",
      backgroundColor: "rgba(240, 240, 240, 0.8)",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    });
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) button.style.backgroundColor = "rgba(50, 50, 50, 0.8)";

    let suggestionsBox = document.createElement("div");
    suggestionsBox.id = `suggestions-${context.replace(/\s+/g, '-')}`;
    suggestionsBox.style.marginTop = "4px";
    suggestionsBox.style.display = "none";

    button.addEventListener("click", () => {
      const existingSuggestions = document.getElementById(`suggestions-${context.replace(/\s+/g, '-')}`);
      if (existingSuggestions && existingSuggestions.parentNode === box) {
        console.log("📌 Toggling existing suggestions for:", context, "Current display:", existingSuggestions.style.display);
        existingSuggestions.style.display = existingSuggestions.style.display === "none" ? "block" : "none";
      } else {
        console.log("📌 Generating new suggestions for:", context);
        chrome.runtime.sendMessage(
          { action: "generateSentences", keywords: inputText, intent: context, history: getChatHistory() },
          (response) => {
            console.log("📡 chrome.runtime.sendMessage for sentences response:", response, "Error:", chrome.runtime.lastError ? chrome.runtime.lastError.message : null);
            if (chrome.runtime.lastError && !response) {
              console.error("❌ Error generating sentences:", chrome.runtime.lastError.message);
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
            box.insertBefore(suggestionsBox, button.nextSibling);
            suggestionsBox.style.display = "block";
          }
        );
      }
    });

    box.appendChild(button);
  });
  console.log("🛠️ Suggestion box HTML:", box.innerHTML);
}

function renderSentenceSuggestions(sentences, suggestionsBox, textarea, context) {
  suggestionsBox.innerHTML = "";
  console.log("🛠️ Rendering sentences:", sentences);
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
  const baseAction = firstPerson ? "I want to" : "";
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

function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return (
    element.offsetParent !== null &&
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    parseFloat(style.height) > 0 &&
    element.getAttribute("aria-hidden") !== "true" &&
    element.getAttribute("tabindex") !== "-1"
  );
}

function initialize() {
  console.log("🔍 Initializing PromptPilot on", window.location.href);
  const { box, toggle } = createSuggestionBox();
  let textarea = null;
  let inputInitialized = false;

  const tryInitializeInput = () => {
    console.log("🔍 Searching for input element...");
    textarea = document.querySelector(
      '[data-testid="prompt-textarea"], [name="prompt-textarea"], textarea:not([aria-hidden="true"]):not([tabindex="-1"]):not([style*="visibility: hidden"]):not([style*="height: 0px"]):not([aria-label*="Grammarly"]), [contenteditable="true"]:not([aria-hidden="true"]):not([tabindex="-1"]), [role="textbox"]'
    );
    console.log("🔎 Initial element check:", textarea);
    if (textarea && isElementVisible(textarea)) {
      console.log("✅ Found visible input:", textarea.outerHTML);
      inputInitialized = true;
      setupPromptPilot(textarea, box, toggle);
      return true;
    }
    return false;
  };

  // Try initial detection after page load
  window.addEventListener('load', () => {
    if (tryInitializeInput()) return;

    console.log("⏳ No visible input found, observing DOM...");
    const observer = new MutationObserver((mutations) => {
      if (inputInitialized) return;
      if (tryInitializeInput()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Fallback: Initialize after timeout if no input found
    setTimeout(() => {
      if (!inputInitialized) {
        console.log("⚠️ No input found after timeout, initializing with dummy textarea");
        textarea = document.createElement("div");
        inputInitialized = true;
        setupPromptPilot(textarea, box, toggle);
        // Comment out test input to avoid showing "test input" intents
        // updateSuggestions("test input", box, toggle, textarea);
      }
    }, 5000);
  });

  // Document-level event listener for input events
  document.addEventListener("input", (e) => {
    if (e.target.matches('[data-testid="prompt-textarea"], [name="prompt-textarea"], textarea:not([aria-hidden="true"]):not([tabindex="-1"]), [contenteditable="true"]:not([aria-hidden="true"]), [role="textbox"]') && isElementVisible(e.target)) {
      console.log("🔥 Document input event:", e.target.value || e.target.textContent);
      textarea = e.target;
      setupPromptPilot(textarea, box, toggle);
    }
  }, true);
}

function setupPromptPilot(textarea, box, toggle) {
  console.log("✅ Prompt input found:", textarea.outerHTML, "Visible:", isElementVisible(textarea));
  let isBoxVisible = false;
  let lastInput = "";

  const handleInput = debounce(() => {
    const userPrompt = textarea.value || textarea.textContent || "";
    if (userPrompt === lastInput) {
      console.log("🛑 Input unchanged, skipping update");
      return;
    }
    lastInput = userPrompt;
    console.log("⌨️ User input changed:", userPrompt);
    updateSuggestions(userPrompt, box, toggle, textarea);
    if (userPrompt.trim() && !document.getElementById("promptpilot-toggle")) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("🔄 Reattached toggle due to missing DOM element");
    }
    if (userPrompt) showInlineSuggestions(userPrompt, textarea);
  }, 500);

  const setupToggle = () => {
    if (!toggle.onclick) {
      toggle.onclick = () => {
        isBoxVisible = !isBoxVisible;
        box.style.display = isBoxVisible ? "block" : "none";
        box.style.opacity = isBoxVisible ? "1" : "0";
        toggle.style.display = "block";
        console.log("Toggle clicked, box visible:", isBoxVisible, "Toggle display:", toggle.style.display, "Toggle in DOM:", !!document.getElementById("promptpilot-toggle"));
      };
    }
    if (!document.getElementById("promptpilot-toggle")) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("🔄 Reattached toggle in setupToggle");
    }
  };
  setupToggle();

  if (textarea && isElementVisible(textarea)) {
    textarea.addEventListener("input", (e) => {
      if (e.target.tagName.toLowerCase() === "textarea" || e.target.isContentEditable) {
        console.log("🔥 Input event fired:", e.target.value || e.target.textContent);
        handleInput();
      }
    });
    textarea.addEventListener("keyup", (e) => {
      if (e.target.tagName.toLowerCase() === "textarea" || e.target.isContentEditable) {
        console.log("🔥 Keyup event fired:", e.target.value || e.target.textContent);
        handleInput();
      }
    });
    textarea.addEventListener("change", (e) => {
      if (e.target.tagName.toLowerCase() === "textarea" || e.target.isContentEditable) {
        console.log("🔥 Change event fired:", e.target.value || e.target.textContent);
        handleInput();
      }
    });
    textarea.addEventListener("paste", (e) => {
      if (e.target.tagName.toLowerCase() === "textarea" || e.target.isContentEditable) {
        console.log("🔥 Paste event fired:", e.clipboardData.getData('text'));
        handleInput();
      }
    });

    const container = textarea.closest('form, div') || textarea.parentNode;
    container.addEventListener("input", (e) => {
      if ((e.target.tagName.toLowerCase() === "textarea" || e.target.isContentEditable) && isElementVisible(e.target)) {
        const userPrompt = e.target.value || e.target.textContent || "";
        if (userPrompt === lastInput) return;
        console.log("🔥 Container input event:", userPrompt);
        handleInput();
      }
    }, true);
  }

  const toggleObserver = new MutationObserver((mutations) => {
    if (!document.getElementById("promptpilot-toggle") && !isBoxVisible) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("🔄 Reattached toggle due to DOM mutation");
      setupToggle();
    }
  });
  toggleObserver.observe(document.body, { childList: true, subtree: true });
}

initialize();