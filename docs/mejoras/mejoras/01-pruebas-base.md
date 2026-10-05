# M-01 — Base mínima de pruebas automatizadas

Lote A, primer ítem. Ver [04-backlog.md](../04-backlog.md).

## Qué es

Extraer las funciones puras que hoy viven inline en `index.html` (utilidades de fecha y `haversineKm`) a un archivo propio (`js/utils.js`), y escribir pruebas unitarias sobre ellas. Sin cambiar ningún comportamiento visible de la app.

## Decisiones de implementación (bajo riesgo, no requieren aprobación aparte)

- **Runner:** `node --test` (incluido en Node, versión instalada: v24.14.1). Cero dependencias nuevas, cero `package.json`, cero `npm install` — consistente con que el proyecto deliberadamente no usa `npm` (ver CAL3 del diagnóstico, descartado).
- **Archivo nuevo:** `js/utils.js` con las funciones puras, escrito para funcionar igual en el navegador (variables globales, como hoy) y en Node (`module.exports` al final, sin afectar el navegador porque `module` no existe ahí).
- **`index.html`:** se quitan las definiciones inline de esas funciones y se agrega `<script src="js/utils.js"></script>` antes del `<script>` principal. Nada más cambia.
- **Pruebas:** `tests/utils.test.js`, usando `node:test` + `node:assert`.

## Criterios de aceptación (dado / cuando / entonces)

1. Dado `pad2(5)`, cuando se ejecuta, entonces devuelve `"05"`; dado `pad2(12)`, entonces devuelve `"12"`.
2. Dado un objeto `Date` del 31 de diciembre, cuando se usa `ymd`, entonces devuelve `"2025-12-31"` (incluye el caso de cambio de año).
3. Dado `fromYMD("2024-02-29")` (año bisiesto), cuando se compara con `new Date(2024,1,29)`, entonces coinciden en año/mes/día.
4. Dado dos fechas conocidas, cuando se usa `diffDays`, entonces el resultado es la diferencia exacta en días (casos: mismo día → 0, fin de mes → cruza correctamente, fechas invertidas → negativo).
5. Dado una fecha y un número de meses, cuando se usa `addMonths`, entonces devuelve la fecha correcta (incluye el caso de pasar de diciembre a enero del año siguiente).
6. Dado dos coordenadas con una distancia conocida (ej. ~1 km de separación en línea recta), cuando se usa `haversineKm`, entonces el resultado está dentro de un margen de error razonable (±1%) del valor real.
7. Dado `fmtKm(15000)`, cuando se ejecuta, entonces devuelve `"15.000"` (formato `es-CO`).
8. **Criterio de no-regresión (refactor):** después de mover el código a `js/utils.js`, la app abierta en el navegador se comporta exactamente igual que antes — se verifica manualmente en el navegador (no hay E2E automatizado todavía), probando registrar un cambio y ver el estado calculado.

## Plan de pasos

1. Crear `js/utils.js` copiando textualmente las funciones (`pad2`, `ymd`, `fromYMD`, `startOfDay`, `diffDays`, `formatLong`, `formatShort`, `fmtKm`, `addMonths`, `haversineKm`) desde `index.html`, sin modificar su lógica.
2. Agregar el export condicional al final del archivo (`if (typeof module !== 'undefined') module.exports = {...}`).
3. En `index.html`: quitar esas definiciones del `<script>` inline y agregar `<script src="js/utils.js"></script>` justo antes.
4. Escribir `tests/utils.test.js` con los casos de arriba.
5. Correr `node --test tests/` y mostrar la salida real.
6. Abrir la app en el navegador (vista previa) y verificar manualmente que el flujo de registrar un cambio y ver el estado sigue funcionando igual.
7. Commit pequeño.

## Riesgos

Mínimo: son funciones puras, sin dependencias de DOM ni de `localStorage` hoy, así que moverlas de archivo no debería alterar nada. El único riesgo real es un error de tipeo al mover el código, mitigado por copiar textualmente y por la verificación manual del paso 6.

## Qué toca

- Nuevo: `js/utils.js`, `tests/utils.test.js`.
- Modificado: `index.html` (solo quita 10 definiciones de función y agrega una línea `<script src>`, no cambia ninguna lógica).

## Cómo se revierte

Cambio aislado en la rama `mejora/2026-10-05`: revertir el commit de este paso (`git revert <hash>`) deja `index.html` exactamente como estaba, sin afectar nada más.

## Lo que realmente se hizo (M6)

Todo el plan se ejecutó tal cual, con dos ajustes descubiertos durante la construcción:

1. **`sw.js` también se actualizó** (no estaba en el plan original): la lista `ASSETS` que precachea el service worker no incluía `js/utils.js`. Sin este ajuste, la primera carga offline se habría roto. Se agregó `./js/utils.js` a `ASSETS` y se subió `CACHE_NAME` a `v2` para forzar la renovación del caché.
2. **Comando real del runner:** `node --test tests/` (el planeado) falla en este entorno (Windows + Git Bash) con `Cannot find module 'tests'` — Node no resuelve el directorio como se esperaba. El comando que sí funciona de forma confiable es apuntar a un glob explícito: `node --test "tests/**/*.test.js"`. Se deja documentado así para M-10 (CI).

### Evidencia real

`node --test "tests/**/*.test.js"`:

```
✔ pad2 rellena con cero a la izquierda
✔ ymd formatea fecha en cambio de ano
✔ fromYMD reconoce 29 de febrero en ano bisiesto
✔ diffDays: mismo dia es 0
✔ diffDays: cruza fin de mes
✔ diffDays: fechas invertidas da negativo
✔ addMonths cruza de diciembre a enero del ano siguiente
✔ haversineKm: 1 grado de latitud es aproximadamente 111.2 km
✔ fmtKm formatea con separador de miles es-CO
✔ formatLong y formatShort producen texto en espanol
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

Verificación manual en el navegador (servidor estático local, `http://localhost:8420`): se registró un cambio de 15.000 km. El panel mostró "lunes, 5 de octubre de 2026 · 15.000 km" como último cambio, "0 días desde el último cambio", el historial con "5/10/2026 · 15.000 km", y el recordatorio estimado para "lunes, 5 de abril de 2027" (+6 meses, el umbral por defecto) — idéntico al comportamiento esperado antes del refactor. Se confirmó además que `js/utils.js` se carga (`<script src="js/utils.js">` presente) y expone `pad2`/`haversineKm` como funciones globales, igual que cuando estaban inline.
