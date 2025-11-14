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

// --- Total mängd beräkningar ---
function updateB1Total(){
  const manual = parseFloat(b1Input.dataset.manual || b1Input.value || '0') || 0;
  const flaks = parseInt(b1Flaks.value) || 0;
  const total = manual + flaks * 24;
  b1Input.value = total;
  const liters = (total * 0.33).toFixed(2);
  document.getElementById('b1_liters').textContent = liters;
}

function updateB2Total(){
  const manual = parseFloat(b2Input.dataset.manual || b2Input.value || '0') || 0;
  const flaskor = parseInt(b2Flaskor.value) || 0;
  const bib = parseInt(b2Bib.value) || 0;
  const total = manual + flaskor * 6 + bib * 24;
  b2Input.value = total;
  const liters = (total * 0.125).toFixed(2);
  document.getElementById('b2_liters').textContent = liters;
}

function updateB3Total(){
  const manual = parseFloat(b3Input.dataset.manual || b3Input.value || '0') || 0;
  const flaskor = parseInt(b3Flaskor.value) || 0;
  const bib = parseInt(b3Bib.value) || 0;
  const total = manual + flaskor * 17.5 + bib * 75;
  b3Input.value = total;
  const liters = (total * 0.04).toFixed(2);
  document.getElementById('b3_liters').textContent = liters;
}

[b1Input, b1Flaks].forEach(el => el?.addEventListener('input', updateB1Total));
[b2Input, b2Flaskor, b2Bib].forEach(el => el?.addEventListener('input', updateB2Total));
[b3Input, b3Flaskor, b3Bib].forEach(el => el?.addEventListener('input', updateB3Total));

// --- Postnummer → Postort ---
// Local postal code database
const postalCodeData = {
  '10004': 'Stockholm', '10005': 'Stockholm', '10012': 'Stockholm',
  '10019': 'Stockholm', '10026': 'Stockholm', '10028': 'Stockholm',
  '10029': 'Stockholm', '10031': 'Stockholm', '10040': 'Stockholm',
  '20001': 'Malmö', '20002': 'Malmö', '20010': 'Malmö',
  '30001': 'Växjö', '30002': 'Växjö', '30010': 'Växjö',
  '40001': 'Göteborg', '40002': 'Göteborg', '40010': 'Göteborg',
  '50001': 'Borås', '50010': 'Borås',
  '60001': 'Norrköping', '60010': 'Norrköping',
  '70001': 'Örebro', '70010': 'Örebro',
  '80001': 'Gävle', '80010': 'Gävle',
  '90001': 'Umeå', '90010': 'Umeå',
  '95001': 'Luleå', '95010': 'Luleå',
  '21771': 'Malmö'
};

document.getElementById('postcode').addEventListener('blur', function(){
  const val = this.value.trim();
  if(/^\d{5}$/.test(val)){
    const ort = postalCodeData[val];
    if(ort){
      // Konvertera till bara första bokstav stor, resten små
      const formattedOrt = ort.charAt(0).toUpperCase() + ort.slice(1).toLowerCase();
      document.getElementById('postort').textContent = "Postort: " + formattedOrt;
    } else {
      document.getElementById('postort').textContent = "Postort: Okänd postnummer";
    }
  }
});
