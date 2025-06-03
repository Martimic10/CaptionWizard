let usage = parseInt(localStorage.getItem("captionUsage") || "0");
let isUnlocked = localStorage.getItem("unlocked") === "true";

const outputDiv = document.getElementById("output");
const usageStatus = document.getElementById("usageStatus");
const lockedNotice = document.getElementById("lockedNotice");

updateUsageUI();

async function handleGenerate(type) {
  if (!isUnlocked && usage >= 2) {
    outputDiv.innerText = "⚠️ You’ve used your 2 free generations.";
    lockedNotice.style.display = "block";
    return;
  }

  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) {
    alert("Please enter a topic.");
    return;
  }

  outputDiv.innerHTML = "<p>Generating... ✨</p>";

  try {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type })
    });

    const data = await response.json();

    if (!data.result) {
      outputDiv.innerHTML = "<p>❌ Failed to generate result.</p>";
      return;
    }

    outputDiv.innerHTML = `
      <div class="caption-card">
        <div class="caption-row">
          <h4>${capitalize(type)}</h4>
          <div class="caption-actions">
            <button onclick="copyToClipboard('${data.result.replace(/'/g, "\\'")}')">Copy</button>
            <button>Like</button>
            <button>Dislike</button>
          </div>
        </div>
        <div class="caption-text">${data.result}</div>
      </div>
    `;

    if (!isUnlocked) {
      usage++;
      localStorage.setItem("captionUsage", usage);
      updateUsageUI();
    }
  } catch (error) {
    console.error("Error:", error);
    outputDiv.innerHTML = "<p>❌ Something went wrong. Try again.</p>";
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Copied to clipboard!");
  });
}

function updateUsageUI() {
  if (isUnlocked) {
    usageStatus.innerText = "✅ Unlimited captions unlocked!";
    lockedNotice.style.display = "none";
  } else {
    usageStatus.innerText = `🆓 ${2 - usage} free generation${2 - usage === 1 ? "" : "s"} remaining`;
    if (usage >= 2) {
      lockedNotice.style.display = "block";
    }
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}