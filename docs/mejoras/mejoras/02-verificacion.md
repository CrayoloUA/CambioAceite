# M7 — Verificación y revisión de M-02

## 1. Criterios de aceptación de M5 — con evidencia real

| # | Criterio | Resultado |
|---|---|---|
| 1 | `last=null` → `null` | ✅ pasa |
| 2 | <2 registros → usa tope por meses | ✅ pasa (`2025-07-15`) |
| 3 | Ritmo rápido → proyección por km gana | ✅ pasa (`2025-04-11`) |
| 4 | `delta=0` → `ok`, `pct=0` | ✅ pasa |
| 5 | `pct` 60-99 → `warn` | ✅ pasa |
| 6 | `delta>=umbral` → `late` con exceso | ✅ pasa |
| 7 | No-regresión visual (3 niveles) | ✅ verificado en M6: ok/warn/late con textos idénticos a los documentados en la Fase A |

Reconfirmado ahora, de forma independiente a M6:

```
node --test "tests/**/*.test.js"
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

## 2. Regresión contra la línea base

Diff acumulado de la rama completa (M-01 + M-02) contra `main`, solo código:

```
index.html          | 78 ++++------------------------
js/logic.js         | 54 +++++++++++++++++++
js/utils.js         | 21 +++++++
sw.js               |  6 ++--
tests/logic.test.js | 57 +++++++++++++++++++
tests/utils.test.js | 57 +++++++++++++++++++
6 files changed, 209 insertions(+), 64 deletions(-)
```

`index.html` solo perdió líneas (funciones movidas a `js/`), ningún otro archivo de la app fue tocado fuera de lo planeado. Nada que funcionaba antes dejó de funcionar: los 16 tests cubren tanto lo de M-01 como lo nuevo de M-02, y la verificación manual de M6 confirmó los 3 niveles visualmente.

## 3. Revisión de código (SOLID y calidad)

- **SRP:** `calcularProximaFecha` y `calcularEstadoKm` hacen exactamente una cosa cada una (proyectar fecha / decidir nivel), igual que las funciones originales — solo cambiaron de ubicación y de forma de recibir sus datos (parámetros explícitos en vez de leer storage directo).
- **DIP cumplido:** esta era la mejora que debía resolver AR1 (lógica de negocio acoplada a `localStorage`/DOM). Ahora ambas funciones son puras: reciben datos, devuelven datos, no tocan `localStorage` ni el DOM. Los envoltorios en `index.html` (`estimarProximaFecha`, la rama final de `calcularEnVivo`) son los únicos que leen storage/escriben DOM, y son deliberadamente delgados (6 líneas cada uno).
- Nombres descriptivos, sin `any`, sin `catch` vacíos, sin código muerto. El objeto que devuelve `calcularEstadoKm` (`{nivel, texto, detalle, pct}`) documenta su propia forma por los nombres de sus campos — no hace falta un tipo aparte en un proyecto sin TypeScript.

## 4. Seguridad de lo nuevo

Búsqueda de secretos/credenciales en todos los archivos nuevos y modificados: sin coincidencias. `js/logic.js` no introduce `eval`, `innerHTML` ni manejo de datos sensibles — son funciones matemáticas y de formato puras, igual que `js/utils.js` en M-01.

## 5. Flujo completo (app corriendo)

Ya verificado en M6 con los 3 niveles (ok/warn/late) contra un cambio real registrado — no se repite aquí porque no hubo cambios de código desde esa verificación.

## Hallazgos

Ninguno. **Compuerta cumplida: cero hallazgos altos abiertos.**

Con esto, el hallazgo AR1 del diagnóstico (M3) queda resuelto: la lógica de negocio central de la app (`js/utils.js` + `js/logic.js`) es ahora 100% pura y testeable sin navegador.
