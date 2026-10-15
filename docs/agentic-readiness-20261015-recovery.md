# Informe Técnico de Recuperación: Preparación Agentic Readiness & Negociación de Contenidos

```yaml
document_id: orbital-agentic-readiness-20261015-recovery
project: orbitalframeworks-landingpage
date: 2026-10-15
status: PASS_WITH_RELEASE_GATE
traceability:
  prior_terminal_run_id: "877ed736-a87e-43d9-9b57-d18b55fb8693"
  prior_outcome: "FAILED_LIMIT (DIRECTOR_REPLAN_EXHAUSTED tras 4 replans repetitivos)"
  recovery_node: "correct-code-and-tests"
  role: "software-builder"
```

---

## 1. Resumen Ejecutivo y Trazabilidad

El run previo (`877ed736-a87e-43d9-9b57-d18b55fb8693`) terminó en estado terminal `FAILED_LIMIT / DIRECTOR_REPLAN_EXHAUSTED` tras consumir 4 replans consecutivos por quedar atrapado en un ciclo de `INNER_QA_BLOCK`. La causa raíz fundamental fue un problema conceptual de delimitación de capas: se intentó resolver la negociación de contenidos en producción exclusivamente modificando artefactos estáticos (`customHttp.yml`, `index.md`, servidor local en loopback), esperando que AWS Amplify Hosting ejecutara enrutamiento condicional dinámico por cabecera `Accept`. Como AWS Amplify Hosting es un hosting puramente estático/CDN y no ofrece enrutamiento condicional sin una capa edge previa, la verificación de producción fallaba de manera recurrente.

Asimismo, el run anterior acumuló cuatro defectos colaterales:
1. Una función CloudFront con sintaxis ESM incompatible que no pasaba parseo en el runtime de CloudFront Functions (`F2`).
2. Afirmaciones no verificadas en `public/llms.txt` y `public/index.md` sobre operación remota y carencia de sede física, violando la regla de *Cero Alucinaciones* de `AGENTS.md` (`F3`).
3. Inversión de pesos en la cabecera `Accept` (`q-values`) según RFC 9110, aceptando erróneamente `q=0` y priorizando Markdown sobre HTML en empates (`F4`).
4. Incoherencia temporal de `dateModified` entre el JSON-LD de `index.html` (`2026-08-15`), `scripts/prerender.mjs` (`2026-08-15`) y `public/sitemap.xml` (`2026-10-15`) (`F5`).

Este run de recuperación aplicó el principio de cambio mínimo y separación estricta de responsabilidades: los artefactos locales (`dist/index.md`, `dist/404.md`, `verify-build.mjs`, tests deterministas) quedan al 100% verificados localmente, mientras que la activación en producción (`F1`) se clasifica formalmente como un gate externo de release (`LIVE_NOT_ACTIVE / AWAITING_PROTECTED_RELEASE`), sin afirmar despliegue no efectuado ni requerir permisos protegidos de infraestructura.

---

## 2. Matriz Diagnóstica BEFORE / AFTER (F1 - F5)

