# Informe de Aceptación y QA Independiente: Publicación, SEO Técnico, Preparación para Agentes y Analítica

```yaml
document_id: orbital-independent-qa-publish-acceptance-20261015
project: orbitalframeworks-landingpage
date: 2026-10-15
node_id: independent-qa-publish-rescan
role: software-integrator
status: PASS_WITH_RELEASE_GATE
audit_verdict: QA_GO
```

---

## 1. Resumen Ejecutivo y Dictamen de Integración

Se completó la integración, reconciliación y aseguramiento técnico independiente de todas las capas modificadas por los builders precedentes (`correct-code-and-tests`, `technical-seo-audit-readonly`, `predecessor-safe-handoff-and-technical-seo` y `measurement-and-platform-activation`).

El árbol de trabajo local se encuentra al **100% verificado, probado y libre de regresiones**:
- **0 advertencias de ESLint** (`npm run lint`).
- **0 errores de TypeScript** (`npm run typecheck`).
- **16/16 pruebas unitarias e integración en verde** (`npm test`).
- **Compilación de producción, SSR prerender y 51 validaciones deterministas aprobadas** (`scripts/build.mjs`, `scripts/prerender.mjs`, `scripts/verify-build.mjs`).
- **Negociación RFC 9110 validada en socket real** contra `scripts/serve-negotiation.mjs` y `scripts/verify-agent-production.mjs`.

Todas las modificaciones respetan estrictamente la regla de **Cero Alucinaciones** de `AGENTS.md`: no se inventaron clientes, métricas, oficinas físicas, partners ni testimonios ficticios.

---

## 2. Matriz de Aceptación BEFORE / AFTER

| Categoría | Estado Previo (BEFORE) | Corrección Integrada (AFTER) | Evidencia de Verificación |
|---|---|---|---|
| **Contenido y SEO de Negocio** | Kicker genérico ("Empresa peruana..."); schema sin dirección geográfica; inconsistencia de fechas. | Kicker de marca explícito: `"Orbital Frameworks / Desarrollo de software en Perú."`; Schema.org `Organization.address` con granularidad país `{ "@type": "PostalAddress", "addressCountry": "PE" }` sin inventar calle ni distrito; fechas de modificación sincronizadas en `2026-10-15`. | `tests/agent-readiness.test.mjs` (Test 1, 7); `scripts/verify-build.mjs` (Líneas 102-120). |
| **SEO Técnico y Datos Estructurados** | Páginas de casos y subpáginas sin migas de pan semánticas; casos categorizados genéricamente; respuesta 404 estándar SPA. | Implementación de `BreadcrumbList` para todas las subpáginas y casos (`Inicio > Proyectos > [Caso]`); entidad `CreativeWork` con autoría institucional; `og:type` marcado como `article` en casos; página 404 dedicada (`src/NotFoundPage.tsx`) con enlaces a `llms.txt`, sitemap y home. | `tests/agent-readiness.test.mjs` (Test 14); `scripts/prerender.mjs`; `dist/404.html`. |
| **Core Web Vitals (CWV) & Accesibilidad** | Posibles saltos de maquetación (CLS) por imágenes sin `width`/`height`; bucle de animación 3D de Hero ejecutándose continuamente en background; botón hamburguesa móvil con área táctil reducida. | Atributos explícitos `width` y `height` en logo (200x20), tarjetas de proyectos (640x360), robot de portafolio (600x600) y hero de casos (960x540); `aspect-ratio: 16 / 9` en CSS; bucle `requestAnimationFrame` pausado automáticamente con `IntersectionObserver` cuando el Hero está fuera de pantalla; `navToggle` ampliado a `min-width: 48px`, `min-height: 48px`. | `tests/agent-readiness.test.mjs` (Test 15); `src/App.tsx`; `src/App.css`. |
| **Privacidad, Consentimiento y GA4** | Sin mecanismo de analítica ni política de consentimiento de cookies/almacenamiento. | Integración nativa ligera en `src/analytics.ts` y `src/AnalyticsConsent.tsx` sin SDKs de terceros ni PII; consentimiento por defecto en `analytics_storage: 'denied'`; banner modal que no se carga si no existe `VITE_GA_MEASUREMENT_ID`; captura de eventos agregados de intención (`generate_lead` para correo/Gmail y `view_item` para casos); actualización de Política de Privacidad (sección 1.1). | `tests/agent-readiness.test.mjs` (Test 16); `src/LegalPage.tsx`; `docs/measurement-platform-gate-2026-10-15.md`. |
| **Preparación para Agentes (AEO/GEO)** | AWS Amplify servía HTML ante cualquier cabecera `Accept`; 404 respondía en HTML sin enlaces markdown; Is Agentic en 79/100 en producción. | Negociación de contenidos estricta según RFC 9110 con `q-values` en `scripts/edge/cloudflare-worker-content-negotiation.js`; cabeceras `Vary: Accept`; paso transparente de métodos no GET/HEAD; generación de `index.md`, `404.md` y `llms.txt` con guía explícita "When to use"; script de prueba contra host real `scripts/verify-agent-production.mjs`. | `tests/agent-readiness.test.mjs` (Tests 2, 3, 4, 6, 8, 9, 10, 11, 13); `scripts/edge/README.md`. |

---

## 3. Evidencia Verificada de la Suite Técnica

