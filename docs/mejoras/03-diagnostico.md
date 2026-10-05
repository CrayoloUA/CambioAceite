# M3 — Diagnóstico por ejes (solo lectura)

Ningún hallazgo se corrige en esta fase; esto alimenta el backlog de M4. Ejes aplicables confirmados en M0: arquitectura/SOLID, seguridad, rendimiento, calidad/pruebas, funcionalidades/experiencia, operación/documentación. (Base de datos e IA no aplican — el proyecto no tiene backend.)

## 1. Arquitectura y SOLID

| ID | Severidad | Archivo:línea | Evidencia | Arreglo mínimo sugerido |
|---|---|---|---|---|
| AR1 | Media | `index.html:452-474` (`estimarProximaFecha`), `index.html:535-580` (`calcularEnVivo`) | La lógica de negocio llama directo a `getLastChange()/getHistory()` (lee `localStorage`) y escribe directo sobre `estadoEl`, `kmDetalleEl`, etc. (DOM). No hay forma de probar el cálculo sin un navegador. | Separar el cálculo puro (recibe los datos como parámetros, devuelve un resultado) de la parte que lee storage y pinta el DOM — sin reescribir la función ni cambiar su comportamiento. Esto es lo que habilita la base de pruebas ya aprobada en M0. |
| AR2 | Baja | `index.html:773-803` (click de `btnRegistrar`), `index.html:649-663` (`eliminarDelHistorial`) | Geolocalización, persistencia y re-render mezclados en una sola función anónima sin nombre propio. | Extraer `guardar(coords)` y la función que recalcula el último cambio con nombres propios y una sola responsabilidad cada una, sin tocar su comportamiento. |
| AR3 | Baja (informativo) | `index.html` completo (851 líneas) | Un solo archivo con CSS + HTML + JS. A este tamaño no es un problema real todavía. | Ninguno ahora; vigilar si crecen las funcionalidades (multi-vehículo, edición de historial) para no acumular desorden. |

## 2. Seguridad

| ID | Severidad | Archivo:línea | Evidencia | Arreglo mínimo sugerido |
|---|---|---|---|---|
| SEG1 | Media | `index.html:701-713` (handler de `inputImportar`) | Solo valida `typeof parsed === 'object' && parsed !== null` antes de reemplazar todo el estado. Un archivo con `history` que no es arreglo, o `mileage` no numérico, se acepta igual y rompe el render después. | Agregar una validación mínima de forma (sin librerías: comprobar que `history` sea arreglo y que cada entrada tenga `date`/`mileage` del tipo esperado) antes de aceptar el import. |
| SEG2 | Informativo | `index.html:782` (`data.lat=coords.latitude`), botón "Exportar JSON" | El GPS del lugar de cada cambio se guarda sin cifrar y sale tal cual en el `.json` exportado. Nunca sale del dispositivo por red (no hay backend), riesgo bajo hoy. | Ninguno urgente; si algún día se agrega sincronización en la nube, revisar cifrado/consentimiento en ese momento. |

Sin hallazgos nuevos de inyección, XSS o CSRF: los únicos usos de `innerHTML` (`index.html:637`, `641`) interpolan solo valores ya formateados por `formatShort`/`fmtKm` (fecha y número), nunca texto libre del usuario.

## 3. Rendimiento

Sin hallazgos de impacto real — la app ya es liviana por construcción: cero dependencias, listas de historial pequeñas por naturaleza (un registro cada varios meses), service worker con caché stale-while-revalidate ya implementado.

| ID | Severidad | Evidencia | Nota |
|---|---|---|---|
| REND1 | Baja (opcional) | `icon-512.png` pesa 129 KB | Solo afecta el momento de instalar la PWA, no el uso diario. Comprimir el PNG es opcional, no urgente. |

## 4. Calidad, pruebas y fiabilidad

