# M1 — Mapa del proyecto (solo lectura)

Complementa [docs/A-auditoria.md](../A-auditoria.md) (Fase A) con el nivel de detalle que exige esta fase: pantalla por pantalla, flujo por flujo, y qué NO hace.

## Stack y capas

- **Stack:** HTML + CSS + JS vanilla en un solo archivo (`index.html`, 851 líneas). Cero dependencias, cero build, cero framework.
- **Capas reales hoy:** ninguna separación de archivos. Dentro del único `<script>` el código SÍ está ordenado en bloques lógicos (aunque no en módulos separados):
  1. Utilidades de fecha/formato (`pad2`, `ymd`, `fromYMD`, `diffDays`, `formatLong`, `formatShort`, `fmtKm`, `addMonths`).
  2. Geolocalización (`haversineKm`).
  3. Persistencia (`loadState`/`saveState` y los getters/setters sobre `localStorage`).
  4. Lógica de negocio (`estimarProximaFecha`, `calcularEnVivo`, `checkBanner`).
  5. Generación de `.ics` (`icsFecha`, `descargarRecordatorio`).
  6. Renderizado de UI (`render`, `renderHistorial`, `setBar`).
  7. Manejadores de eventos (todos los `addEventListener`, al final del archivo).
  8. Bootstrap (`init()` + registro del service worker).
- **Entry points:** `index.html` (todo), `sw.js` (ciclo de vida del service worker: install/activate/fetch), `manifest.json` (metadatos de instalación PWA).
- **Servicios externos:** **ninguno**. Confirmado por búsqueda en el código: no hay `fetch` a terceros, no hay CDN, no hay analítica, no hay backend. Las únicas APIs usadas son del navegador: `localStorage`, `sessionStorage`, `navigator.geolocation`, Service Worker/Cache API, File API (importar backup), `Intl` (formato de fecha/número en `es-CO`).

## Modelo de datos (único objeto en `localStorage`)

```
aceite_km_state_v1 = {
  lastChange:      { date: "YYYY-MM-DD", mileage: number, lat?: number, lon?: number },
  currentMileage:  number | null,
  kmUmbral:        number,   // default 3000
  mesesUmbral:     number,   // default 6
  history:         [ { date, mileage, lat?, lon? }, ... ]
}
```

No hay esquema declarado (ni TypeScript, ni zod, ni JSON Schema) — la forma del objeto solo existe implícita en cómo el código lo lee y escribe.

## Pantallas (la app es una sola vista, dividida en secciones)

| Sección | Qué hace | Estado vacío |
|---|---|---|
| Banner de aviso | Avisa si ya se pasó el umbral de días o de km | Oculto si no hay `lastChange` |
| Panel de estado (gauge) | Texto + barra de progreso: ok / pronto / atrasado | "Registra tu primer cambio de aceite" |
| Franja Hoy / Último cambio | Fecha de hoy y fecha+km del último cambio | "— (sin registro)" |
| Recordatorio en calendario | Botón para descargar `.ics` con la fecha estimada | Deshabilitado, "Registra tu primer cambio para generar un recordatorio" |
| Registrar cambio de aceite | Formulario fecha + km (GPS automático si hay permiso) | Siempre disponible |
| Kilometraje actual | Input + botón GPS para estimar | Deshabilitado hasta que exista un `lastChange` |
| Ajustes de umbral | Km para cambio / meses máximo | Precargado con defaults (3000 km / 6 meses) |
| Historial | Lista de cambios con fecha, km y botón eliminar | "Aún no hay cambios registrados" |
| Copia de seguridad (colapsable) | Exportar/Importar JSON | — |

## Flujos principales

1. **Primera vez:** no hay `lastChange` → solo se puede registrar el primer cambio; el resto de secciones quedan deshabilitadas o en estado vacío.
2. **Registrar cambio:** usuario llena fecha + km → si el navegador da permiso de GPS, se guarda `lat/lon` junto al registro → se agrega a `history`, se fija como `lastChange`, se limpia el kilometraje actual, se vuelve a renderizar todo.
3. **Actualizar kilometraje actual:** el usuario escribe el km actual (o lo estima con el botón GPS, que usa Haversine entre el punto del último cambio y la posición actual, ×1.3 para aproximar distancia de carretera) → cálculo en vivo del estado (ok/pronto/atrasado) en cada tecla.
4. **Revisar historial:** ver todos los cambios ordenados por fecha descendente; eliminar uno con confirmación (`confirm()` nativo del navegador) → recalcula `lastChange` por el registro de **mayor kilometraje** restante (no por fecha, ver hallazgo #4 de la auditoría).
5. **Ajustar umbrales:** cambiar km o meses → se guarda al perder foco (`change`), recalcula estado y banner.
6. **Recordatorio:** descarga un `.ics` con dos alarmas (3 días antes y el mismo día) para la fecha estimada (`estimarProximaFecha`), que combina tope por meses con proyección por ritmo real de uso.
7. **Respaldo:** exportar todo el estado a un `.json` descargable; importar un `.json` que reemplaza el estado completo tras confirmación (sin validar su forma).

## Qué NO hace hoy (explícito, para no asumirlo implementado)

- No soporta **más de un vehículo** — todo el estado es un único objeto global.
- No diferencia **tipos de servicio** (aceite, filtro, llantas, etc.) — solo "cambio de aceite".
- No tiene **unidades configurables** (solo kilómetros, no millas).
- No permite **editar** un registro del historial, solo eliminarlo (sin deshacer).
- No envía **notificaciones push** reales — el recordatorio es un archivo `.ics` que el usuario debe abrir/importar a su calendario.
- No tiene **sincronización en la nube** — el respaldo es manual (exportar/importar `.json`).
- No tiene **gráfico o visualización** del historial (solo lista).
- No registra **costo** del cambio de aceite ni proveedor/taller.
- No tiene **selector de idioma** — español fijo (`lang="es"`, formatos `es-CO`).
- No valida el **esquema** del JSON importado (hallazgo ya anotado en la auditoría).

## `CLAUDE.md` propuesto (no existe hoy)

Como el repo es de un solo autor, se propone crear `CLAUDE.md` en la raíz con este contenido:

```markdown
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
```

¿Lo creo como archivo real en la raíz del repo ahora, o lo dejamos solo propuesto aquí hasta cerrar la ronda de mejora?