| ID | Severidad | Hallazgo | Estado Previo (BEFORE) | Corrección Implementada (AFTER) | Evidencia de Verificación |
|---|---|---|---|---|---|
| **F1** | **BLOCKER** | Negociación en producción no cableada en Amplify | Se pretendía que la publicación estática en AWS Amplify resolviera negociación `Accept` sin capa edge activa. QA bloqueaba al comprobar el dominio en vivo. | Formalización de la frontera de responsabilidades. Localmente se generan y validan `dist/index.md`, `dist/404.md` y suite determinista. La activación en vivo se clasifica como gate externo `LIVE_NOT_ACTIVE / AWAITING_PROTECTED_RELEASE` vía Cloudflare Worker. Cero afirmaciones de deploy ficticio. | `node scripts/build.mjs` y `npm test` pasan al 100%. Plan de release documentado en `scripts/edge/README.md`. |
| **F2** | **HIGH** | Función CloudFront no deployable con sintaxis ESM | `scripts/edge/cloudfront-content-negotiation.js` usaba `export function viewerRequestHandler`, provocando `SyntaxError: Unexpected token export` en CloudFront Functions. No soportaba fetch a origen ni bodies Markdown en 404. | Eliminación íntegra de `scripts/edge/cloudfront-content-negotiation.js`, retiro de Tests 6 y 9 de `tests/agent-readiness.test.mjs`, y depuración de `scripts/edge/README.md`. Se estandariza exclusivamente en UNA sola ruta edge viable: Cloudflare Worker. | Archivo eliminado del árbol de trabajo; suite de tests y build limpios de referencias a CloudFront Functions. |
| **F3** | **HIGH** | Afirmaciones no verificadas de operación remota / sin oficina física | `public/llms.txt` y `public/index.md` afirmaban que Orbital Frameworks "opera de manera 100% remota sin oficina física de atención presencial", alegato no sustentado en el código base original. | Saneamiento total de `public/llms.txt` y `public/index.md`. Se eliminaron todas las menciones a "sin sede física", "operación remota" o "atención presencial". Se preserva únicamente la verdad verificable de `contactPoint` (correo oficial `contact.orbitalframeworks@gmail.com`, LinkedIn corporativo y país Perú). | `grep -rn -i "sede\|remot\|oficina" public/ index.html` devuelve 0 ocurrencias no autorizadas. Test 2 y Test 3 validan ausencia de alucinaciones. |
| **F4** | **MEDIUM** | Inversión de pesos en negociación de cabecera `Accept` (`q-values`) | `prefersMarkdown` aceptaba `text/markdown;q=0` (explícitamente inaceptable por RFC 9110) y priorizaba Markdown sobre HTML en caso de pesos idénticos (`mdQ >= htmlQ`). | Reescribir `prefersMarkdown` en `scripts/edge/cloudflare-worker-content-negotiation.js`: parseo estricto de parámetros `q=`; rechazo forzado si `mdQ <= 0`; desempate estricto a favor de HTML (`mdQ === htmlQ` -> `false`); sólo devuelve `true` si `mdQ > htmlQ` y `mdQ > 0`. | Test 8 cubre exhaustivamente: normal, prioridades explícitas, `q=0`, empates a favor de HTML, comodines `*/*` y cabeceras vacías. |
| **F5** | **MEDIUM** | Incoherencia de `dateModified` entre JSON-LD, prerender y sitemap | `public/sitemap.xml` fijaba `lastmod` en `2026-10-15` para Home, Sobre Orbital y Evidencia, pero `index.html` tenía `2026-08-15` y `scripts/prerender.mjs` forzaba `2026-08-15`. | Sincronización exacta: `index.html` se actualizó a `2026-10-15`; `scripts/prerender.mjs` mapea explícitamente `2026-10-15` para las páginas actualizadas, manteniendo las fechas históricas legales (`2026-08-28`) y de casos (`2026-08-15`, `2026-08-30`). | Test 1 y Test 7 verifican concordancia exacta entre `index.html`, `scripts/prerender.mjs` y `public/sitemap.xml`. |

---

## 3. Delimitación Estricta: Realidad Publicada vs Simulación Local

Para no repetir el fallo del run anterior, se explicita la diferencia técnica entre ambas superficies:

1. **Superficie Local (Autorizada y Verificada al 100%)**:
   - `public/index.md` y `public/404.md` son generados y copiados fielmente a `dist/` durante el build.
   - `scripts/verify-build.mjs` exige la presencia física de ambos archivos en `dist/` y falla con código de salida distinto de cero si alguno falta.
   - `scripts/serve-negotiation.mjs` provee un servidor HTTP loopback que demuestra la adhesión completa al estándar RFC 9110 en sockets locales (`127.0.0.1`).
   - El pipeline local (`scripts/build.mjs`) maneja tanto entornos de producción como sandboxes herméticos con permisos read-only.

