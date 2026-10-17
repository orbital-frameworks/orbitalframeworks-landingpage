# Orbital Frameworks Landing Page: Auditoría de Calidad Conjunta (Joint QA)

```yaml
document_id: orbital-landing-joint-qa-20261017
project: orbitalframeworks-landingpage
version: 1.0.0
authority: canonical-joint-qa-audit
classification: INTERNAL_QA_REPORT
status: QA_GO
runs_audited:
  - run_id: "a7feed14"
    name: "Visual & ProofHub E2E Recovery"
    verdict: "QA_GO"
  - run_id: "93498d21"
    name: "Blog Gate & LinkedIn Pilot Workflow"
    verdict: "QA_GO"
independent_auditor_role: "software-integrator"
timestamp: "2026-10-17T21:47:30Z"
pilot_article_live_url: "https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/"
historic_linkedin_post: "https://www.linkedin.com/feed/update/urn:li:share:7516883410074836992?actorCompanyId=134014070"
```

---

## 1. Veredicto Canónico de Auditoría

- **Audit Verdict:** `QA_GO`
- **Release Readiness:** `READY_FOR_RELEASE` (código local, tests y handoff listos; despliegue a producción desacoplado de autoposting).

Esta auditoría técnica independiente valida la integración y el comportamiento reproducible de los paquetes desarrollados en las fases de recuperación **`a7feed14`** (Auditoría visual/E2E de ProofHub, CTAs y resiliencia sandbox) y **`93498d21`** (Gate determinista en Node.js de blog a LinkedIn, parámetros UTM sanitizados, manifiesto y handoff editorial).

---

## 2. Comprobaciones de Reproducción Local y Evidencia Observada

Todos los comandos fueron ejecutados en el entorno de pruebas local sandbox y validados con salida exacta de consola:

### 2.1 Linting (`npm run lint`)
- **Comando:** `npm run lint`
- **Código de salida:** `0`
- **Resultado:** Ejecución de ESLint 9 sobre todo el árbol del proyecto con 0 errores y 0 advertencias.

### 2.2 Verificación de Tipos TypeScript (`npm run typecheck`)
- **Comando:** `npm run typecheck`
- **Código de salida:** `0`
- **Resultado:** Compilación de tipos sin errores en `tsconfig.app.json` y `tsconfig.node.json`.

### 2.3 Compilación y Generación de Artefactos de Despliegue (`npm run build`)
- **Comando:** `npm run build`
- **Código de salida:** `0`
- **Salida:**
  - Compilación client bundle Vite: `index.html` (9.59 kB), assets optimizados WebP.
  - Generación de 10 imágenes WebP responsivas y 3 variantes favicon.
  - Compilación SSR y prerenderizado completo de 16 rutas HTML (`/`, `/evidencia/`, `/casos/*`, `/servicios/*`, `/blog/*`, `/404`, etc.).
  - Verificación de esquema JSON-LD `Organization`, `Service`, `BreadcrumbList`, `BlogPosting`.
  - Generación de `index.md`, `404.md`, `feed.xml`, `robots.txt` y `sitemap.xml`.
  - Veredicto: `DEPLOYMENT_ARTIFACT_PASS`.

### 2.4 Suite Integral de Tests Automatizados (`npm test`)
- **Comando:** `npm test`
- **Código de salida:** `0`
- **Métricas:** 61 pruebas ejecutadas, 61 superadas, 0 fallidas, 0 canceladas (~6.3s).
- **Desglose de suites:**
  1. `tests/agent-readiness.test.mjs`: 20 tests (JSON-LD, Content negotiation, LLMs.txt, CWV, fuentes auto-hospedadas).
  2. `tests/analytics-funnel.test.mjs`: 5 tests (Consent Mode v2, sanitización PII en UTMs, cero `generate_lead`).
  3. `tests/blog-linkedin-gate.test.mjs`: 11 tests (Alineación de backlog, UTM determinista, fallo cerrado ante borradores, simulación loopback HTTP, prevención de duplicados en manifiesto).
  4. `tests/blog-prerender.test.mjs`: 6 tests (Prerenderizado de blog e índice, metadatos canónicos, Open Graph, schema BlogPosting, feed RSS).
  5. `tests/engagement-ux.test.mjs`: 7 tests (Cards accesibles por teclado, CTAs hacia Gmail, runtime GA4 emulado, tipografía responsive).
  6. `tests/proof-hub-visual-and-cta.test.mjs`: 6 tests (HTML prerenderizado de evidencia, proporciones nativas de las 4 imágenes de proyectos sin recorte, CSS contain, manejo de EROFS/EACCES, viewports 320/390/768/1440).
  7. `tests/services-prerender.test.mjs`: 6 tests (Páginas de servicio prerenderizadas, canonicals, metadatos sociales, schemas y cross-linking).

