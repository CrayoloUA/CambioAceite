# M-03 — Manejo de errores al guardar

Lote A, tercer ítem. Ver [04-backlog.md](../04-backlog.md), hallazgo CAL2.

## Qué es

`saveState` (`index.html`) llama a `localStorage.setItem` sin `try/catch`. Si `localStorage` no está disponible (modo privado estricto de Safari, cuota llena), la excepción queda sin capturar: la app falla en silencio y el usuario no se entera de que su cambio NO se guardó. `loadState` ya tiene este manejo (devuelve `{}` si falla); a `saveState` le falta el equivalente **con aviso visible**, porque aquí sí hay algo que el usuario necesita saber (perdió una escritura, no solo una lectura vacía).

## Criterios de aceptación (dado / cuando / entonces)

1. Dado que `localStorage.setItem` funciona normalmente, cuando se llama `saveState`, entonces el comportamiento es idéntico a hoy: persiste el estado, sin ningún aviso visible.
2. Dado que `localStorage.setItem` lanza una excepción (simulado forzando el fallo), cuando se llama `saveState`, entonces el usuario ve un aviso claro (`alert`, el mismo patrón que ya usa el resto de la app para errores — ej. "Elige la fecha del cambio.") y la función no deja la excepción sin capturar (no rompe el flujo que la llamó, no aparece como error no controlado en la consola).
3. No-regresión: con `localStorage` funcionando bien, todo el flujo normal (registrar cambio, ajustar umbral, eliminar historial, importar/exportar) se comporta exactamente igual que antes.

## Por qué la verificación es manual, no con `node --test`

`localStorage` y `alert` son APIs del navegador, no están disponibles como globals en Node. Mockearlas artificialmente para esta prueba puntual agregaría más código de prueba que el propio cambio (6 líneas). Se verifica forzando el fallo desde la consola del navegador — más simple y más fiel al escenario real (Safari en modo privado) que un mock en Node.

## Plan de pasos

1. Editar `saveState` en `index.html`: envolver `localStorage.setItem` en `try/catch`; en el `catch`, `alert(...)` con un mensaje claro; la función devuelve `true`/`false` según el resultado (ningún llamador actual revisa ese valor — no cambia nada más, solo deja la puerta abierta para el futuro).
2. Verificar en el navegador con `localStorage` funcionando normal: registrar un cambio, ajustar umbral — todo igual que antes, sin alerts de más.
3. Verificar forzando el fallo desde la consola del navegador (sobreescribir temporalmente `localStorage.setItem` para que lance) y confirmar que aparece el aviso y no hay excepción sin capturar en consola.
4. Commit pequeño.

## Riesgos

Bajo. Único riesgo real: que el propio `try/catch` quede mal escrito (por ejemplo, que no retorne correctamente) — mitigado probando ambos caminos (éxito y fallo forzado).

## Qué toca

Solo `index.html` (función `saveState`).

## Cómo se revierte

`git revert` del commit de este paso.
