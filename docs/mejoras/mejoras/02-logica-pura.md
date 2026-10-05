# M-02 — Separar el cálculo puro de `estimarProximaFecha`/`calcularEnVivo`

Lote A, segundo ítem (depende de M-01, ya hecho). Ver [04-backlog.md](../04-backlog.md), hallazgo AR1.

## Qué es

Hoy `estimarProximaFecha()` lee directo de `localStorage` (vía `getLastChange()/getHistory()/getKmUmbral()/getMesesUmbral()`) y `calcularEnVivo()` escribe directo al DOM. Ninguna de las dos se puede probar sin un navegador. Se extrae el cálculo puro de cada una a `js/logic.js` (recibe datos, devuelve un resultado), dejando en `index.html` solo un envoltorio delgado que lee storage/DOM y llama a la función pura. **No se cambia ninguna fórmula, umbral ni mensaje.**

## Alcance (qué SÍ y qué NO se extrae)

- **Sí:** el cálculo de la fecha proyectada (`calcularProximaFecha`) y la decisión de nivel ok/warn/late + textos/porcentaje (`calcularEstadoKm`).
- **No:** la validación del input del usuario (`parseNum`, `newKm <= 0`, `delta < 0`) y la escritura a `localStorage`/DOM — eso es manejo de entrada y efectos, no cálculo de negocio; se queda en `index.html` tal cual, dentro del envoltorio.

## Criterios de aceptación (dado / cuando / entonces)

1. Dado `last = null`, cuando se llama `calcularProximaFecha`, entonces devuelve `null`.
2. Dado un historial con menos de 2 registros y `mesesUmbral = 6`, cuando se llama `calcularProximaFecha`, entonces devuelve exactamente `addMonths(lastDate, 6)` (el tope por meses, sin proyección por km) — igual que hoy.
3. Dado un historial con 2+ registros cuyo ritmo de uso hace que la proyección por km ocurra antes que el tope por meses, cuando se llama `calcularProximaFecha`, entonces devuelve la fecha proyectada por km.
4. Dado `delta = 0` y `kmUmbral = 3000`, cuando se llama `calcularEstadoKm`, entonces `nivel = 'ok'`, `pct = 0`.
5. Dado un `delta` tal que `pct` esté entre 60 y 99, cuando se llama `calcularEstadoKm`, entonces `nivel = 'warn'`.
6. Dado `delta >= kmUmbral`, cuando se llama `calcularEstadoKm`, entonces `nivel = 'late'` y el detalle incluye el exceso (`delta - kmUmbral`).
7. **No-regresión:** en el navegador, registrar un cambio y luego escribir un km actual que caiga en cada uno de los tres niveles (ok/warn/late) produce el mismo texto, color y barra que el comportamiento documentado en la Fase A — se verifica manualmente, igual que en M-01.

## Nota sobre el orden pruebas/código en este refactor

Es una extracción fiel (copiar la fórmula existente tal cual, sin rediseñarla), no una reescritura. Por eso el orden práctico es: mover el código primero (paso 1), escribir las pruebas contra el resultado real de esa extracción (paso 6, verificando valores reales con Node como en M-01), y cerrar con la verificación visual de los 3 niveles en el navegador (paso 8) como red de seguridad end-to-end. No se escriben pruebas de caracterización contra el código viejo por separado porque no es practicable aislar las funciones inline de `index.html` en Node sin ya haberlas movido — la verificación manual cubre ese hueco.

## Plan de pasos

1. Crear `js/logic.js` con `calcularProximaFecha({ last, history, kmUmbral, mesesUmbral })` y `calcularEstadoKm(delta, kmUmbral)`, copiando la lógica existente tal cual (usa `fromYMD`/`addMonths`/`diffDays`/`fmtKm` de `js/utils.js`).
2. Export condicional para Node, igual que `js/utils.js`.
3. En `index.html`: `estimarProximaFecha()` pasa a ser un envoltorio de 6 líneas que lee storage y llama a `calcularProximaFecha`; dentro de `calcularEnVivo()`, la rama final (una vez validado `newKm`/`delta`) llama a `calcularEstadoKm` en vez de repetir el `if/else` de niveles. Nada más cambia.
4. Agregar `<script src="js/logic.js"></script>` después de `js/utils.js` y antes del script principal.
5. Actualizar `sw.js`: agregar `./js/logic.js` a `ASSETS` y subir `CACHE_NAME` otra vez (como en M-01).
6. Escribir `tests/logic.test.js` con los 6 primeros criterios, usando valores reales verificados con Node (mismo método que M-01).
7. Correr `node --test "tests/**/*.test.js"` y mostrar la salida real.
8. Verificar manualmente en el navegador: un cambio registrado + tres valores de km actual que caigan en ok/warn/late.
9. Commit pequeño.

## Riesgos

Bajo: es una extracción fiel, sin cambiar fórmulas ni umbrales. El riesgo real es un error al "cablear" el envoltorio (pasar mal un parámetro) — mitigado por las pruebas y por probar visualmente los 3 niveles, no solo uno.

## Qué toca

- Nuevo: `js/logic.js`, `tests/logic.test.js`.
- Modificado: `index.html` (solo `estimarProximaFecha` y la rama final de `calcularEnVivo`), `sw.js` (asset nuevo + versión de caché).

## Cómo se revierte

`git revert` del commit de este paso, aislado en `mejora/2026-10-05`.