### 2.5 Preflight Gate de Producción Viva (`node scripts/blog-linkedin-gate.mjs --force`)
- **Comando:** `node scripts/blog-linkedin-gate.mjs --force`
- **Código de salida:** `0`
- **Inspección de URL pública:** `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/`
- **Comprobaciones superadas (15/15):**
  - `[http_200]`: HTTP 200 OK recibido desde Cloudflare (`cf-cache-status: DYNAMIC`).
  - `[html_substantial]`: 21,492 caracteres de HTML prerenderizado.
  - `[no_spa_blank_fallback]`: DOM prerenderizado sustancial presente (sin shell vacío SPA).
  - `[canonical_tag]`: `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/`.
  - `[h1_heading]`: `"Software a medida o SaaS: cómo decidir según el proceso de tu empresa"`.
  - `[og_title]`: Presente y coherente con el H1.
  - `[og_description]`: Presente y descriptivo de criterios de decisión empresarial.
  - `[og_url]`: Idéntico a la canonical.
  - `[og_type_article]`: Tipo `article`.
  - `[robots_indexable]`: Indexable sin directiva `noindex`.
  - `[no_draft_banner]`: Estado público limpio sin avisos de borrador.
  - `[cta_contact_channel]`: Enlace verificado hacia `contact.orbitalframeworks@gmail.com`.
  - `[factual_integrity]`: Cero números telefónicos ficticios o promesas infladas.
  - `[internal_navigation]`: Enlaces verificados hacia servicios y casos de portafolio.
  - `[sitemap_inclusion]`: URL confirmada en `sitemap.xml`.
- **Enlace de campaña generado:**
  `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom`

### 2.6 Verificación Visual y Resiliencia EROFS (`node scripts/verify-wasy-visual.mjs`)
- **Comando:** `node scripts/verify-wasy-visual.mjs`
- **Código de salida:** `0`
- **Métricas:** Comprobación de proporciones de aspecto reales sobre Chrome CDP en 6 resoluciones:
  - `mobile-320` (320 × 760)
  - `mobile-375` (375 × 812)
  - `mobile` (390 × 844)
  - `mobile-414` (414 × 896)
  - `tablet-768` (768 × 1024)
  - `desktop` (1440 × 1057)
- **Proyectos evaluados:** Localisa (1905×852), Wasy (960×704), Checkio (1917×904), PeruLog Pallets (1336×601). Todos dentro de tolerancia delta < 0.025.
- **Resiliencia EROFS observada:** El directorio de capturas se redirigió limpiamente a `/tmp/orbital-landing-visual-qa` ante restricciones de solo lectura del sistema de archivos, completando `WASY_VISUAL_QA_PASS`.

---

## 3. Matriz de Estado: Diferenciación READY_FOR_RELEASE vs LIVE

| Componente | Nivel de Estado | Evidencia y Justificación Operativa |
| :--- | :---: | :--- |
| **Artículo Piloto (Blog Web)** | **`LIVE`** | Publicado en el sitio web con HTTP 200, canonical activa, HTML prerenderizado de 21,492 caracteres e indexación permitida en `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/`. |
| **Paquete de Handoff LinkedIn** | **`READY_FOR_RELEASE`** | Validado por el preflight gate (`docs/linkedin-pilot-handoff-2026-10-17.md`). Listo para ser distribuido de forma manual y desacoplada por el operador. Cero autoposting por código. |
| **Post Histórico LinkedIn** | **`IMMUTABLE_PRESERVE`** | Post institucional previo (`urn:li:share:7516883410074836992`) sin enlace. Queda preservado sin alteraciones, duplicaciones o reaplicación de UTMs. |
| **Backlog Editorial (B2B-02 a B2B-08)** | **`DRAFT_PENDING`** | Definidos en `docs/BLOG_TO_LINKEDIN_BACKLOG.md` bajo `DRAFT_NO_PUBLICABLE`. El preflight gate bloquea fail-closed cualquier intento de generar paquetes de distribución antes de que el propietario responda sus preguntas prioritarias de campo. |
| **Código ProofHub / Evidencia** | **`READY_FOR_RELEASE`** | En `HEAD` (`src/ProofHubPage.tsx`, `src/ProofHubPage.css`) con tests y visual QA superados. Incorporado en los artefactos de compilación `/tmp/orbital-dist`. |

---

## 4. Auditoría de Git Diff y Preservación del Repositorio

La inspección de `git status` y `git diff` confirma que:
1. **Modificaciones controladas:**
   - `docs/linkedin-pilot-handoff-2026-10-17.md`: Información técnica y operativa del handoff con UTM limpio y sin PII.
   - `scripts/verify-wasy-visual.mjs`: Manejo de excepciones `EROFS`/`EACCES` con fallback a `/tmp/orbital-landing-visual-qa`.
   - `tests/engagement-ux.test.mjs`: Resiliencia en la resolución de `dist/` cuando el directorio de host es de solo lectura.
