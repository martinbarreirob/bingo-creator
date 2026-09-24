import { parseValues, extractExportifyValues } from './parser.js';
import { generateCards } from './generator.js';
import { renderPreview } from './preview.js';
import { exportPdf } from './pdf.js';

const valuesInput = document.getElementById('values-input');
const fileInput = document.getElementById('file-input');
const exportifyInput = document.getElementById('exportify-input');
const valuesCount = document.getElementById('values-count');
const titleInput = document.getElementById('title-input');
const fixedInput = document.getElementById('fixed-input');
const cardsInput = document.getElementById('cards-input');
const rowsInput = document.getElementById('rows-input');
const colsInput = document.getElementById('cols-input');
const generateBtn = document.getElementById('generate-btn');
const exportBtn = document.getElementById('export-btn');
const messageEl = document.getElementById('message');
const previewEl = document.getElementById('preview');

let currentCards = null;
let currentRows = 0;

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.hidden = false;
}

function clearMessage() {
  messageEl.hidden = true;
}

function updateValuesCount() {
  const count = parseValues(valuesInput.value).length;
  valuesCount.textContent = count > 0 ? `${count} valores detectados` : '';
}

valuesInput.addEventListener('input', updateValuesCount);

function loadFile(input, onText) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onText(reader.result);
  reader.readAsText(file);
  input.value = '';
}

fileInput.addEventListener('change', () => {
  loadFile(fileInput, (text) => {
    valuesInput.value = text;
    updateValuesCount();
    clearMessage();
  });
});

exportifyInput.addEventListener('change', () => {
  loadFile(exportifyInput, (text) => {
    const values = extractExportifyValues(text);
    if (!values || values.length === 0) {
      showMessage(
        'El archivo no parece un CSV de Exportify: no se encontraron las columnas «Track Name» y «Artist Name(s)».',
        'error'
      );
      return;
    }
    valuesInput.value = values.filter(Boolean).join('\n');
    updateValuesCount();
    showMessage(`🎧 Playlist importada: ${parseValues(valuesInput.value).length} canciones.`, 'success');
  });
});

generateBtn.addEventListener('click', () => {
  clearMessage();
  const values = parseValues(valuesInput.value);
  const cardCount = parseInt(cardsInput.value, 10);
  const rows = parseInt(rowsInput.value, 10);
  const cols = parseInt(colsInput.value, 10);

  if (values.length === 0) {
    showMessage('Introduce al menos una lista de valores.', 'error');
    return;
  }
  if (!cardCount || cardCount < 1 || !rows || rows < 1 || !cols || cols < 1) {
    showMessage('El número de cartones, filas y columnas debe ser mayor que cero.', 'error');
    return;
  }

  try {
    const { cards, warning } = generateCards(values, {
      cardCount,
      rows,
      cols,
      fixedValue: fixedInput.value,
    });
    currentCards = cards;
    currentRows = rows;
    renderPreview(previewEl, cards, titleInput.value.trim() || 'Bingo');
    exportBtn.disabled = false;
    if (warning) {
      showMessage(`⚠️ ${warning}`, 'warning');
    } else {
      showMessage(`✅ ${cards.length} cartones generados. Revisa la vista previa y exporta cuando quieras.`, 'success');
    }
  } catch (err) {
    showMessage(err.message, 'error');
    exportBtn.disabled = true;
    currentCards = null;
  }
});

exportBtn.addEventListener('click', () => {
  if (!currentCards) return;
  exportPdf(currentCards, currentRows);
});
