# Fase A — Auditoría del proyecto existente

Auditoría de solo lectura. No se modificó nada del código.

## 1. Qué es el proyecto (reconstruido desde el código)

**CambioAceite** es una PWA de una sola página (`index.html`, ~36 KB, sin build ni dependencias) para registrar el kilometraje de una moto/carro y saber cuándo toca el próximo cambio de aceite. Todo corre en el navegador del usuario; no hay backend, no hay base de datos, no hay autenticación — es una herramienta de un solo usuario y un solo dispositivo.

### Arquitectura

| Capa | Implementación |
|---|---|
| UI | HTML + CSS inline en `index.html`, variables CSS en `oklch()`, modo claro/oscuro automático (`prefers-color-scheme`) |
| Lógica | JS vanilla inline en `index.html`, sin framework ni bundler |
| Persistencia | `localStorage` (clave `aceite_km_state_v1`) — un solo objeto JSON con todo el estado |
| Estado efímero | `sessionStorage` (solo para recordar que el banner de aviso fue cerrado) |
| Offline / instalable | `sw.js` (service worker, cache `cambio-aceite-v1`, estrategia stale-while-revalidate) + `manifest.json` |
| Build / CI | Ninguno — no aplica (no hay paso de compilación) |

### Modelo de datos (reconstruido, vive solo en `localStorage`)

```
aceite_km_state_v1 = {
  lastChange:      { date: "YYYY-MM-DD", mileage: number, lat?: number, lon?: number },
  currentMileage:  number | null,
  kmUmbral:        number,   // default 3000
  mesesUmbral:     number,   // default 6
  history:         [ { date, mileage, lat?, lon? }, ... ]
}
```

### Funcionalidades (reconstruidas desde el código, no hay spec escrita)

1. Registrar cambio de aceite (fecha + km; guarda GPS si el usuario da permiso).
2. Estado en vivo (ok / pronto / atrasado) calculado contra un umbral de km configurable.
3. Estimación de la próxima fecha: compara tope por meses vs. proyección por ritmo real de uso (km/día entre el primer y último registro del historial) y usa la que ocurra primero.
4. Recordatorio descargable en `.ics` con dos alarmas (3 días antes y el mismo día) — funciona sin abrir la app.
5. Banner de aviso cuando se supera el umbral de días o de km.
6. Estimación de km recorridos por GPS (fórmula de Haversine entre el punto del último cambio y la posición actual, con factor ×1.3 para aproximar distancia de carretera vs. línea recta).
7. Historial de cambios con eliminación individual.
8. Ajustes de umbral (km y meses) editables por el usuario.
9. Exportar / importar respaldo en JSON.
10. Instalable como PWA, funciona offline (service worker).

## 2. Tabla de estado

| Área | Estado | Detalle |
|---|---|---|
| README | Falta | Solo tiene el título (`# CambioAceite`), sin instalación, uso ni arquitectura |
| `CLAUDE.md` | Falta | No existe |
| `.gitignore` | Falta | No existe (no hay secretos en el repo, pero tampoco hay barrera si se agregan después) |
| Secretos versionados | Ninguno encontrado | Búsqueda de `api_key/secret/token/password/sk-` en todo el repo: sin coincidencias |
| Pruebas | Ninguna | Cero archivos de test, cero framework de pruebas |
| CI | Ninguna | No hay `.github/workflows` ni ningún pipeline |
| Validación de entradas | Parcial | Los formularios normales validan con `parseNum`/`Number.isFinite`; pero **Importar JSON** solo verifica `typeof === 'object'`, sin esquema — acepta cualquier estructura |
| Dependencias de terceros | Cero | Sin `package.json`, sin librerías externas → superficie de ataque de la cadena de suministro nula |
| Base de datos / RLS | No aplica | No hay backend ni base de datos; todo vive en `localStorage` del navegador |
| Datos sensibles | A vigilar | Se guarda **GPS** (lat/lon) del lugar de cada cambio, sin cifrar, en `localStorage`. No sale del dispositivo (no hay backend), pero no hay aviso de privacidad ni consentimiento explícito más allá del permiso nativo del navegador |
| Accesibilidad | Buen punto de partida | `aria-live`, `role="progressbar"` con `aria-valuenow/min/max`, labels en todos los inputs, `:focus-visible`, iconos con `aria-hidden` |
| Historial de commits | Limpio | 14 commits, progresión normal de un proyecto personal, sin mensajes ni contenido sospechoso |

## 3. Brechas priorizadas

1. **Alto** — Sin pruebas ni CI: cualquier cambio futuro puede romper el cálculo de fechas/km sin que nadie se entere. (Fase 6/10 si se decide invertir en esto; para un proyecto de este tamaño, al menos pruebas unitarias de `estimarProximaFecha`, `haversineKm` y `calcularEnVivo` serían el mínimo razonable).
2. **Medio** — Importar JSON sin validar esquema: un archivo corrupto o mal formado puede dejar la app en un estado inconsistente (ej. `history` no es array, `mileage` no numérico). No es una vulnerabilidad remota (es un archivo que el propio usuario elige desde su disco), pero sí un bug de robustez.
3. **Medio** — Documentación inexistente: sin README real ni `CLAUDE.md`, retomar el proyecto en otra sesión depende de leer todo el código cada vez.
4. **Bajo** — `eliminarDelHistorial` recalcula el "último cambio" eligiendo el registro con **mayor kilometraje**, no el de **fecha más reciente**. Si el usuario registra un cambio con un km menor por error de tipeo, el recálculo podría elegir mal el último cambio tras borrar una entrada.
5. **Bajo** — Sin `.gitignore`: no hay riesgo hoy (no hay secretos), pero es la primera línea de defensa recomendada por el playbook antes de que el proyecto crezca.
6. **Informativo** — El GPS guardado es un dato sensible de ubicación. Como nunca sale del dispositivo (no hay red, no hay backend), el riesgo de privacidad es bajo, pero si en el futuro se agrega sincronización en la nube esto debe revisarse (cifrado, consentimiento, Habeas Data).

## 4. Dónde entrar después de esta auditoría

El proyecto es una utilidad personal pequeña, ya funcional, sin deuda de seguridad grave (cero dependencias, sin secretos, sin backend). No hay necesidad de rehacer nada ya construido. Opciones razonables para continuar, de menor a mayor alcance:

- **Fase 0** (formalizar): dejar por escrito el tipo de proyecto (SPA/PWA sin servidor), el stack (vanilla, sin build) y crear `CLAUDE.md` + `docs/00-supuestos.md` — rápido y da base para todo lo siguiente.
- **Fase 6** (si solo se quiere robustecer lo que ya existe): cerrar las brechas 1, 2 y 4 de arriba sin tocar el diseño ni agregar funcionalidades.
- **Fase 1 en adelante** (si se va a agregar funcionalidad nueva, ej. multi-vehículo, sincronización, notificaciones push reales): conviene pasar por requerimientos y diseño antes de construir.

Julián decide por dónde seguir.