2. **Superficie Publicada / Live Edge (Gate Externo Protegido)**:
   - El hostname de producción `orbitalframeworks.qzz.io` apunta actualmente a AWS Amplify Hosting.
   - AWS Amplify Hosting responde con el contenido estático `dist/index.html` sin interpretar cabeceras `Accept`.
   - La activación de la negociación de contenidos en producción requiere habilitar el proxy de Cloudflare (nube naranja en DNS) y desplegar el Cloudflare Worker (`cloudflare-worker-content-negotiation.js`).
   - Este paso está clasificado como `LIVE_NOT_ACTIVE / AWAITING_PROTECTED_RELEASE` y requiere autorización explícita y credenciales externas que exceden el envelope actual.

---

## 4. Especificación Técnica de la Ruta Edge (Cloudflare Worker)

### 4.1 Identidad y Configuración
- **Archivo de configuración**: `scripts/edge/wrangler.jsonc`
- **Código ejecutable**: `scripts/edge/cloudflare-worker-content-negotiation.js`
- **Ruta de enrutamiento**: `orbitalframeworks.qzz.io/*`
- **Zona Cloudflare**: `orbitalframeworks.qzz.io` (gestionada en los nameservers `jarred.ns.cloudflare.com`).

### 4.2 Lógica de Enrutamiento
1. Si `request.method !== 'GET' && request.method !== 'HEAD'`, pasa directamente al origen AWS Amplify.
2. Evalúa `prefersMarkdown(request.headers.get('accept'))`:
   - Si la ruta es `/` o `/index.html` y `wantsMarkdown` es verdadero: solicita `/index.md` al origen, devuelve status 200, `Content-Type: text/markdown; charset=utf-8` y `Vary: Accept`.
   - Si la ruta solicita HTML normal o navegador: pasa al origen y devuelve el HTML prerenderizado estándar.
3. Si la respuesta del origen es 404:
   - Si `wantsMarkdown` es verdadero: obtiene `/404.md`, devuelve status 404 real, `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept` y enlaces hacia `llms.txt` y `sitemap.xml`.
   - Si no: preserva la respuesta 404 HTML estándar del origen.
4. Inyección uniforme de `Vary: Accept` en todas las respuestas para evitar contaminación cruzada de caché en CDNs intermedias y navegadores.

### 4.3 Impacto en HTTPS/TLS y Caché
- **Criptografía/TLS**: Cloudflare gestiona la terminación TLS edge (certificados universales gratuitos de Cloudflare) y conecta con AWS Amplify vía SSL/TLS Full/Strict sin pérdida de cifrado.
- **Aislamiento de Caché**: La presencia obligatoria de `Vary: Accept` garantiza que los objetos en caché para clientes Markdown no sean servidos a navegadores humanos y viceversa.
- **Costos**: $0 USD / mes bajo el plan Free de Cloudflare Workers (hasta 100,000 peticiones diarias gratuitas).

### 4.4 Plan de Despliegue y Rollback
- **Despliegue (En runner con credenciales)**:
  ```bash
  cd scripts/edge
  npx wrangler deploy --config wrangler.jsonc
  ```
- **Rollback Inmediato (< 5 seg)**: Deshabilitar el disparador de la ruta desde Cloudflare Dashboard.
- **Rollback por CLI (< 10 seg)**:
  ```bash
  npx wrangler routes delete "orbitalframeworks.qzz.io/*"
  ```
- **Rollback por DNS (< 30 seg)**: Desactivar el proxy de Cloudflare en `orbitalframeworks.qzz.io` (cambiar nube naranja a nube gris), enviando el tráfico directamente a AWS Amplify.

---

## 5. Resultados de Verificación Técnica

Se ejecutó la suite completa de aseguramiento técnico local en el workspace autorizado:

