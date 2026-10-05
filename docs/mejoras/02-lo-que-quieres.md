# M2 — Qué quieres tú

## Frustraciones de uso hoy

Ninguna en particular — la app funciona bien tal como está.

## Idea / necesidad real (cita textual de Julián)

> "nose me cuenta mucho acrodarme de los cambios de aceites y necesito algo que me ayude a recordar no se"

Traducción a necesidad concreta: **el problema no es la app, es acordarse de usarla.** Hoy el único mecanismo de recordatorio es el botón "Agregar recordatorio al calendario", que:
- No se activa solo — hay que entrar a la app, calcular la fecha estimada y descargar manualmente el `.ics` cada vez que se registra un cambio.
- Si Julián no hace ese paso extra justo después de registrar el cambio, no queda ningún recordatorio programado en ningún lado hasta la próxima vez que abra la app (y para entonces puede que ya se le haya pasado la fecha).

Esto es justo la brecha a resolver: pasar de "recordatorio manual que hay que acordarse de generar" a algo que quede programado solo, sin depender de que Julián repita el paso.

### Restricción técnica real (para tener en cuenta en M3/M4, sin decidir la solución aquí)

Con presupuesto cero y sin backend (confirmado en M0), las opciones realistas son limitadas:
- Una notificación push de verdad (que llegue aunque el celular esté dormido y la app cerrada) normalmente necesita un servidor que la dispare — no es gratis ni "sin servidor".
- Lo que SÍ se puede hacer sin backend y sin costo: que el archivo `.ics` (que ya existe y ya genera alarmas 3 días antes y el mismo día) se ofrezca o se descargue automáticamente justo al registrar un cambio, en vez de depender de que Julián vuelva a entrar y lo pida aparte. El recordatorio real después lo dispara el calendario del celular (Google Calendar, Apple Calendar, etc.), no la app.
- Esto se detalla con impacto/esfuerzo/riesgo en el backlog (M4), no se decide todavía.

## Restricciones para esta ronda

- **Presupuesto cero** — nada de servicios de pago ni APIs con costo (ya era el default de Julián, confirmado explícitamente para esta ronda).
- Sin otras restricciones de tiempo ni de partes del código que no se puedan tocar.

## Investigación externa

No se investigan apps parecidas en esta ronda — las ideas ya recogidas bastan para armar el backlog.
