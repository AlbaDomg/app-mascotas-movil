import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB6_ZJ6fVouKC1r1IPlCZ2LvpCaPpos7TY",
  authDomain: "miauguau-control.firebaseapp.com",
  databaseURL: "https://miauguau-control-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "miauguau-control",
  storageBucket: "miauguau-control.firebasestorage.app",
  messagingSenderId: "486782707960",
  appId: "1:486782707960:web:b8f0ac7a65480bbf44f30d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Settings
const defaultSettings = {
  pet1: 'Gato',
  pet2: 'Perro',
  person1: 'Alba',
  person2: 'Santi'
};
let settings = { ...defaultSettings };

// State
let selectedPet = null;
let selectedPerson = null;
let selectedAction = 'Comida';
let history = [];

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
  
  // Listen for settings changes from Firebase
  const settingsRef = ref(database, 'settings');
  onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      settings = data;
    } else {
      settings = { ...defaultSettings };
    }
    applySettingsToDOM();
  });

  // Listen for history changes from Firebase
  const historyRef = ref(database, 'history');
  onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert Firebase object to array
      history = Object.values(data);
      // Sort by timestamp descending
      history.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      history = [];
    }
    renderHistory();
  });
  
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
    if (confirm('¿Seguro que quieres borrar el historial para TODOS los dispositivos?')) {
      const historyRef = ref(database, 'history');
      remove(historyRef); // Clear in Firebase
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

  // Save to Firebase
  const historyRef = ref(database, 'history');
  const newRecordRef = push(historyRef);
  set(newRecordRef, record);
  
  // reset custom inputs
  customDateInput.value = '';
  customTimeInput.value = '';
}

function renderHistory() {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-state">Aún no hay registros de comidas.</div>';
    return;
  }

  // Keep only the last 30 records for display
  const displayHistory = history.slice(0, 30);

  displayHistory.forEach(record => {
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
  document.getElementById('pet1-label').textContent = settings.pet1 || defaultSettings.pet1;
  document.getElementById('pet2-label').textContent = settings.pet2 || defaultSettings.pet2;
  document.getElementById('person1-label').textContent = settings.person1 || defaultSettings.person1;
  document.getElementById('person2-label').textContent = settings.person2 || defaultSettings.person2;
}

function openSettings() {
  document.getElementById('pet1-input').value = settings.pet1 || defaultSettings.pet1;
  document.getElementById('pet2-input').value = settings.pet2 || defaultSettings.pet2;
  document.getElementById('person1-input').value = settings.person1 || defaultSettings.person1;
  document.getElementById('person2-input').value = settings.person2 || defaultSettings.person2;
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

function saveSettings() {
  const newSettings = {
    pet1: document.getElementById('pet1-input').value.trim() || defaultSettings.pet1,
    pet2: document.getElementById('pet2-input').value.trim() || defaultSettings.pet2,
    person1: document.getElementById('person1-input').value.trim() || defaultSettings.person1,
    person2: document.getElementById('person2-input').value.trim() || defaultSettings.person2
  };
  
  // Save to Firebase
  const settingsRef = ref(database, 'settings');
  set(settingsRef, newSettings);
  
  closeSettings();
}

// Start app
init();
