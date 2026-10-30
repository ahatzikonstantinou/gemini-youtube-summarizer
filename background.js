// Temporary queue for video URLs
let videoQueue = [];

// Helper to get active language config
function getActiveLanguage(callback) {
  chrome.storage.sync.get({ languages: [], activeLanguage: "" }, (items) => {
    let active = items.languages.find(l => l.code === items.activeLanguage);
    if (!active && items.languages.length > 0) {
      active = items.languages[0];
    }
    callback(active || { code: "en", name: "English", prompt: "What does this video say:\n" });
  });
}

// Function to update context menus dynamically
function updateContextMenus() {
  chrome.contextMenus.removeAll(() => {
    getActiveLanguage((lang) => {
      const count = videoQueue.length;

      // 1. Quick Submit Option
      chrome.contextMenus.create({
        id: "quickSubmitToGemini",
        title: `⚡ Analyze Now (Gemini - ${lang.name})`,
        contexts: ["link", "page"]
      });

      // 2. Add to Queue Option
      chrome.contextMenus.create({
        id: "addVideoToQueue",
        title: "➕ Add Video to Queue",
        contexts: ["link", "page"]
      });

      // 3. Submit Queue Option
      chrome.contextMenus.create({
        id: "submitQueueToGemini",
        title: `🚀 Submit All (${count} videos) to Gemini`,
        contexts: ["all"]
      });
    });
  });
}

// Re-render context menus on install or extension startup
chrome.runtime.onInstalled.addListener(() => {
  // Initialize with a default English setting if empty
  chrome.storage.sync.get("languages", (data) => {
    if (!data.languages || data.languages.length === 0) {
      const defaultLangs = [{ code: "en", name: "English", prompt: "What does this video say:\n" }];
      chrome.storage.sync.set({ languages: defaultLangs, activeLanguage: "en" }, () => {
        updateContextMenus();
      });
    } else {
      updateContextMenus();
    }
  });
});

// Update menus when active language changes in options
chrome.storage.onChanged.addListener((changes) => {
  if (changes.activeLanguage || changes.languages) {
    updateContextMenus();
  }
});

// Context Menu interaction logic
chrome.contextMenus.onClicked.addListener((info, tab) => {
  let videoUrl = info.linkUrl || info.pageUrl;
  const isYouTube = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));

  getActiveLanguage((lang) => {
    // Scenario A: Quick Submit
    if (info.menuItemId === "quickSubmitToGemini" && isYouTube) {
      const promptText = lang.prompt + "\n" + videoUrl;
      const finalUrl = "https://google.com/search?udm=50&q=" + encodeURIComponent(promptText);
      chrome.tabs.create({ url: finalUrl });
    }
    // Scenario B: Add to Queue
    else if (info.menuItemId === "addVideoToQueue" && isYouTube) {
      if (!videoQueue.includes(videoUrl)) {
        videoQueue.push(videoUrl);
        updateContextMenus();
      }
    }
    // Scenario C: Submit Queue
    else if (info.menuItemId === "submitQueueToGemini") {
      if (videoQueue.length > 0) {
        const promptText = lang.prompt + "\n" + videoQueue.join("\n");
        const finalUrl = "https://google.com/search?udm=50&q=" + encodeURIComponent(promptText);
        chrome.tabs.create({ url: finalUrl });
        
        videoQueue = []; // Clear queue
        updateContextMenus();
      }
    }
  });
});
