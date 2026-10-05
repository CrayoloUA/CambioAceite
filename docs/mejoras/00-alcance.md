# M0 — Entrada y alcance

## Proyecto

**CambioAceite** — PWA de un solo archivo (`index.html`) para registrar kilometraje y seguir el próximo cambio de aceite. Sin backend, sin base de datos, sin dependencias de terceros. Ver [docs/A-auditoria.md](../A-auditoria.md) para el mapa completo de arquitectura y funcionalidades.

## Modo de colaboración

Repo de un solo autor: todos los commits (`git log --format='%an <%ae>'`) pertenecen a `julianvarse2006@gmail.com` (variantes de nombre: `CrayoloUA`, `Julian Vargas`, `julian`). No hay otro colaborador ni dueño de código → **no aplica la regla de "nada se escribe sin aprobación por cambio"**; se trabaja en rama y se construye lo aprobado con flujo normal del playbook.

## Objetivo de esta ronda

Dejarlo sólido en general: cubrir todos los ejes aplicables y sumar entre 3 y 6 ideas de funcionalidad nueva bien justificadas.

## Ejes a cubrir

No aplican (confirmado en Fase A): **base de datos** y **IA/automatización** — el proyecto no tiene backend ni usa modelos.

Sí aplican, se cubren todos en M3:
1. Arquitectura y SOLID
2. Seguridad
3. Calidad, pruebas y fiabilidad
4. Funcionalidades y experiencia
5. Interfaz (acotada, vía PLAYBOOK-DISEÑO si alguna mejora lo requiere)
6. Operación y documentación

## Orden de prioridad (M4)

Orden recomendado: primero red de seguridad (pruebas base), luego seguridad crítica, luego arquitectura/rendimiento, y al final funcionalidades nuevas.

## Línea base (antes de cambiar nada)

El proyecto **no tiene ninguna herramienta automatizada hoy**:

| Chequeo | Estado actual |
|---|---|
| Tests | No existen (sin framework, sin archivos de prueba) |
| Lint | No existe |
| Tipos (`tsc`) | No aplica — JS plano, sin TypeScript |
| Build | No aplica — sin paso de compilación |
| Verificación manual | Abrir `index.html` en el navegador y probar a mano |

Decisión aprobada por Julián: como parte de esta ronda se agrega una **base mínima de pruebas automatizadas** (sin build, pensada para la lógica pura: fechas, umbral, estimación GPS) para poder verificar cada mejora con evidencia real en M7, tal como exige el playbook. Esto se especifica y construye como la primera mejora de bajo riesgo del backlog (M5/M6), no se improvisa aquí.

## Rama de trabajo

`mejora/2026-10-05`, creada desde `main` en el estado del commit `c2d8440` (auditoría Fase A). Ningún push, ningún merge a `main` sin aprobación explícita.
