// Script för att hantera beräkningar och postnummer → postort

// --- Radio button toggle för input sections ---
document.querySelectorAll('input[name="option"]').forEach(radio => {
  radio.addEventListener('change', function(){
    document.getElementById('inputsA').classList.toggle('hidden', this.value !== 'A');
    document.getElementById('inputsB').classList.toggle('hidden', this.value !== 'B');
  });
});

// Elementreferenser
const a1 = document.getElementById('a1');
const a2 = document.getElementById('a2');
const a3 = document.getElementById('a3');
const a4 = document.getElementById('a4');

const b1Input = document.getElementById('b1');
const b1Flaks = document.getElementById('b1_flaks');
const b2Input = document.getElementById('b2');
const b2Flaskor = document.getElementById('b2_flaskor');
const b2Bib = document.getElementById('b2_bib');
const b3Input = document.getElementById('b3');
const b3Flaskor = document.getElementById('b3_flaskor');
const b3Bib = document.getElementById('b3_bib');

// --- Per person beräkningar ---
function updatePerPerson() {
  const persons = parseFloat(a1.value) || 0;

  const öl = parseFloat(a2.value) || 0;
  const vin = parseFloat(a3.value) || 0;
  const sprit = parseFloat(a4.value) || 0;

  // Öl: 0.33 liter
  document.getElementById('a2_liters').textContent = (persons * öl * 0.33).toFixed(2);
  // Vin: 0.125 liter
  document.getElementById('a3_liters').textContent = (persons * vin * 0.125).toFixed(2);
  // Sprit: 0.04 liter
  document.getElementById('a4_liters').textContent = (persons * sprit * 0.04).toFixed(2);
}

[a1, a2, a3, a4].forEach(el => {
  if(el) el.addEventListener('input', updatePerPerson);
});

// Registration number - convert to uppercase
document.getElementById('regnr').addEventListener('input', function(){
  this.value = this.value.toUpperCase();
});

// Postal code - only allow numbers
document.getElementById('postcode').addEventListener('input', function(){
  this.value = this.value.replace(/[^0-9]/g, '');
});

// --- Total mängd beräkningar ---
function updateB1Total(){
  const manual = parseFloat(b1Input.dataset.manual || '0') || 0;
  const flaks = parseInt(b1Flaks.value) || 0;
  const total = manual + flaks * 24;
  b1Input.value = total;
  const liters = (total * 0.33).toFixed(2);
  document.getElementById('b1_liters').textContent = liters;
}

function updateB2Total(){
  const manual = parseFloat(b2Input.dataset.manual || '0') || 0;
  const flaskor = parseInt(b2Flaskor.value) || 0;
  const bib = parseInt(b2Bib.value) || 0;
  const total = manual + flaskor * 6 + bib * 24;
  b2Input.value = total;
  const liters = (total * 0.125).toFixed(2);
  document.getElementById('b2_liters').textContent = liters;
}

function updateB3Total(){
  const manual = parseFloat(b3Input.dataset.manual || '0') || 0;
  const flaskor = parseInt(b3Flaskor.value) || 0;
  const bib = parseInt(b3Bib.value) || 0;
  const total = manual + flaskor * 17.5 + bib * 75;
  b3Input.value = total;
  const liters = (total * 0.04).toFixed(2);
  document.getElementById('b3_liters').textContent = liters;
}

// Store manual values when user directly edits the input fields
b1Input.addEventListener('input', function(){
  b1Input.dataset.manual = this.value;
  updateB1Total();
});

b2Input.addEventListener('input', function(){
  b2Input.dataset.manual = this.value;
  updateB2Total();
});

b3Input.addEventListener('input', function(){
  b3Input.dataset.manual = this.value;
  updateB3Total();
});

[b1Flaks].forEach(el => el?.addEventListener('input', updateB1Total));
[b2Flaskor, b2Bib].forEach(el => el?.addEventListener('input', updateB2Total));
[b3Flaskor, b3Bib].forEach(el => el?.addEventListener('input', updateB3Total));

