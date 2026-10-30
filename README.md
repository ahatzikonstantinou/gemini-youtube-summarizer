# Gemini - YouTube Video Summarizer Extension

A lightweight Chrome Extension (Manifest V3) that streamlines extracting and summarizing insights from YouTube videos. It allows users to dynamically batch video links or immediately direct them straight into the **Gemini Web Interface** via the browser's context menu (Right-Click context menu).

Now with full multi-language configurations, custom per-language instructions, and on-the-fly prompt management!

## Features

- **⚡ Quick/Instant Analysis**: Sends a single video directly to Gemini without staging.
- **➕ Queue Management**: Accumulate multiple video links onto a local stack and process them all concurrently in a single workflow.
- **🌐 Dynamic Multi-Language Selection**: Manage multiple interface configurations from the Options Dashboard.
- **✏️ Tailored AI Context Prompts**: Assign specific prompts to different languages.
- **🛠️ Edit & Update Existing Configuration**: Modify and save changes to previously stored languages effortlessly without having to delete and re-enter them.

## 💡 Important Note on Prompt Language

Since Gemini processes the input text as a single unified instruction package, **your custom prompt must explicitly state the desired language of the final output response**. Gemini does not automatically infer the target output language simply from your extension profile name. 

### Examples:
* **For English Outputs:** Use explicit directives like `"Reply in English, what does this video say:"`
* **For Greek Outputs:** Use explicit directives like `"Απάντησε στα ελληνικά τι λέει το βίντεο:"`

## Project File Layout

Ensure all these files are collected within your development workspace root:
- `manifest.json` — System permissions and registration properties.
- `background.js` — Core service worker tracking your queue and dynamic context menu state engines.
- `options.html` — Configuration interface dashboard layout.
- `options.js` — Logical handlers for local browser synchronization, edit mode injections, and state persistence APIs.

## Installation / Setup

1. Clone or download this repository onto your workstation.
2. Open Google Chrome or any Chromium-compatible engine and visit `chrome://extensions/`.
3. Toggle **Developer mode** on using the switcher in the top right corner.
4. Click on **Load unpacked** located at the upper left sidebar.
5. Choose the directory holding your extension files.

## Managing Custom Language Profiles

1. Right-click the extension icon in your active extensions panel and click **Options** (or manage it inside `chrome://extensions`).
2. **Add Profiles:** Fill in the *Name*, *Unique Code* (e.g., `el`, `en`), and your explicit *Target Prompt*, then click **Add Language**.
3. **Edit Profiles:** Click **Edit** next to any configured language entry. The form layout will dynamically adjust to **Update Mode**, locking the unique code parameter while allowing you to refine your prompt directives. Click **Update Language** to save your modifications or hit **Cancel** to abort.
4. Select your target profile as the **Active Language**, save, and right-click on any YouTube hyperlink to pass your payloads to Gemini!