2. **Archivos agregados dentro de scopes concedidos:**
   - `scripts/blog-linkedin-gate.mjs`: CLI determinista de preflight y validación de 15 puntos.
   - `tests/blog-linkedin-gate.test.mjs`: 11 tests automatizados del gate.
   - `tests/proof-hub-visual-and-cta.test.mjs`: 6 tests de proporciones, responsive y CTA Gmail.
   - `docs/blog-linkedin-manifest.json`: Manifiesto de publicación y control de duplicados.
   - `docs/BLOG_LINKEDIN_OPERATOR_GUIDE.md`: Guía de operaciones para el publicador humano.
   - `docs/BLOG_LINKEDIN_OWNER_REVIEW.md`: Reporte ejecutivo de revisión.
   - `docs/ORBITAL_LANDING_VISUAL_RECOVERY_QA.md`: Reporte de validación visual de ProofHub.
   - `docs/ORBITAL_LANDING_JOINT_QA.md`: Este reporte de auditoría conjunta.
3. **Preservación de trabajo ajeno:**
   - Todos los activos multimedia generados concurrentemente (`public/wasy-catalog-*`, `src/assets/wasy.png`) y documentos del backlog permanecen intactos.

---

## 5. Auditoría de Privacidad, Consentimiento GA4 y Prevención de PII

1. **Google Consent Mode v2:**
   - En estado no consentido, la suite `tests/analytics-funnel.test.mjs` y `tests/agent-readiness.test.mjs` certifican que se bloquea la emisión de eventos y cookies analíticas.
2. **Cero Falso Lead en el Navegador:**
   - El runtime del cliente no dispara el evento `generate_lead`. Toda interacción de contacto genera exclusivamente eventos de intención agregada (`contact_intent`, `article_to_contact`, `article_to_service`).
   - La calificación de leads ocurre únicamente mediante la recepción humana de correos en `contact.orbitalframeworks@gmail.com`.
3. **Sanitización Estricta de Parámetros URL (Anti-PII):**
   - El generador determinista `sanitizeAndValidateUtmUrl` rechaza cualquier clave sensible (`email`, `phone`, `user`, `token`, `name`) abortando con `RECHAZADO_POR_POLITICA_PII`.
   - La campaña asignada al artículo piloto (`pilot_saas_vs_custom`) es única y previene colisiones.

---

## 6. Procedimiento Ligero de Auditoría Mensual UX / SEO / Conversión

Para mantener la salud del sitio con un mantenimiento inferior a 30 minutos al mes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 AUDITORÍA MENSUAL LIGERA (CADA 30 DÍAS)                     │
└─────────────────────────────────────────────────────────────────────────────┘
  1. Google Search Console (5 min):
     - Cobertura de URLs (/blog/ y /servicios/): 0 errores 404/5xx.
     - Posicionamiento orgánico de palabras clave B2B en Perú.
  2. Inspección Visual Responsive (10 min):
     - Ejecutar `node scripts/verify-wasy-visual.mjs` para verificar ausencia
       de desbordamientos horizontales en 320px, 390px y 1440px.
     - Validar que el CTA de Gmail compose abra correctamente con plantilla.
  3. Conciliación GA4 vs Bandeja de Entrada (10 min):
     - Comparar eventos `contact_intent` vs correos recibidos en
       contact.orbitalframeworks@gmail.com.
     - Confirmar que ningún lead ficticio se haya registrado en GA4.
  4. Manifiesto y Gate Editorial (5 min):
     - Ejecutar `node scripts/blog-linkedin-gate.mjs` antes de cualquier
       nueva distribución para garantizar integridad del sitemap y HTML.
```

---

## 7. Limitaciones Observadas y Problemas Residuales

1. **Entorno Sandbox Read-Only:**
   - En este entorno bubblewrap, el directorio `dist/` en el árbol raíz del proyecto puede ser de solo lectura. Los scripts `scripts/build.mjs`, `scripts/verify-wasy-visual.mjs`, `tests/engagement-ux.test.mjs` y `tests/proof-hub-visual-and-cta.test.mjs` manejan esta condición mediante fallback automático a `/tmp/orbital-dist` y `/tmp/orbital-landing-visual-qa`.
2. **Despliegue y Publicación Desacoplados:**
   - El paquete de entrega de LinkedIn (`docs/linkedin-pilot-handoff-2026-10-17.md`) requiere publicación manual por el operador humano. No existe ni debe existir un script de autoposting hacia redes sociales.
3. **Dependencia de Red Externa:**
   - El preflight gate del CLI de Node ejecuta peticiones HTTPS GET nativas contra la URL pública. No requiere ni utiliza navegadores headless de Antigravity (Playwright), evitando bloqueos de permisos.

---

## 8. Conclusión

El código, las pruebas automatizadas, los artefactos de compilación y los documentos de entrega cumplen exhaustivamente los requisitos de aceptación. No se detectaron regresiones ni violaciones a las reglas de marca o integridad de datos.

- **Veredicto Final:** `QA_GO`
- **Recomendación:** Proceder con la distribución manual del paquete LinkedIn para el artículo piloto según la ventana operativa sugerida (2 a 4 horas post-despliegue).
