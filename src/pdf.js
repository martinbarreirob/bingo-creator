import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Medidas en mm sobre A4 vertical (210 × 297)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 10;
const CARDS_PER_PAGE = 3;
// Separación entre el cartón y la línea de corte (o el borde del papel), a cada
// lado: 6 mm deja el cartón fuera de la zona no imprimible de la mayoría de impresoras
const CUT_PAD = 6;

/**
 * Genera y descarga un PDF A4 con 3 cartones por página, apilados a lo ancho.
 * Sin cabecera: los cartones se separan con líneas de corte gruesas que cruzan
 * toda la página, de modo que con un corte por línea se separan los 3 cartones.
 */
export function exportPdf(cards, rows) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const cardW = PAGE_W - 2 * MARGIN;
  const cols = cards[0]?.rows[0]?.length || 1;
  // Las bandas reparten la altura COMPLETA de la hoja (sin margen vertical de
  // página): así los tres trozos recortados miden exactamente lo mismo
  const bandH = PAGE_H / CARDS_PER_PAGE;
  // 0.5 mm de holgura para que el redondeo no dispare un salto de página de autotable
  const cellH = (bandH - 2 * CUT_PAD - 0.5) / rows;

  cards.forEach((card, index) => {
    const slot = index % CARDS_PER_PAGE;
    if (index > 0 && slot === 0) doc.addPage();

    const y = slot * bandH;

    autoTable(doc, {
      body: card.rows,
      startY: y + CUT_PAD,
      margin: { top: CUT_PAD, bottom: CUT_PAD - 1, left: MARGIN, right: MARGIN },
      tableWidth: cardW,
      theme: 'grid',
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: rows <= 3 ? 10 : 9,
        cellPadding: 2,
        minCellHeight: cellH,
        // Ancho fijo por columna: sin esto autotable reparte según el contenido
        // y las columnas no cuadran entre cartones distintos
        cellWidth: cardW / cols,
        lineColor: [40, 40, 40],
        lineWidth: 0.3,
        textColor: [20, 20, 20],
        overflow: 'linebreak',
      },
      // La celda del valor fijo se resalta en negrita con fondo suave
      didParseCell: (data) => {
        if (card.fixed && data.row.index === card.fixed.r && data.column.index === card.fixed.c) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [235, 230, 220];
        }
      },
    });

    // Líneas de corte entre cartones: gruesas y de borde a borde de la hoja
    if (slot < CARDS_PER_PAGE - 1) {
      const cutY = (slot + 1) * bandH;
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.line(0, cutY, PAGE_W, cutY);
    }
  });

  doc.save('bingo-cartones.pdf');
}
