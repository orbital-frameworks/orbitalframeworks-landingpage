# Recuperación y cierre verificable del run b7f61351

Fecha: 2026-10-17
Proyecto: Orbital Frameworks Landing
Run original: `b7f61351-cbd3-43f3-982a-676b238777e9`
Estado histórico del controlador: **BLOCKED** (`EXECUTION_INPUT_DRIFT`)
Estado de los entregables locales: **QA VALIDADO / NO PUBLICADOS POR ESTE RUN**

## Diagnóstico

1. El Director compiló el plan correctamente. Los dos nodos de implementación devolvieron `PASS`.
2. El nodo `independent-both-blocks-qa` produjo un bloque de salida que decía `QA_GO`, pero contenía JSON sintácticamente inválido. El runtime lo clasificó como `EVIDENCE_RESULT_NOT_STRUCTURED`; por ello el veredicto del worker no constituye un PASS del controlador.
3. El intento posterior de recuperación terminó en `EXECUTION_INPUT_DRIFT`. No se alteró ni se desactivó el control de integridad. Tampoco se reescribió el historial del run.
4. El controlador necesita, en un bloque separado y con revisión independiente, investigar el manejo de respuestas de revisor mal formadas y la reconciliación del manifiesto tras mutaciones legítimas. No delegar esa modificación al runtime implicado.

## Recuperación de los resultados

- La página pública de Evidencia ya contenía los arreglos visuales del commit `725d80c`; no se duplicaron.
- Se conservaron y verificaron el preflight blog–LinkedIn, los tests de ProofHub, el handoff editorial, el manifiesto y los documentos operativos.
- Se corrigió el guardrail del CLI: un preflight fallido **no puede generar un pack ni escribir un estado en el manifiesto** aunque no se use `--dry-run`. Una entrada `DRAFT_NO_PUBLICABLE` permanece bloqueada si cualquiera de sus fuentes la declara borrador.
- La instrucción de uso seguro ahora recomienda `--dry-run` como primer paso; `--force` se reserva para un override deliberado.
- No se modificaron publicaciones de LinkedIn, credenciales, cuentas, proveedores de IA, servicios de producción ni otros proyectos.

## Evidencia reproducible

Ejecutados sobre el checkout de Orbital Landing:

```sh
npm run lint
npm run typecheck
npm run build
npm test
npm run verify:build
git diff --check
node scripts/blog-linkedin-gate.mjs --dry-run --json
```

**Resultado:** 62/62 pruebas, lint, types y build aprobados. El preflight HTTPS del artículo publicado pasó 15/15 condiciones, sin modificar el manifiesto. Se agregaron pruebas negativas que impiden efectos de escritura ante respuestas HTTP no válidas.

Las pruebas locales y el preflight **no demuestran** autorización o ejecución de autopost en LinkedIn, ingreso de consultas comerciales ni recepción de eventos en informes de GA4. La publicación de nuevos artículos sigue teniendo su propio flujo de aprobación.

## Release y frontera de autoridad

Este bloque recupera resultados físicos y calidad local. La solicitud de recuperación **no convierte** automáticamente el run histórico BLOCKED en PASS, ni autoriza modificar el control plane.

El plan de ese run prohibía desplegar. La integración local puede convertirse en un commit trazable con stage de paths específicos, pero el push/release al dominio y cualquier publicación social deben respetar una autorización de alcance y las comprobaciones de producción correspondientes.
