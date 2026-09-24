// Script de verificación manual: genera PDFs de prueba y comprueba la paginación.
// Uso: node scripts/verify-pdf.mjs
import { readFileSync, unlinkSync } from 'node:fs';
import { generateCards } from '../src/generator.js';
import { exportPdf } from '../src/pdf.js';

const values = Array.from({ length: 30 }, (_, i) => `Canción de prueba número ${i + 1} con título largo`);

function countPages(file) {
  const text = readFileSync(file, 'latin1');
  return (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
}

const scenarios = [
  { cardCount: 20, rows: 3, cols: 5, expectedPages: 7 }, // 3 por página
  { cardCount: 10, rows: 5, cols: 5, expectedPages: 4 },
  { cardCount: 1, rows: 3, cols: 3, expectedPages: 1 },
];

let failed = false;
for (const { cardCount, rows, cols, expectedPages } of scenarios) {
  const { cards } = generateCards(values, { cardCount, rows, cols });
  exportPdf(cards, rows);
  const pages = countPages('bingo-cartones.pdf');
  const ok = pages === expectedPages;
  if (!ok) failed = true;
  console.log(`${ok ? 'OK ' : 'FAIL'} ${cardCount} cartones ${rows}x${cols} -> ${pages} páginas (esperadas ${expectedPages})`);
}
unlinkSync('bingo-cartones.pdf');
process.exit(failed ? 1 : 0);
