# 🎉 Bingo Creator

Generador de cartones de bingo temáticos (canciones, series, lo que quieras) con vista previa en el navegador y exportación a PDF en formato A4.

## Requisitos

- [Node.js](https://nodejs.org/) 20.19+ (o 22.12+), requerido por Vite 7
- npm (incluido con Node.js)

## Instalación

```bash
npm install
```

## Levantar el proyecto en desarrollo

```bash
npm run dev
```

Vite arrancará un servidor de desarrollo y mostrará la URL local (por defecto `http://localhost:5173`). Abre esa URL en el navegador.

## Uso

1. Introduce los valores del bingo en el área de texto (separados por comas, punto y coma o uno por línea), o bien:
   - 📂 Carga un archivo `.csv` / `.txt` con los valores.
   - 🎧 Importa un CSV de [Exportify](https://exportify.net/) para usar una playlist de Spotify.
2. Ajusta el título, el número de cartones y las dimensiones (filas × columnas). Opcionalmente, indica un **valor fijo** que aparecerá resaltado en la celda central de todos los cartones (p. ej. el número 100).
3. Pulsa **Generar cartones** para ver la vista previa.
4. Pulsa **Exportar PDF** para descargar los cartones en A4.

## Build de producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve el build localmente para probarlo
```

## Verificación de PDFs

Hay un script que genera PDFs de prueba y comprueba que la paginación sea correcta:

```bash
node scripts/verify-pdf.mjs
```

## Estructura del proyecto

```
index.html              Interfaz de la aplicación
src/
  main.js               Punto de entrada y lógica de la UI
  parser.js             Parseo de valores (texto, CSV, Exportify)
  generator.js          Generación de los cartones
  preview.js            Renderizado de la vista previa
  pdf.js                Exportación a PDF (jsPDF + jspdf-autotable)
  styles.css            Estilos
scripts/
  verify-pdf.mjs        Verificación manual de la paginación del PDF
```
