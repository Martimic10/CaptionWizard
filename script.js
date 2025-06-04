let usage = parseInt(localStorage.getItem("captionUsage") || "0");
let isUnlocked = localStorage.getItem("unlocked") === "true";

const outputDiv = document.getElementById("output");
const usageStatus = document.getElementById("usageStatus");
const lockedNotice = document.getElementById("lockedNotice");

updateUsageUI();

async function handleGenerate(type) {
  if (!isUnlocked && usage >= 2) {
    outputDiv.innerText = "You’ve used your 2 free generations.";
    lockedNotice.style.display = "block";
    return;
  }

  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) {
    alert("Please enter a topic.");
    return;
  }

  outputDiv.innerHTML = `<p>Generating your ${type}...</p>`;

  try {
    const response = await fetch("https://captionwizard-8180.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type }),
    });

    const data = await response.json();

    if (!data.captions || !Array.isArray(data.captions)) {
      outputDiv.innerHTML = `<p>❌ Failed to generate ${type}.</p>`;
      return;
    }

    let html = `<h3>Your ${capitalize(type)} Results</h3>`;
    data.captions.forEach((item, index) => {
      html += `
        <div class="caption-card">
          <div class="caption-row">
            <h4>${capitalize(type)} ${index + 1}</h4>
            <div class="caption-actions">
              <button onclick="copyToClipboard('${escapeQuotes(item)}')">Copy</button>
            </div>
          </div>
          <div class="caption-text">${item}</div>
        </div>
      `;
    });

    outputDiv.innerHTML = html;

    if (!isUnlocked) {
      usage++;
      localStorage.setItem("captionUsage", usage);
      updateUsageUI();
    }

  } catch (error) {
    console.error("Client error:", error);
    outputDiv.innerHTML = `<p>❌ Something went wrong. Try again.</p>`;
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
}

function updateUsageUI() {
  if (isUnlocked) {
    usageStatus.innerText = "✅ Unlimited captions unlocked!";
    lockedNotice.style.display = "none";
  } else {
    const remaining = 2 - usage;
    usageStatus.innerText = `${remaining} free generation${remaining === 1 ? "" : "s"} remaining`;
    if (usage >= 2) {
      lockedNotice.style.display = "block";
    }
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeQuotes(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}