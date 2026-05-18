// Settings
const defaultSettings = {
  pet1: 'Gato',
  pet2: 'Perro',
  person1: 'Alba',
  person2: 'Santi'
};
let settings = JSON.parse(localStorage.getItem('miauguau_settings')) || defaultSettings;

// State
let selectedPet = null;
let selectedPerson = null;
let selectedAction = 'Comida';
let history = JSON.parse(localStorage.getItem('miauguau_history')) || [];

// DOM Elements
const petCards = document.querySelectorAll('.option-card[data-type="pet"]');
const personCards = document.querySelectorAll('.option-card[data-type="person"]');
const actionCards = document.querySelectorAll('.option-card[data-type="action"]');
const actionSection = document.getElementById('action-section');
const submitBtn = document.getElementById('submit-btn');
const historyList = document.getElementById('history-list');
const clearBtn = document.getElementById('clear-btn');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const customDateInput = document.getElementById('custom-date');
const customTimeInput = document.getElementById('custom-time');

// Emojis mapping
const emojis = {
  'pet1': '🐱',
  'pet2': '🐶',
  'person1': '👩🏻',
  'person2': '👨🏻'
};

// Initialize
function init() {
  applySettingsToDOM();
  renderHistory();
  
  // Settings listeners
  settingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Event Listeners for Pet selection
  petCards.forEach(card => {
    card.addEventListener('click', () => {
      petCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPet = card.getAttribute('data-value');
      
      // Show action section for both
      actionSection.classList.remove('hidden');
      
      actionCards.forEach(c => c.classList.remove('selected'));
      
      if (selectedPet === 'pet2') {
        document.getElementById('cat-action-options').style.display = 'none';
        document.getElementById('dog-action-options').style.display = 'grid';
        selectedAction = 'Comida';
        document.querySelector('#dog-action-options .option-card[data-value="Comida"]').classList.add('selected');
      } else {
        document.getElementById('cat-action-options').style.display = 'grid';
        document.getElementById('dog-action-options').style.display = 'none';
        selectedAction = 'Pienso';
        document.querySelector('#cat-action-options .option-card[data-value="Pienso"]').classList.add('selected');
      }
      
      checkSubmitState();
    });
  });

  // Event Listeners for Action selection
  actionCards.forEach(card => {
    card.addEventListener('click', () => {
      actionCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedAction = card.getAttribute('data-value');
    });
  });

  // Event Listeners for Person selection
  personCards.forEach(card => {
    card.addEventListener('click', () => {
      personCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPerson = card.getAttribute('data-value');
      checkSubmitState();
    });
  });

  // Submit action
  submitBtn.addEventListener('click', () => {
    if (selectedPet && selectedPerson) {
      addRecord();
      resetSelection();
    }
  });

  // Clear history
  clearBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar el historial?')) {
      history = [];
      saveHistory();
      renderHistory();
    }
  });
}

function checkSubmitState() {
  if (selectedPet && selectedPerson) {
    submitBtn.removeAttribute('disabled');
  } else {
    submitBtn.setAttribute('disabled', 'true');
  }
}

function resetSelection() {
  selectedPet = null;
  selectedPerson = null;
  selectedAction = null;
  petCards.forEach(c => c.classList.remove('selected'));
  personCards.forEach(c => c.classList.remove('selected'));
  actionCards.forEach(c => c.classList.remove('selected'));
  actionSection.classList.add('hidden');
  checkSubmitState();
}

function addRecord() {
  let recordDate = new Date();
  
  if (customDateInput.value) {
    const [year, month, day] = customDateInput.value.split('-');
    recordDate.setFullYear(year, month - 1, day);
  }
  
  if (customTimeInput.value) {
    const [hours, minutes] = customTimeInput.value.split(':');
    recordDate.setHours(hours, minutes, 0, 0);
  }

  const record = {
    id: Date.now(),
    petId: selectedPet,
    petName: settings[selectedPet],
    personId: selectedPerson,
    personName: settings[selectedPerson],
    action: selectedAction,
    time: recordDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    date: recordDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    timestamp: recordDate.getTime()
  };

  history.unshift(record); // Add to beginning
  
  // Sort history by timestamp descending (newest first) just in case a custom date was added
  history.sort((a, b) => b.timestamp - a.timestamp);

  // Keep only the last 20 records to save space
  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  saveHistory();
  renderHistory();
  
  // reset custom inputs
  customDateInput.value = '';
  customTimeInput.value = '';
}

function saveHistory() {
  localStorage.setItem('miauguau_history', JSON.stringify(history));
}

function renderHistory() {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-state">Aún no hay registros de comidas.</div>';
    return;
  }

  history.forEach(record => {
    const li = document.createElement('li');
    li.className = 'history-item';
    
    // Determine the text based on action
    const actionText = record.action || 'Comida';
    
    // Backwards compatibility for old records
    const petEmoji = record.petId ? emojis[record.petId] : (record.pet === 'Gato' ? '🐱' : '🐶');
    const personEmoji = record.personId ? emojis[record.personId] : (record.person === 'Alba' ? '👩🏻' : '👨🏻');
    const petName = record.petName || record.pet;
    const personName = record.personName || record.person;
    
    li.innerHTML = `
      <div class="history-info">
        <div class="history-avatar">
          ${petEmoji}
        </div>
        <div class="history-details">
          <h3>${petName} <span style="font-size: 14px; font-weight: 400; color: var(--text-secondary);">(${actionText})</span></h3>
          <p>${personName} <span>${personEmoji}</span></p>
        </div>
      </div>
      <div class="history-time">
        <span class="time">${record.time}</span>
        <span class="date">${record.date}</span>
      </div>
    `;
    historyList.appendChild(li);
  });
}

// Settings Functions
function applySettingsToDOM() {
  document.getElementById('pet1-label').textContent = settings.pet1;
  document.getElementById('pet2-label').textContent = settings.pet2;
  document.getElementById('person1-label').textContent = settings.person1;
  document.getElementById('person2-label').textContent = settings.person2;
}

function openSettings() {
  document.getElementById('pet1-input').value = settings.pet1;
  document.getElementById('pet2-input').value = settings.pet2;
  document.getElementById('person1-input').value = settings.person1;
  document.getElementById('person2-input').value = settings.person2;
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

function saveSettings() {
  settings.pet1 = document.getElementById('pet1-input').value.trim() || defaultSettings.pet1;
  settings.pet2 = document.getElementById('pet2-input').value.trim() || defaultSettings.pet2;
  settings.person1 = document.getElementById('person1-input').value.trim() || defaultSettings.person1;
  settings.person2 = document.getElementById('person2-input').value.trim() || defaultSettings.person2;
  
  localStorage.setItem('miauguau_settings', JSON.stringify(settings));
  
  applySettingsToDOM();
  // Optional: Update history rendering to reflect new names for past records?
  // Since we save petName in record, old records will keep their name unless we dynamically map them.
  // Actually, we probably want to update history rendering if they just fixed a typo.
  // Let's iterate history and update petName/personName if it matches the old settings?
  // It's safer to just let new names apply to new records, but maybe users want to update all.
  // We'll update the history in memory for matching petId and personId just in case.
  history.forEach(r => {
    if (r.petId) r.petName = settings[r.petId];
    if (r.personId) r.personName = settings[r.personId];
  });
  saveHistory();
  renderHistory();
  
  closeSettings();
}

// Start app
init();
