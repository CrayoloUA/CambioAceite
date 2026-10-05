# M4 — Backlog priorizado

Une los hallazgos de [03-diagnostico.md](03-diagnostico.md) con la necesidad real de [02-lo-que-quieres.md](02-lo-que-quieres.md). Ningún ítem CRÍTICO (autenticación, pagos, datos regulados, migraciones, dependencias nuevas, despliegue, APIs de IA con costo) apareció en el diagnóstico — el proyecto no tiene backend ni base de datos, así que esa categoría queda vacía esta ronda.

Orden de prioridad acordado en M0: red de seguridad (pruebas) → seguridad crítica (sin ítems) → arquitectura/rendimiento → funcionalidades nuevas.

## Lote A — Red de seguridad y robustez (BAJO RIESGO, van primero)

| ID | Eje | Qué es | Por qué (evidencia) | Impacto | Esfuerzo | Riesgo | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|
| M-01 | Calidad | Base mínima de pruebas automatizadas (sin build) para las funciones puras: `haversineKm`, utilidades de fecha | CAL1 — cero pruebas hoy; ya aprobado en M0 | Alto | S | Bajo | Ninguna | Propuesto |
| M-02 | Arquitectura | Separar el cálculo puro de `estimarProximaFecha`/`calcularEnVivo` de la lectura de `localStorage` y la escritura al DOM, sin cambiar su comportamiento (demostrado con pruebas de caracterización) | AR1 — lógica de negocio acoplada a storage/DOM, no se puede probar aislada | Alto | M | Bajo | M-01 (las pruebas de caracterización van primero) | Propuesto |
| M-03 | Calidad | `try/catch` en `saveState` con aviso visible si falla (ej. `localStorage` no disponible) | CAL2 — hoy una excepción no capturada falla en silencio | Medio | S | Bajo | Ninguna | Propuesto |
| M-04 | Seguridad | Validar la forma mínima del JSON importado antes de aceptarlo (¿`history` es arreglo? ¿`mileage`/`date` del tipo esperado?) | SEG1 — hoy solo se valida `typeof === 'object'` | Medio | S | Bajo | Ninguna | Propuesto |

## Lote B — Arquitectura y correcciones menores (BAJO RIESGO)

| ID | Eje | Qué es | Por qué (evidencia) | Impacto | Esfuerzo | Riesgo | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|
| M-05 | Arquitectura | Extraer `guardar(coords)` y la función de recálculo del último cambio como funciones nombradas, una responsabilidad cada una | AR2 — mezcladas hoy en funciones anónimas dentro de los `addEventListener` | Bajo | S | Bajo | Ninguna | Propuesto |
| M-06 | Funcionalidad/bug | Al eliminar un registro del historial, recalcular el "último cambio" por **fecha más reciente**, no por mayor kilometraje | FUN2 — detectado en Fase A y confirmado en M3 (`index.html:655-657`) | Medio | S | Bajo | M-05 (misma zona de código) | Propuesto |
| M-07 | Experiencia | Mejorar el mensaje cuando el botón GPS de estimación queda bloqueado por falta de coordenadas previas | FUN3 — mensaje poco claro hoy | Bajo | S | Bajo | Ninguna | Propuesto |

## Lote C — Documentación y operación (BAJO RIESGO)

| ID | Eje | Qué es | Por qué (evidencia) | Impacto | Esfuerzo | Riesgo | Dependencias | Estado |
|---|---|---|---|---|---|---|---|---|
| M-08 | Operación | Ampliar `README.md` con instalación, uso e instrucciones para instalar la PWA | OPS1 — hoy solo tiene el título | Medio | S | Bajo | Ninguna | Propuesto |
| M-09 | Operación | Agregar `.gitignore` básico (`.env*`, etc.) de forma preventiva | OPS2 — no existe hoy | Bajo | S | Bajo | Ninguna | Propuesto |
| M-10 | Operación | CI simple que corra las pruebas automatizadas en cada cambio | OPS3 — sin CI hoy, pero sin nada que correr hasta que exista M-01 | Medio | S | Bajo | **M-01** (necesita pruebas reales que ejecutar) | Propuesto |
| M-11 | Rendimiento | Comprimir `icon-512.png` (129 KB hoy) | REND1 — solo afecta el momento de instalar, impacto bajo | Bajo | S | Bajo | Ninguna | Propuesto |

## Funcionalidades nuevas (Julián aprueba una por una, no por lote)

| ID | Qué es | Por qué | Impacto | Esfuerzo | Riesgo | Clasificación |
|---|---|---|---|---|---|---|
| M-12 | **Recordatorio automático**: ofrecer/descargar el `.ics` justo al registrar un cambio, en vez de depender de volver a entrar y pedirlo aparte | Respuesta directa a la necesidad real de M2: "me cuesta acordarme" — hoy el recordatorio es 100% manual | Alto | S-M | Bajo | FUNCIONALIDAD |
| M-13 | **Editar un registro del historial** (hoy solo se puede eliminar) | Idea propuesta en M2; corrige errores de tipeo sin tener que borrar y volver a crear | Medio | S | Bajo | FUNCIONALIDAD |
| M-14 | **Registrar costo y taller** en cada cambio (campos opcionales nuevos) | Idea propuesta en M2 para llevar control más completo | Medio | S | Bajo | FUNCIONALIDAD |
| M-15 | **Gráfico del historial de kilometraje** en el tiempo | Idea propuesta en M2; la app ya calcula el ritmo de uso internamente (`estimarProximaFecha`), esto solo lo expone visualmente | Medio | M | Bajo | FUNCIONALIDAD |

## Qué NO haría esta ronda, y por qué

| Idea descartada | Por qué no ahora |
|---|---|
| Multi-vehículo (varios vehículos con su propio historial) | Cambiaría todo el modelo de datos de un objeto global a uno indexado por vehículo — esfuerzo alto, y no fue confirmado como necesidad real (Julián no lo seleccionó explícitamente en M2, solo apareció como opción sugerida). Se deja en el backlog para una ronda futura si realmente se necesita. |
| Sincronización en la nube / backend propio | Contradice "presupuesto cero" y "sin backend" acordado en M0. |
| Notificaciones push reales (que lleguen sin abrir la app) | Requieren un servidor que las dispare — no es gratis ni "sin servidor" (ver nota técnica en M2). M-12 es la alternativa realista dentro del presupuesto. |
| Lint/formateo automático (ESLint, Prettier) | CAL3 del diagnóstico — bajo valor dado que el proyecto deliberadamente no usa `npm`; se deja como convención manual en `CLAUDE.md`. **Descartado explícitamente**, no queda pendiente. |
| Reescribir la app en un framework (React, Vue, etc.) | Ningún hallazgo de M3 lo justifica — sería una reescritura por gusto, no una mejora con problema real detrás (viola YAGNI/"menor cambio que resuelva el problema"). |

## Siguiente paso

Julián elige qué entra a esta ronda y en qué orden (dentro de lo ya acordado: Lote A primero). El resto queda en este backlog para rondas futuras.
