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
  toggle.textContent = "🧠";
  toggle.style.position = "fixed";
  toggle.style.bottom = "20px"; // Original bottom-right position
  toggle.style.right = "20px";
  toggle.style.padding = "8px";
  toggle.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  toggle.style.color = "white";
  toggle.style.borderRadius = "50%";
  toggle.style.cursor = "move";
  toggle.style.zIndex = "99998";
<<<<<<< HEAD
  toggle.style.display = "none";
  toggle.style.userSelect = "none";
=======
  toggle.style.display = "block";
  toggle.style.userSelect = "none"; // Prevent text selection
>>>>>>> c0dc0d9 (First commit)
  document.body.appendChild(toggle);

  // Initial styling for suggestion box
  Object.assign(box.style, {
    position: "fixed",
    bottom: "80px", // Original bottom-right position
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
    color: "#333",
<<<<<<< HEAD
    userSelect: "none",
    position: "relative"
=======
    userSelect: "none" // Prevent text selection during drag
>>>>>>> c0dc0d9 (First commit)
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
  console.log("✅ Suggestion box and toggle created");

<<<<<<< HEAD
=======
  // Make box and toggle move together
>>>>>>> c0dc0d9 (First commit)
  makeDraggable(box, toggle, dragHandle);

  return { box, toggle };
}

<<<<<<< HEAD
function makeDraggable(box, toggle, dragHandle) {
  let isDragging = false;
  let currentRight = 20;
  let currentBottom = 80;
  let initialX, initialY;

=======
// Function to make box and toggle draggable together, using bottom-right positioning
function makeDraggable(box, toggle, dragHandle) {
  let isDragging = false;
  let currentRight = 20; // Initial right position
  let currentBottom = 80; // Initial bottom position for box
  let initialX, initialY;

  // Allow dragging from either the handle or toggle
>>>>>>> c0dc0d9 (First commit)
  [dragHandle, toggle].forEach((el) => {
    el.addEventListener("mousedown", (e) => {
      initialX = e.clientX - (window.innerWidth - currentRight);
      initialY = e.clientY - (window.innerHeight - currentBottom);
      isDragging = true;
<<<<<<< HEAD
      e.preventDefault();
=======
      e.preventDefault(); // Prevent text selection
>>>>>>> c0dc0d9 (First commit)
      console.log("🚀 Started dragging, initial position:", { right: currentRight, bottom: currentBottom });
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      e.preventDefault();
      currentRight = window.innerWidth - (e.clientX - initialX);
      currentBottom = window.innerHeight - (e.clientY - initialY);

<<<<<<< HEAD
      currentRight = Math.max(10, Math.min(currentRight, window.innerWidth - 10));
      currentBottom = Math.max(10, Math.min(currentBottom, window.innerHeight - 10));

=======
      // Clamp positions to keep elements on-screen (10px margin from edges)
      currentRight = Math.max(10, Math.min(currentRight, window.innerWidth - 10));
      currentBottom = Math.max(10, Math.min(currentBottom, window.innerHeight - 10));

      // Update box position
>>>>>>> c0dc0d9 (First commit)
      box.style.right = `${currentRight}px`;
      box.style.bottom = `${currentBottom}px`;
      box.style.left = "auto";
      box.style.top = "auto";

<<<<<<< HEAD
=======
      // Update toggle position (60px below box, aligned right)
>>>>>>> c0dc0d9 (First commit)
      toggle.style.right = `${currentRight}px`;
      toggle.style.bottom = `${currentBottom - 60}px`;
      toggle.style.left = "auto";
      toggle.style.top = "auto";

      console.log("🚀 Dragging, new position:", { boxRight: currentRight, boxBottom: currentBottom, toggleBottom: currentBottom - 60 });
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    console.log("🚀 Stopped dragging, final position:", { boxRight: currentRight, boxBottom: currentBottom, toggleBottom: currentBottom - 60 });
  });
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

function getChatHistory() {
  const history = [];
<<<<<<< HEAD
=======
  // Broad selectors for chat messages on ChatGPT and Grok
>>>>>>> c0dc0d9 (First commit)
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
<<<<<<< HEAD
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
  const suggestions = predictNextWords(inputText);
  const suggestionDiv = document.createElement("div");
  suggestionDiv.style.cssText = "position: absolute; top: -30px; left: 0; opacity: 0; transition: opacity 0.3s; font-size: 12px;";
  suggestions.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.cssText = "margin-right: 5px; cursor: pointer; background: rgba(0,0,0,0.1); padding: 2px 5px;";
    span.onclick = () => {
      textarea.value += " " + word;
      suggestionDiv.style.opacity = "0";
      sendUsageData(textarea.value, word);
    };
    suggestionDiv.appendChild(span);
  });
  textarea.parentNode.appendChild(suggestionDiv);
  setTimeout(() => suggestionDiv.style.opacity = "0.5", 10);
  setTimeout(() => suggestionDiv.remove(), 2000);
=======
  console.log("🔍 Extracted chat history:", history); // Debug log for history
  return history.join('\n\n'); // Format as a string with line breaks
>>>>>>> c0dc0d9 (First commit)
}

function updateSuggestions(inputText, box, toggle, textarea) {
  console.log("🔍 Input text:", inputText, "Length:", inputText.length);
  if (!inputText.trim()) {
    box.style.display = "none";
    toggle.style.display = "block";
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
  box.innerHTML = "<strong>🧠 Suggested Intents:</strong><br><br>";
  intents.forEach((context) => {
    const button = document.createElement("div");
<<<<<<< HEAD
=======
    // Add text and refresh icon
>>>>>>> c0dc0d9 (First commit)
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
              box.removeChild(suggestionsBox);
            }
            box.insertBefore(suggestionsBox, button.nextSibling);
            suggestionsBox.style.display = "block";
          }
        );
      }
    });

    box.appendChild(button);
    if (suggestionsBox.children.length > 0 && !box.contains(suggestionsBox)) box.insertBefore(suggestionsBox, button.nextSibling);
  });
}