// --- Postnummer → Postort ---
// Load CSV data on page load
let csvData = [];

fetch('sweden-zipcode.csv')
  .then(response => response.text())
  .then(data => {
    csvData = data.trim().split('\n').map(line => line.split(','));
    // Remove header row
    csvData.shift();
  })
  .catch(error => console.error('Error loading CSV:', error));

// Function to search CSV for postal code
function findCityForPostalCode(postalCode) {
  const found = csvData.find(row => row[0] === postalCode);
  if(found) {
    return found[1]; // Return city name (UPPERCASE from CSV)
  }
  return null;
}

document.getElementById('postcode').addEventListener('blur', function(){
  const val = this.value.trim();
  if(/^\d{5}$/.test(val)){
    const ort = findCityForPostalCode(val);
    if(ort){
      // Konvertera från UPPERCASE till bara första bokstav stor, resten små
      const formattedOrt = ort.charAt(0).toUpperCase() + ort.slice(1).toLowerCase();
      document.getElementById('postort').textContent = "Postort: " + formattedOrt;
      this.classList.remove('error');
    } else {
      document.getElementById('postort').textContent = "Postort: Okänd postnummer";
      this.classList.add('error');
    }
  }
});

// --- Save to localStorage only on Save button click ---
function saveFormData() {
  const formData = {
    option: document.querySelector('input[name="option"]:checked')?.value || '',
    a1: document.getElementById('a1')?.value || '',
    a2: document.getElementById('a2')?.value || '',
    a3: document.getElementById('a3')?.value || '',
    a4: document.getElementById('a4')?.value || '',
    b1: document.getElementById('b1')?.value || '',
    b1_flaks: document.getElementById('b1_flaks')?.value || '',
    b2: document.getElementById('b2')?.value || '',
    b2_flaskor: document.getElementById('b2_flaskor')?.value || '',
    b2_bib: document.getElementById('b2_bib')?.value || '',
    b3: document.getElementById('b3')?.value || '',
    b3_flaskor: document.getElementById('b3_flaskor')?.value || '',
    b3_bib: document.getElementById('b3_bib')?.value || '',
    regnr: document.getElementById('regnr')?.value || '',
    postcode: document.getElementById('postcode')?.value || ''
  };
  localStorage.setItem('beverageFormData', JSON.stringify(formData));
  showMessage('Data sparad!', 'success');
}

function loadFormData() {
  const saved = localStorage.getItem('beverageFormData');
  if(saved) {
    // Clear all form inputs first
    document.getElementById('a1').value = '';
    document.getElementById('a2').value = '';
    document.getElementById('a3').value = '';
    document.getElementById('a4').value = '';
    document.getElementById('b1').value = '';
    document.getElementById('b1_flaks').value = '';
    document.getElementById('b2').value = '';
    document.getElementById('b2_flaskor').value = '';
    document.getElementById('b2_bib').value = '';
    document.getElementById('b3').value = '';
    document.getElementById('b3_flaskor').value = '';
    document.getElementById('b3_bib').value = '';
    document.getElementById('regnr').value = '';
    document.getElementById('postcode').value = '';
    document.getElementById('postort').textContent = 'Postort: ';
    
    // Clear data attributes
    b1Input.dataset.manual = '';
    b2Input.dataset.manual = '';
    b3Input.dataset.manual = '';
    
    // Clear all display values
    document.getElementById('a2_liters').textContent = '0';
    document.getElementById('a3_liters').textContent = '0';
    document.getElementById('a4_liters').textContent = '0';
    document.getElementById('b1_liters').textContent = '0';
    document.getElementById('b2_liters').textContent = '0';
    document.getElementById('b3_liters').textContent = '0';
    
    // Clear radio selection
    document.querySelectorAll('input[name="option"]').forEach(radio => radio.checked = false);
  }
}

function showMessage(text, type = 'info') {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = 'message ' + type;
  setTimeout(() => msg.className = 'message', 2000);
}