1. **Linting (`npm run lint`)**:
   - `eslint .` ejecutado sin errores ni advertencias (código de salida 0).
2. **Comprobación de Tipos (`npm run typecheck`)**:
   - `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit` completado sin errores (código de salida 0).
3. **Suite de Pruebas Unitarias y de Integración (`npm test`)**:
   - 11 pruebas automatizadas ejecutadas y aprobadas en 446ms (11 pass, 0 fail):
     - Test 1: Organization JSON-LD completeness, dateModified 2026-10-15 & truthful contactPoint.
     - Test 2: Agent instructions & absence of unverified remote/office claims in `public/llms.txt`.
     - Test 3: Markdown representation for Home in `public/index.md`.
     - Test 4: Agent-friendly 404 Markdown error body in `public/404.md`.
     - Test 5: `customHttp.yml` configuration for Content-Type and Vary: Accept.
     - Test 6: Cloudflare Worker simulation (Markdown 200, HTML 200, Markdown 404, HTML 404).
     - Test 7: Brand search consistency & dateModified synchronization across assets.
     - Test 8: Cloudflare Worker prefersMarkdown RFC 9110 strict q-value negotiation.
     - Test 9: `verify-build` strictly requires `index.md` and `404.md` in dist without silent fallbacks.
     - Test 10: Local HTTP Server content negotiation for Home (live loopback socket).
     - Test 11: Local HTTP Server 404 negotiation on nonexistent route (live loopback socket).
4. **Build y Verificación del Artefacto (`npm run build`)**:
   - Ejecutó `scripts/build.mjs`:
     - Compilación cliente Vite (264 KB bundle, dentro del límite de 266 KB).
     - Generación de imágenes WebP responsive (8 imágenes WebP y 3 favicons optimizados).
     - Compilación SSR y prerenderizado de 10 rutas HTML.
     - Inserción y confirmación de `dist/index.md` y `dist/404.md`.
     - 51 comprobaciones deterministas en `verify-build.mjs` aprobadas.
5. **Chequeo de Integridad Git (`git diff --check`)**:
   - Ejecutado sin inconsistencias de formato, espacios en blanco o conflictos.

---

## 6. Estado del Work Graph y Cierre de Fase

- **Estado del Nodo `correct-code-and-tests`**: **PASS**
- **Estado de Preparación para Release**: **PASS_WITH_RELEASE_GATE**
- **Condición del Gate Externo**:
  - `F1` se mantiene en estado `LIVE_NOT_ACTIVE / AWAITING_PROTECTED_RELEASE` hasta que un operador con credenciales Cloudflare despliegue `scripts/edge/wrangler.jsonc` y habilite el proxy DNS.
  - Ninguna prueba en local asume ni simula falsamente que el dominio público ya está negociando contenidos; la trazabilidad preserva con exactitud la frontera entre código preparado y despliegue en infraestructura viva.

---

## 7. Auditoría posterior: corrección de build limpio (15-oct-2026)

La revisión del Sponsor tras el run 9a62a4d0-fe04-47b0-ace7-be552d5c8be2 encontró un defecto que no cubría el QA original. **El PASS original del run no certificaba una compilación desde un checkout limpio.**

