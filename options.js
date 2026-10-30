// DOM Elements
const activeLanguageSelect = document.getElementById('activeLanguage');
const saveActiveBtn = document.getElementById('saveActive');
const statusDiv = document.getElementById('status');
const formTitle = document.getElementById('formTitle');
const editingCodeInput = document.getElementById('editingCode');
const newLangName = document.getElementById('newLangName');
const newLangCode = document.getElementById('newLangCode');
const newLangPrompt = document.getElementById('newLangPrompt');
const addLanguageBtn = document.getElementById('addLanguage');
const cancelEditBtn = document.getElementById('cancelEdit');
const languageListDiv = document.getElementById('languageList');

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get({ languages: [], activeLanguage: "" }, (items) => {
    activeLanguageSelect.innerHTML = '';
    languageListDiv.innerHTML = '';

    items.languages.forEach(lang => {
      // Add option to select list
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      if (lang.code === items.activeLanguage) {
        option.selected = true;
      }
      activeLanguageSelect.appendChild(option);

      // Add to managed list
      const langDiv = document.createElement('div');
      langDiv.className = 'lang-item';
      langDiv.innerHTML = `
        <strong>${lang.name} (${lang.code})</strong>
        <p style="margin: 5px 0 0 0; font-size:13px; color:#555;">Prompt: <em>${lang.prompt}</em></p>
        <div class="btn-container">
          <button class="edit-btn" data-code="${lang.code}" data-name="${lang.name}" data-prompt="${lang.prompt}">Edit</button>
          <button class="remove-btn" data-code="${lang.code}">Remove</button>
        </div>
      `;
      languageListDiv.appendChild(langDiv);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeLanguage(e.target.getAttribute('data-code'));
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.getAttribute('data-code');
        const name = e.target.getAttribute('data-name');
        const prompt = e.target.getAttribute('data-prompt');
        startEdit(code, name, prompt);
      });
    });
  });
}

// Enter Edit Mode
function startEdit(code, name, prompt) {
  formTitle.textContent = `✍️ Edit Language: ${name}`;
  editingCodeInput.value = code;
  newLangName.value = name;
  newLangCode.value = code;
  newLangCode.disabled = true; // Code should not be changed as it serves as the unique key
  newLangPrompt.value = prompt;
  addLanguageBtn.textContent = '💾 Update Language';
  cancelEditBtn.style.display = 'inline-block';
}

// Exit Edit Mode / Reset Form
function resetForm() {
  formTitle.textContent = 'Add a New Language';
  editingCodeInput.value = '';
  newLangName.value = '';
  newLangCode.value = '';
  newLangCode.disabled = false;
  newLangPrompt.value = '';
  addLanguageBtn.textContent = '➕ Add Language';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', resetForm);

// Save active language selection
saveActiveBtn.addEventListener('click', () => {
  const activeCode = activeLanguageSelect.value;
  chrome.storage.sync.set({ activeLanguage: activeCode }, () => {
    showStatus('Active language updated successfully!');
  });
});

// Handle both Add and Update actions
addLanguageBtn.addEventListener('click', () => {
  const name = newLangName.value.trim();
  const code = newLangCode.value.trim().toLowerCase();
  const prompt = newLangPrompt.value.trim();
  const isEditing = editingCodeInput.value !== '';

  if (!name || !code || !prompt) {
    alert('Please fill out all fields.');
    return;
  }

  chrome.storage.sync.get({ languages: [], activeLanguage: "" }, (items) => {
    let languages = items.languages;

    if (isEditing) {
      // Update existing language
      languages = languages.map(l => l.code === code ? { name, code, prompt } : l);
      chrome.storage.sync.set({ languages }, () => {
        resetForm();
        loadSettings();
        showStatus('Language updated successfully!');
      });
    } else {
      // Add new language setup
      if (languages.some(l => l.code === code)) {
        alert('A language with this code already exists!');
        return;
      }

      languages.push({ name, code, prompt });
      let nextActive = items.activeLanguage || code;

      chrome.storage.sync.set({ languages, activeLanguage: nextActive }, () => {
        resetForm();
        loadSettings();
        showStatus('Language added successfully!');
      });
    }
  });
});

// Remove a language configuration
function removeLanguage(code) {
  if (editingCodeInput.value === code) {
    resetForm(); // Reset if the language being deleted was in edit mode
  }

  chrome.storage.sync.get({ languages: [], activeLanguage: "" }, (items) => {
    let languages = items.languages.filter(l => l.code !== code);
    let activeLanguage = items.activeLanguage;
    
    if (activeLanguage === code) {
      activeLanguage = languages.length > 0 ? languages[0].code : "";
    }

    chrome.storage.sync.set({ languages, activeLanguage }, () => {
      loadSettings();
      showStatus('Language removed.');
    });
  });
}

function showStatus(msg) {
  statusDiv.textContent = msg;
  setTimeout(() => { statusDiv.textContent = ''; }, 3000);
}

// Initial initialization load
document.addEventListener('DOMContentLoaded', loadSettings);
