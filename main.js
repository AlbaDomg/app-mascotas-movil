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

// Emojis mapping
const emojis = {
  'Gato': '🐱',
  'Perro': '🐶',
  'Alba': '👩🏻',
  'Santi': '👨🏻'
};

// Initialize
function init() {
  renderHistory();
  
  // Event Listeners for Pet selection
  petCards.forEach(card => {
    card.addEventListener('click', () => {
      petCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPet = card.getAttribute('data-value');
      
      // Show/Hide action section for dog
      if (selectedPet === 'Perro') {
        actionSection.classList.remove('hidden');
      } else {
        actionSection.classList.add('hidden');
        selectedAction = 'Comida';
        actionCards.forEach(c => c.classList.remove('selected'));
        actionCards[0].classList.add('selected'); // Reset to Comida
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
  selectedAction = 'Comida';
  petCards.forEach(c => c.classList.remove('selected'));
  personCards.forEach(c => c.classList.remove('selected'));
  actionCards.forEach(c => c.classList.remove('selected'));
  actionCards[0].classList.add('selected'); // Reset to Comida
  actionSection.classList.add('hidden');
  checkSubmitState();
}

function addRecord() {
  const now = new Date();
  
  const record = {
    id: Date.now(),
    pet: selectedPet,
    person: selectedPerson,
    action: selectedAction,
    time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    timestamp: now.getTime()
  };

  history.unshift(record); // Add to beginning
  
  // Keep only the last 20 records to save space
  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  saveHistory();
  renderHistory();
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
    const isPill = record.action && record.action.includes('Pastilla');
    const actionText = isPill ? record.action : 'Comida';
    
    li.innerHTML = `
      <div class="history-info">
        <div class="history-avatar">
          ${emojis[record.pet]}
        </div>
        <div class="history-details">
          <h3>${record.pet} <span style="font-size: 14px; font-weight: 400; color: var(--text-secondary);">(${actionText})</span></h3>
          <p>${record.person} <span>${emojis[record.person]}</span></p>
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

// Start app
init();
