function generateSuggestions() {
  const input = document.getElementById("userInput").value;
  const suggestionsBox = document.getElementById("suggestions");
  console.log("📝 Generating suggestions for input:", input);

  if (!input.trim()) {
    suggestionsBox.innerHTML = "<p>Please enter a prompt.</p>";
    return;
  }

  chrome.runtime.sendMessage(
    { action: "getAISuggestions", prompt: input },
    (response) => {
      console.log("📡 Popup received response:", response);
      if (response.error) {
        suggestionsBox.innerHTML = `<p>Error: ${response.error}</p>`;
      } else {
        const suggestions = response.suggestions;
        suggestionsBox.innerHTML = "";
        suggestions.forEach((text) => {
          const div = document.createElement("div");
          div.className = "suggestion";
          div.innerText = text;
          div.onclick = () => {
            navigator.clipboard.writeText(text)
              .then(() => console.log("✅ Copied to clipboard:", text))
              .catch(err => console.error("❌ Clipboard error:", err));
          };
          suggestionsBox.appendChild(div);
        });
      }
    }
  );
}