function renderSentenceSuggestions(sentences, suggestionsBox, textarea, context) {
  suggestionsBox.innerHTML = "";
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

function initialize() {
  console.log("🔍 Searching for input element on", window.location.href);
<<<<<<< HEAD
<<<<<<< HEAD
  const textarea = document.querySelector('textarea, [contenteditable="true"], [role="textbox"], [data-testid*="prompt"]');
=======
  const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], [contenteditable="true"], [role="textbox"], [role="combobox"], .prompt-input, .chat-input');
>>>>>>> 7dc12b3 (modified prompt)
  console.log("🔎 Initial element check:", textarea);
  if (!textarea || !textarea.offsetParent) {
    console.log("⏳ No visible input found, observing DOM...");
    const observer = new MutationObserver((mutations) => {
      const textarea = document.querySelector('textarea, [contenteditable="true"], [role="textbox"], [data-testid*="prompt"]');
      console.log("🔎 Observed element:", textarea);
=======
  const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], textarea[aria-label="Ask Grok anything"], [contenteditable="true"][id="prompt-textarea"], [role="textbox"]');
  console.log("🔎 Initial element check:", textarea ? textarea.outerHTML : 'No input found yet');
  if (!textarea || !textarea.offsetParent) {
    console.log("⏳ No visible input found, observing DOM...");
    const observer = new MutationObserver((mutations) => {
      const textarea = document.querySelector('textarea[data-testid="prompt-textarea"], textarea[aria-label="Ask Grok anything"], [contenteditable="true"][id="prompt-textarea"], [role="textbox"]');
      console.log("🔎 Observed element:", textarea ? textarea.outerHTML : 'Still null');
>>>>>>> c0dc0d9 (First commit)
      if (textarea && textarea.offsetParent) {
        console.log("✅ Found visible input:", textarea.outerHTML);
        observer.disconnect();
        setupPromptPilot(textarea);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return;
  }
  console.log("✅ Found initial input:", textarea.outerHTML);
  setupPromptPilot(textarea);
}

function setupPromptPilot(textarea) {
  console.log("✅ Prompt input found:", textarea.outerHTML, "Visible:", textarea.offsetParent !== null);
  const { box, toggle } = createSuggestionBox();
  let isBoxVisible = false;

  const handleInput = debounce(() => {
    const userPrompt = textarea.value || textarea.textContent || "";
    console.log("⌨️ User input changed:", userPrompt);
    updateSuggestions(userPrompt, box, toggle, textarea);
    if (userPrompt.trim() && !document.getElementById("promptpilot-toggle")) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("🔄 Reattached toggle due to missing DOM element");
    }
    if (userPrompt) showInlineSuggestions(userPrompt, textarea);
  }, 300);

  const setupToggle = () => {
    if (!toggle.onclick) {
      toggle.onclick = () => {
        isBoxVisible = !isBoxVisible;
        box.style.display = isBoxVisible ? "block" : "none";
        box.style.opacity = isBoxVisible ? "1" : "0";
<<<<<<< HEAD
        toggle.style.display = isBoxVisible ? "none" : "block";
=======
        toggle.style.display = "block"; // Ensure toggle stays visible
>>>>>>> c0dc0d9 (First commit)
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

  textarea.addEventListener("input", handleInput);
  textarea.addEventListener("keyup", handleInput);
  textarea.addEventListener("change", handleInput);
  textarea.addEventListener("paste", handleInput);

  const toggleObserver = new MutationObserver((mutations) => {
    if (!document.getElementById("promptpilot-toggle") && !isBoxVisible) {
      document.body.appendChild(toggle);
      toggle.style.display = "block";
      console.log("🔄 Reattached toggle due to DOM mutation");
<<<<<<< HEAD
      setupToggle();
=======
      setupToggle(); // Reapply click handler if reattached
>>>>>>> c0dc0d9 (First commit)
    }
  });
  toggleObserver.observe(document.body, { childList: true, subtree: true });
}

initialize();