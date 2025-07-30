function generateSuggestions() {
  const input = document.getElementById("userInput").value;
  const suggestionsBox = document.getElementById("suggestions");

  if (!input.trim()) {
    suggestionsBox.innerHTML = "<p>Please enter a prompt.</p>";
    return;
  }

  chrome.runtime.sendMessage(
    { action: "getAISuggestions", prompt: input },
    (response) => {
      if (response.error) {
        suggestionsBox.innerHTML = `<p>Error: ${response.error}</p>`;
      } else {
        const suggestions = response.suggestions;
        suggestionsBox.innerHTML = "";
        suggestions.forEach((text) => {
          const div = document.createElement("div");
          div.className = "suggestion";
          div.innerText = text;
          div.onclick = () => navigator.clipboard.writeText(text);
          suggestionsBox.appendChild(div);
        });
      }
    }
  );
}