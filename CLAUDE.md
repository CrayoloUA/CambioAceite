# CambioAceite

PWA de un solo archivo para registrar kilometraje y seguir el próximo cambio de aceite.
Sin backend, sin build, sin dependencias.

## Cómo correrlo

Abrir `index.html` directamente en el navegador, o servirlo con cualquier servidor
estático (necesario para que el service worker funcione: `npx serve .`, o
`python -m http.server` — hay una configuración lista en `.claude/launch.json`).

## Cómo probar

Pruebas unitarias con el runner nativo de Node (sin dependencias, sin `npm install`):

```
node --test "tests/**/*.test.js"
```

(`node --test tests/` no resuelve el directorio en Windows/Git Bash — usar el glob de arriba.)

## Arquitectura

La mayor parte de la UI vive en `index.html`: CSS inline, HTML, y un `<script>` con
persistencia en `localStorage` (clave `aceite_km_state_v1`), lógica de negocio, y
renderizado. Las utilidades puras (fechas, formato, Haversine) viven en `js/utils.js`,
cargado antes del script principal — mismo archivo sirve al navegador (variables
globales) y a las pruebas en Node (`module.exports` condicional). `sw.js` cachea los
assets estáticos (incluido `js/utils.js`) para que la app funcione offline.
`manifest.json` la hace instalable.

## Convenciones

- UI y copys en español (es-CO). Identificadores en el código mezclan español/inglés
  tal como ya está (no se traduce retroactivamente).
- Colores en `oklch()`, con variantes para `prefers-color-scheme: dark`.
- Sin frameworks ni librerías — mantenerlo así salvo decisión explícita en contrario.

## Datos

Un solo objeto en `localStorage["aceite_km_state_v1"]`: `lastChange`, `currentMileage`,
`kmUmbral`, `mesesUmbral`, `history[]`. Sin backend, sin sincronización.