// Prevent form submission and save only on button click
document.getElementById('dataForm').addEventListener('submit', function(e){
  e.preventDefault();
  
  const postcodeInput = document.getElementById('postcode');
  // Check if a valid postort has been found
  const postortText = document.getElementById('postort').textContent;
  if(postortText === 'Postort: ' || postortText === 'Postort: Okänd postnummer') {
    showMessage('Du måste ange ett giltigt postnummer för att fortsätta!', 'error');
    postcodeInput.classList.add('error');
    return;
  }
  
  postcodeInput.classList.remove('error');
  saveFormData();
  showResultsPage();
});

// Back button on results page
document.getElementById('backBtn').addEventListener('click', function(){
  document.getElementById('mainForm').style.display = 'block';
  document.getElementById('resultsPage').style.display = 'none';
});

// New calculation button
document.getElementById('newCalcBtn').addEventListener('click', function(){
  document.getElementById('mainForm').style.display = 'block';
  document.getElementById('resultsPage').style.display = 'none';
});

// Share button
document.getElementById('shareBtn').addEventListener('click', function(){
  alert('Dela funktionalitet kommer snart!');
});

// Details buttons for each box
document.querySelectorAll('.btn-details').forEach(btn => {
  btn.addEventListener('click', function(){
    alert('Detaljer för denna rubriken kommer snart!');
  });
});

// Clear button - rensa all form data
document.getElementById('clearBtn').addEventListener('click', function(){
  // Clear all form inputs
  document.getElementById('a1').value = '';
  document.getElementById('a2').value = '';
  document.getElementById('a3').value = '';
  document.getElementById('a4').value = '';
  document.getElementById('b1').value = '';
  document.getElementById('b1_flaks').value = '';
  document.getElementById('b2').value = '';
  document.getElementById('b2_flaskor').value = '';
  document.getElementById('b2_bib').value = '';
  document.getElementById('b3').value = '';
  document.getElementById('b3_flaskor').value = '';
  document.getElementById('b3_bib').value = '';
  document.getElementById('regnr').value = '';
  document.getElementById('postcode').value = '';
  document.getElementById('postort').textContent = 'Postort: ';
  
  // Clear data attributes
  b1Input.dataset.manual = '';
  b2Input.dataset.manual = '';
  b3Input.dataset.manual = '';
  
  // Clear all display values
  document.getElementById('a2_liters').textContent = '0';
  document.getElementById('a3_liters').textContent = '0';
  document.getElementById('a4_liters').textContent = '0';
  document.getElementById('b1_liters').textContent = '0';
  document.getElementById('b2_liters').textContent = '0';
  document.getElementById('b3_liters').textContent = '0';
  
  // Clear radio selection
  document.querySelectorAll('input[name="option"]').forEach(radio => radio.checked = false);
  
  // Clear localStorage
  localStorage.removeItem('beverageFormData');
  
  showMessage('Alla värden har rensats!', 'success');
});

// Show results page
function showResultsPage() {
  document.getElementById('mainForm').style.display = 'none';
  document.getElementById('resultsPage').style.display = 'block';
  calculateResults();
}

// Calculate results and populate the boxes
function calculateResults() {
  // Placeholder values - will be replaced with actual calculations
  document.getElementById('s_value1').textContent = '0';
  document.getElementById('s_value2').textContent = '0';
  document.getElementById('s_value3').textContent = '0';

  document.getElementById('db_value1').textContent = '0';
  document.getElementById('db_value2').textContent = '0';
  document.getElementById('db_value3').textContent = '0';

  document.getElementById('df_value1').textContent = '0';
  document.getElementById('df_value2').textContent = '0';
  document.getElementById('df_value3').textContent = '0';

  document.getElementById('tb_value1').textContent = '0';
  document.getElementById('tb_value2').textContent = '0';
  document.getElementById('tb_value3').textContent = '0';

  document.getElementById('tf_value1').textContent = '0';
  document.getElementById('tf_value2').textContent = '0';
  document.getElementById('tf_value3').textContent = '0';
}

// Load saved data on page load
window.addEventListener('DOMContentLoaded', loadFormData);