- **Fallo reproducido:** `amplify.yml` ejecutaba `npm test` en `preBuild`, pero la prueba de verificación de `index.md` y `404.md` necesita `dist/`; en un checkout limpio `dist/` no existe y la prueba fallaba con `ENOENT`.
- **Falso positivo del build reproducido:** `scripts/build.mjs` confundía un `dist/` inexistente con un directorio de solo lectura, construía en un directorio temporal y lo eliminaba, devolviendo salida exitosa **sin** `dist/index.html` ni `dist/index.md` para publicar.
- **Corrección:** `scripts/build.mjs` siempre compila hacia el `dist/` real con exit code no cero ante errores, verifica artefactos no vacíos después del build y nunca borra una salida temporal silenciosamente. Tanto `amplify.yml` como `.github/workflows/deploy-pages.yml` ejecutan ahora `npm test` **después** de `npm run build`.
- **Regresión protegida:** `tests/agent-readiness.test.mjs` incorpora una prueba dedicada al orden del pipeline y existencia real de artefactos; la suite queda en 12/12.
- **Verificación independiente de un checkout limpio:** se reprodujo el pipeline en una copia temporal sin `dist/` ni `dist-ssr/`, enlazando las dependencias locales ya instaladas. `npm run lint && npm run build && npm test` terminó en PASS: 12/12 tests, `Build verification passed`, `DEPLOYMENT_ARTIFACT_PASS`. Se confirmaron en la carpeta `dist/` temporal las páginas HTML de home, Privacy, Terms, OAuth, los cuatro casos, `index.md`, `404.md`, `llms.txt` y `sitemap.xml`. `git diff --check`: PASS. No se realizó `npm ci` desde cero ni un deploy real en AWS.

**Estado después de esta corrección:** artefacto listo para revisión de commit/push **localmente**; `F1` continúa como gate externo de publicación y activación en edge. Ni estas pruebas ni el run original demuestran que el dominio público alcance 100/100 en Is Agentic. No se hizo commit, push, modificación de DNS/Cloudflare ni despliegue en producción.

---

## 8. Nueva auditoría después de publicación (15-oct-2026)

El usuario informa una **nueva puntuación Is Agentic de 79/100**. La publicación de la versión `9237bcc` en AWS Amplify sí se completó, pero el dominio sigue sin capa Worker activa. Inspección HTTP de solo lectura:

- `GET /` con `Accept: text/html`: 200 `text/html`, correcto.
- `GET /` con `Accept: text/markdown`: 200 `text/html`, sin `Vary: Accept`; contrato esencial incumplido.
- `GET /__ora-404-probe-66fep3j3` con `Accept: text/markdown`: HTTP 404 correcto, pero cuerpo HTML; contrato esencial incumplido.
- `GET /index.md`, `/404.md`, `/llms.txt`: activos, HTTP 200. Esto prueba que los assets existen, **no** que la negociación funciona.
- DNS autoritativo: zona `orbitalframeworks.qzz.io` delegada a nameservers Cloudflare; tráfico público responde con `Server: AmazonS3` y `X-Cache: ...cloudfront`, no con proxy Worker.

Cambios preparados en el repositorio para esta fase (no publicados todavía):

- Schema.org `Organization.address` de grano **país únicamente**: `{ "@type": "PostalAddress", "addressCountry": "PE" }`. La identidad pública de Orbital Frameworks acredita Perú. Este dato **no es una dirección postal completa** y no autoriza inventar localidad, calle o código postal.
- Worker con paso transparente para métodos no GET/HEAD y preservación de `Vary: Accept-Encoding` en las respuestas Markdown, además de `Accept`.
- `npm run verify:agents` como test HTTP de producción con resultados verificables de portada HTML/Markdown, 404 HTML/Markdown, assets y JSON-LD. No se usará un test local para dar por aprobado el sitio en vivo.
- Runbook Cloudflare corregido: no prometer rollback DNS en segundos; verificar permisos, zona, proxy DNS, TLS Full (strict), validación ACM y límites de plan antes de activar la ruta. La activación es una acción externa protegida.
- La home presenta nombre de marca + actividad en su texto visible superior (`heroKicker`), conservando el H1, estructura, estilos y diseño. Esto mejora la coherencia SEO, pero **no garantiza** ranking top 10; hace falta indexación y autoridad externa.

**Pendientes estructurales independientes:** búsqueda de marca en top 10 (indexación y enlaces externos, no controlable ni garantizable mediante metadata) y publicación de los cambios de schema/edge. Un Worker solo corrige los dos requisitos de respuesta HTTP; no puede garantizar el salto de 79 a 100.