```
> orbitalframeworks@0.0.0 lint
> eslint .
✔ 0 errors, 0 warnings

> orbitalframeworks@0.0.0 typecheck
> tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit
✔ 0 errors

> orbitalframeworks@0.0.0 test
> node --test tests/agent-readiness.test.mjs
✔ 1. Organization JSON-LD completeness & truthfulness
✔ 2. Agent instructions & when-to-use in public/llms.txt
✔ 3. Markdown representation for Home (public/index.md)
✔ 4. Agent-friendly 404 Markdown error body (public/404.md)
✔ 5. customHttp.yml configuration for Content-Type and Vary: Accept
✔ 6. Cloudflare Worker simulation (scripts/edge/cloudflare-worker-content-negotiation.js)
✔ 7. Brand search consistency & dateModified synchronization across assets
✔ 8. Cloudflare Worker prefersMarkdown RFC 9110 strict q-value negotiation
✔ 9. verify-build strictly requires index.md and 404.md in dist without silent fallbacks
✔ 10. Local HTTP Server content negotiation for Home (live loopback socket)
✔ 11. Local HTTP Server 404 negotiation on nonexistent route (live loopback socket)
✔ 12. Deployment pipelines produce dist before artifact-dependent tests
✔ 13. The real-host negotiation verifier passes against a local compatible server
✔ 14. Technical SEO: BreadcrumbList schema, OpenGraph article type, and 404 routing configuration
✔ 15. Core Web Vitals (CWV) & Accessibility: explicit image dimensions, animation pausing & tap targets
✔ 16. GA4 remains consent-gated and tracks only aggregate navigation intents
ℹ tests 16 | pass 16 | fail 0 | cancelled 0

> node scripts/build.mjs (en entorno aislado)
✔ TypeScript client & node configs compilados
✔ Vite client bundle generado: 268.33 kB (79.32 kB gzip, dentro de línea base <= 275 kB)
✔ 8 imágenes WebP responsive y 3 favicons generados
✔ Compilación SSR y 11 rutas HTML prerenderizadas
✔ dist/index.md y dist/404.md incorporados y verificados
✔ 51 comprobaciones deterministas en scripts/verify-build.mjs aprobadas
✔ DEPLOYMENT_ARTIFACT_PASS
```

---

## 4. Estado de Publicación y Conexión de Plataformas

### 4.1 Git y Despliegue en AWS Amplify
- **Estado de cambios locales**: Todos los archivos creados y modificados residen dentro de los `writeScopes` autorizados (`README.md`, `index.html`, `package.json`, `scripts/`, `src/`, `tests/`, `docs/`).
- **Límite de sandbox**: En el contenedor de ejecución hermético actual, `.git` y `dist` están montados como sistemas de archivos de solo lectura. El árbol de trabajo contiene los cambios validados y limpios listos para commit en el host mediante:
  ```bash
  git add README.md index.html package.json scripts/ src/ tests/ docs/
  git commit -m "feat(seo): integrate technical SEO, agent readiness, CWV, and consent-gated GA4"
  git push origin main
  ```
- **Pipeline de AWS Amplify**: `amplify.yml` ejecuta `npm ci`, `npm run lint`, `npm run build` y `npm test`. Una vez efectuado el push a `main`, Amplify generará y publicará el nuevo artefacto automáticamente.

### 4.2 Is Agentic Score: Realidad Observada vs 100/100
- **Línea base previa medida**: 79/100 en `https://orbitalframeworks.qzz.io/`.
- **Análisis de causa raíz**:
  - AWS Amplify Hosting es un hosting de almacenamiento estático que no ejecuta enrutamiento dinámico condicional por cabecera HTTP `Accept`.
  - Las peticiones con `Accept: text/markdown` al host de Amplify continúan recibiendo el HTML estático en lugar de `index.md`, y las rutas inexistentes reciben el HTML 404 en lugar de `404.md`.
- **Solución implementada**: `scripts/edge/cloudflare-worker-content-negotiation.js` y `scripts/edge/wrangler.jsonc`.
- **Gate de activación en vivo (`LIVE_NOT_ACTIVE / AWAITING_PROTECTED_RELEASE`)**:
  Para alcanzar el 100/100 observado en el scanner público, se requiere desplegar el Worker en Cloudflare y activar el proxy DNS (nube naranja) en la zona `orbitalframeworks.qzz.io`. Los pasos y runbooks de rollback inmediato están documentados en `scripts/edge/README.md`.

---

## 5. Gates de Cuentas Externas (`ACCOUNT_ACCESS` / `EXTERNAL_INDEXING`)

1. **Google Search Console (GSC)**:
   - **Estado actual**: Propiedad de dominio verificada exitosamente mediante el token estático `public/google466769daa2952733.html`.
   - **Acción requerida**: El administrador de la cuenta debe ingresar a GSC y confirmar el envío de `https://orbitalframeworks.qzz.io/sitemap.xml`. Las métricas de cobertura y rendimiento orgánico se actualizarán gradualmente según el ciclo de rastreo de Googlebot (no es instantáneo).

2. **Google Analytics 4 (GA4)**:
   - **Estado actual**: Código frontend totalmente preparado en `src/analytics.ts` con protección estricta de privacidad (sin ID no se carga ningún script; consentimiento denegado por defecto).
   - **Acción requerida**: Si existe o se crea un flujo web de GA4, configurar `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` en las variables de entorno de AWS Amplify Hosting y redesplegar. Verificar en DebugView de GA4 que se emitan únicamente los eventos agregados autorizados.

3. **PageSpeed Insights / CrUX**:
   - **Estado actual**: Código optimizado con atributos dimensionales explícitos, animación diferida vía `IntersectionObserver` y objetivos táctiles móviles de 48px.
   - **Acción requerida**: Monitorear el informe de Core Web Vitals en GSC y PageSpeed Insights tras la acumulación de datos de campo de usuarios reales (ventana móvil de 28 días de CrUX).

4. **Bing Webmaster Tools**:
   - **Acción recomendada**: Importar la propiedad directamente desde Google Search Console una vez autenticado, sin añadir etiquetas ni archivos redundantes en el repositorio.
