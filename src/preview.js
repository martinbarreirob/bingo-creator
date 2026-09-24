/** Renderiza los cartones generados como grids HTML en la zona de vista previa. */
export function renderPreview(container, cards, title) {
  container.innerHTML = '';

  for (const card of cards) {
    const cardEl = document.createElement('article');
    cardEl.className = 'bingo-card';

    const header = document.createElement('header');
    header.className = 'bingo-card-header';
    header.innerHTML = `<span class="bingo-title"></span><span class="bingo-number">#${card.number}</span>`;
    header.querySelector('.bingo-title').textContent = title;
    cardEl.appendChild(header);

    const cols = card.rows[0].length;
    const grid = document.createElement('div');
    grid.className = 'bingo-grid';
    // minmax(0, 1fr) en vez de 1fr: ignora el ancho mínimo del contenido
    // para que todas las columnas midan exactamente lo mismo
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    card.rows.forEach((row, r) => {
      row.forEach((value, c) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        if (card.fixed && card.fixed.r === r && card.fixed.c === c) {
          cell.classList.add('fixed');
        }
        cell.textContent = value;
        grid.appendChild(cell);
      });
    });

    cardEl.appendChild(grid);
    container.appendChild(cardEl);
  }
}