| ID | Severidad | Archivo:línea | Evidencia | Arreglo mínimo sugerido |
|---|---|---|---|---|
| CAL1 | Alta | Todo el proyecto | Cero archivos de prueba, cero framework. Ya aprobado en M0 agregar una base mínima. Candidatas naturales por ser puras hoy mismo: `haversineKm` (`index.html:380-385`) y las utilidades de fecha (`index.html:371-387`); el núcleo de `estimarProximaFecha`/`calcularEnVivo` una vez separado de DOM/storage (ver AR1). | Pruebas unitarias simples (sin build) sobre las funciones puras primero; ampliar a la lógica de negocio tras aplicar AR1. |
| CAL2 | Media | `index.html:395-397` (`saveState`) | No tiene `try/catch`. Si `localStorage` no está disponible (modo privado estricto de Safari, cuota llena), cualquier acción de guardar lanza una excepción sin capturar: la app falla en silencio y el usuario no recibe ningún aviso. | Envolver `saveState` en `try/catch` y mostrar un aviso visible si falla, igual que ya hace `loadState` (`index.html:392`). |
| CAL3 | Baja (opcional) | Todo el proyecto | Sin lint ni formateo automático. | Dado que el proyecto deliberadamente no usa `npm`, no es prioritario — se puede dejar como convención manual en `CLAUDE.md` en vez de agregar herramientas nuevas. |

## 5. Base de datos y datos

No aplica — confirmado en M0 (sin backend, sin base de datos).

## 6. Funcionalidades y experiencia

| ID | Severidad | Archivo:línea | Evidencia | Nota |
|---|---|---|---|---|
| FUN1 | Alta | `index.html:301` (botón de recordatorio), ya documentado en M2 | El recordatorio es 100% manual — no resuelve la necesidad real de Julián de no olvidarse del cambio. | Candidato principal del backlog (M4); la solución concreta se especifica ahí, no aquí. |
| FUN2 | Baja | `index.html:655-657` | `eliminarDelHistorial` recalcula el "último cambio" eligiendo el registro de **mayor kilometraje**, no el de **fecha más reciente** — ya detectado en la Fase A. | Cambiar el criterio de selección a la fecha más reciente del historial restante. |
| FUN3 | Baja | `index.html:809-812` | El botón GPS para estimar km solo funciona si el último cambio registrado tiene coordenadas guardadas; si no, queda bloqueado hasta el próximo registro con GPS activo. No es un bug, pero el mensaje podría explicar mejor cómo recuperar la función. | Mejorar el texto de aviso, sin cambiar el comportamiento. |
| FUN4 | Informativo | — | Ideas de Julián en M2 (editar un registro del historial, varios vehículos, gráfico/costo del historial) se llevan al backlog como FUNCIONALIDAD, no como hallazgo de diagnóstico. | — |

Accesibilidad: sin hallazgos nuevos respecto a la Fase A (ya hay `aria-live`, labels en todos los inputs, `:focus-visible`). Medir contraste real con una herramienta queda para cuando se construya o verifique algo que toque la interfaz (M7 de la mejora que corresponda). SEO no aplica — es una herramienta personal instalable, no un sitio público de contenido.

## 7. Operación y mantenimiento

| ID | Severidad | Archivo:línea | Evidencia | Arreglo mínimo sugerido |
|---|---|---|---|---|
| OPS1 | Media | `README.md:1` | Solo tiene el título (`# CambioAceite`), sin instrucciones de instalación, uso ni capturas. | Ampliar el README (ya hay `CLAUDE.md` con la parte técnica; el README debe hablarle al usuario final/futuro colaborador, no solo a Claude). |
| OPS2 | Baja | Raíz del repo | Sin `.gitignore` — ya señalado en la Fase A, aún no resuelto. | Agregar uno básico (`.env*`, `node_modules`, etc.) de forma preventiva aunque hoy no haya secretos. |
| OPS3 | Baja (condicional) | — | Sin CI. De bajo valor mientras no exista ninguna prueba que correr. | Agregar CI justo después de CAL1 (pruebas), no antes — para que tenga algo real que verificar. |
| OPS4 | Informativo | — | No hay workflows ni configuración de despliegue en el repo; no se pudo confirmar si la app se distribuye vía GitHub Pages o solo se usa localmente/instalada desde el archivo. | Confirmar con Julián únicamente si se llega a una fase de publicación. |

## Resumen para M4

Hallazgos de severidad **Alta**: CAL1 (sin pruebas, ya aprobado) y FUN1 (recordatorio manual, necesidad real de Julián). El resto son Media/Baja/informativos — ninguno bloqueante, ninguno de seguridad crítica según la clasificación del playbook (nada de autenticación, pagos, datos regulados, migraciones o dependencias nuevas en este diagnóstico).
