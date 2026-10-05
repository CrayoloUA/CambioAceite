# CambioAceite

PWA de un solo archivo para registrar kilometraje y seguir el próximo cambio de aceite.
Sin backend, sin build, sin dependencias.

## Cómo correrlo

Abrir `index.html` directamente en el navegador, o servirlo con cualquier servidor
estático (necesario para que el service worker funcione: `npx serve .`).

## Arquitectura

Todo vive en `index.html`: CSS inline, HTML, y un único `<script>` con utilidades de
fecha, geolocalización (Haversine), persistencia en `localStorage` (clave
`aceite_km_state_v1`), lógica de negocio, y renderizado. `sw.js` cachea los assets
estáticos para que la app funcione offline. `manifest.json` la hace instalable.

## Convenciones

- UI y copys en español (es-CO). Identificadores en el código mezclan español/inglés
  tal como ya está (no se traduce retroactivamente).
- Colores en `oklch()`, con variantes para `prefers-color-scheme: dark`.
- Sin frameworks ni librerías — mantenerlo así salvo decisión explícita en contrario.

## Datos

Un solo objeto en `localStorage["aceite_km_state_v1"]`: `lastChange`, `currentMileage`,
`kmUmbral`, `mesesUmbral`, `history[]`. Sin backend, sin sincronización.
