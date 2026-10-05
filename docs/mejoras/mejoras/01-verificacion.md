# M7 — Verificación y revisión de M-01

Dos pasadas: primero que cumple lo pedido (criterios de aceptación), luego calidad/seguridad del código nuevo.

## 1. Criterios de aceptación de M5 — con evidencia real

| # | Criterio | Resultado |
|---|---|---|
| 1 | `pad2` rellena con cero | ✅ `node --test` — pasa |
| 2 | `ymd` cruza cambio de año | ✅ pasa |
| 3 | `fromYMD` reconoce 29 feb bisiesto | ✅ pasa |
| 4 | `diffDays` (mismo día, fin de mes, invertidas) | ✅ 3/3 casos pasan |
| 5 | `addMonths` cruza diciembre→enero | ✅ pasa |
| 6 | `haversineKm` ~111.19 km por grado | ✅ pasa (111.1949 km, dentro de ±0.5) |
| 7 | `fmtKm` formato `es-CO` | ✅ pasa (`"15.000"`, `"999"`) |
| 8 | No-regresión visible en el navegador | ✅ verificado en M6: registrar cambio de 15.000 km produjo el mismo resultado que antes del refactor |

Reconfirmado ahora, de forma independiente a M6:

```
node --test "tests/**/*.test.js"
✔ 10 pruebas — pass 10, fail 0
```

## 2. Regresión contra la línea base de M0

Línea base (M0): cero herramientas automatizadas, verificación manual. Estado actual: 10 pruebas automatizadas pasando + verificación manual repetida. Nada que funcionaba antes dejó de funcionar:

- `grep -n "function haversineKm\|const pad2" index.html` → sin resultados: confirmado que no quedaron definiciones duplicadas ni residuales en `index.html`.
- Diff real contra `main`, solo código (sin docs): `index.html` (-19 líneas, solo las funciones movidas), `js/utils.js` (+21, nuevo), `sw.js` (+5/-2, versión de caché y asset nuevo), `tests/utils.test.js` (+57, nuevo). Ningún otro archivo tocado — diff mínimo y acotado exactamente a lo planeado.

No aplica medición de rendimiento (ningún hallazgo de rendimiento estaba en alcance de esta mejora).

## 3. Revisión de código (SOLID y calidad)

- **SRP:** cada función en `js/utils.js` sigue haciendo una sola cosa, igual que antes — el refactor solo cambió su ubicación, no su diseño.
- **DIP:** las funciones movidas ya eran puras (no dependen de `localStorage` ni del DOM) — no había nada que desacoplar en esta mejora; el acoplamiento real (AR1, `estimarProximaFecha`/`calcularEnVivo`) queda para M-02, como estaba planeado.
- **Patrón de export:** el guard `if (typeof module !== 'undefined' && module.exports)` es la forma mínima de que el mismo archivo sirva al navegador (variables globales) y a Node (`require`) sin build ni transpilación — consistente con "sin dependencias" del proyecto.
- Nombres de archivo y de pruebas son descriptivos; no hay `any`, no hay `catch` vacíos, no hay código muerto introducido.

## 4. Seguridad de lo nuevo

- Búsqueda de secretos/credenciales en todos los archivos nuevos y modificados (`js/`, `tests/`, `sw.js`, `index.html`, `.claude/`): sin coincidencias.
- `js/utils.js` no introduce ningún `eval`, `innerHTML` ni entrada de usuario — son funciones matemáticas y de formato puras.
- `.claude/launch.json` es solo configuración de un servidor estático local para verificación manual; no se publica como parte de la app, no contiene secretos.

## 5. Flujo completo (app corriendo)

Verificado manualmente en M6 con servidor local: registrar un cambio de aceite (fecha + km) produce el mismo estado, historial y fecha de recordatorio estimada que antes del refactor. No se repite aquí porque no hubo ningún cambio de código desde esa verificación.

## Hallazgos

Ninguno. Todos los criterios se cumplieron a la primera; los dos ajustes no planeados (actualizar `sw.js`, encontrar el comando real de `node --test`) ya quedaron corregidos y documentados en el cierre de M6.

**Compuerta cumplida: cero hallazgos altos abiertos.**
