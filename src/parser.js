/**
 * Convierte la entrada de texto plano en una lista de valores limpia.
 * - Si el texto es un CSV de Exportify (playlist de Spotify), extrae «Canción – Artista».
 * - Si hay saltos de línea, cada línea es un valor (permite comas dentro de un título).
 * - Si es una sola línea, se separa por comas o puntos y coma.
 */
export function parseValues(rawText) {
  if (!rawText) return [];

  const exportifyValues = extractExportifyValues(rawText);
  if (exportifyValues) return dedupe(exportifyValues);

  const trimmed = rawText.trim();
  const parts = /\r?\n/.test(trimmed) ? trimmed.split(/\r?\n/) : trimmed.split(/,|;/);

  return dedupe(parts.map((part) => part.replace(/^["']|["']$/g, '').trim()));
}

function dedupe(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/**
 * Detecta un CSV exportado con Exportify (exportify.net) y devuelve
 * los valores «Canción – Artista», o null si el texto no tiene ese formato.
 * Si una pista tiene varios artistas (separados por «;» o coma) se usa solo el principal.
 */
export function extractExportifyValues(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return null;

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const trackCol = header.indexOf('track name');
  const artistCol = header.indexOf('artist name(s)');
  if (trackCol === -1 || artistCol === -1) return null;

  return rows.slice(1).map((row) => {
    const track = (row[trackCol] || '').trim();
    const artist = (row[artistCol] || '').split(/[;,]/)[0].trim();
    if (!track) return '';
    return artist ? `${track} – ${artist}` : track;
  });
}

/** Parser CSV mínimo (RFC 4180): comillas, comillas escapadas ("") y saltos de línea dentro de campos. */
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}
