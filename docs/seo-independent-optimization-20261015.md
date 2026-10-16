# Optimización independiente de SEO, rendimiento y accesibilidad

- **Fecha:** 2026-10-16
- **Workspace:** `/srv/orbital/workspaces/orbitalframeworks-landingpage`
- **Commit base:** `d3a343f6324d052a8e6a6fe03d97a002f2e41a26`
- **URL canónica / dominio:** `https://orbitalframeworks.qzz.io/`
- **Estado de release en el run e7c4e994:** `READY_FOR_OWNER_RELEASE` (workers sin capacidad para modificar `.git`). El cierre por Sponsor verificó posteriormente el layout real y corrigió una regresión antes de autorizar la publicación. No confundir el PASS del run con un deploy.

---

## 1. Resumen y cambios reales aplicados

Se aplicó la optimización de rendimiento y accesibilidad de mayor impacto técnico identificada sin alterar el branding, diseño ni contratos existentes:

1. **Optimización del asset decorativo pesado (`src/assets/Astro showing.png`):**
   - **Antes:** La ilustración decorativa del robot en la sección de portafolio se cargaba como un PNG estático no optimizado de **2,900,251 bytes** (~2.77 MiB). Carecía de variantes adaptativas y presentaba un aspect ratio incorrecto (`width={600} height={600}` vs ratio intrínseco 600x806).
   - **Después:** `scripts/optimize-images.mjs` genera automáticamente `portfolio/astro-480.webp` y `portfolio/astro-720.webp` durante el pipeline de build. En `src/App.tsx`, se renderiza mediante un elemento `<picture>` semántico con `<source type="image/webp" srcset="..." sizes="(max-width: 768px) 78vw, 370px" />` e `<img>` con dimensiones intrínsecas corregidas (`width={600} height={806}`).
   - **Ahorro de transferencia:**
     - Móvil (480w): **23,230 bytes** (-99.2% de reducción de payload).
     - Escritorio (720w): **35,550 bytes** (-98.8% de reducción de payload).
     - Total de payload ahorrado **cuando la imagen de esa sección se solicita**: ~2.86 MB. La imagen tiene carga diferida; no todos los visitantes descargan la ilustración.

2. **Integridad de pipeline y verificación (`scripts/verify-build.mjs` y `tests/agent-readiness.test.mjs`):**
   - Se añadió aserción estricta en el script de verificación post-build que exige la presencia de `portfolio/astro-480.webp` y `portfolio/astro-720.webp`.
   - Se actualizó la suite (`tests/agent-readiness.test.mjs`) para garantizar que `App.tsx` utilice las variantes WebP generadas y reserve dimensiones. Esto reduce el riesgo de CLS, pero no equivale a medir CLS de campo.

---

## 2. Archivos modificados y alcance

| Archivo | Tipo de cambio | Propósito |
|---|---|---|
| `scripts/optimize-images.mjs` | Modificado | Inclusión de generación de WebP para asset decorativo astro (480w, 720w). |
| `scripts/verify-build.mjs` | Modificado | Aserción de existencia de artefactos WebP en `dist/portfolio/`. |
| `src/App.tsx` | Modificado | Reemplazo del import PNG por `<picture>` responsive WebP con dimensiones 600x806. |
| `tests/agent-readiness.test.mjs` | Modificado | Prueba de regresión de CWV/accesibilidad y soporte en test fixture. |
| `docs/seo-independent-optimization-20261015.md` | Creado | Informe durable de optimización independiente y métricas. |

Archivos previos conservados sin alteración:
- `docs/cloudflare-edge-gate-2026-10-16.md`
- `docs/google-measurement-and-search-audit-2026-10-16.md`

---

## 3. Pruebas y comandos de verificación reproducibles

Todos los comandos fueron ejecutados en un entorno de build limpio y pasaron satisfactoriamente:

1. **Linting:**
   ```bash
   npm run lint
   # Exit code: 0 (0 errors, 0 warnings en eslint)
   ```

2. **Typechecking:**
   ```bash
   npm run typecheck
   # Exit code: 0 (tsc -p tsconfig.app.json y tsconfig.node.json sin errores)
   ```

3. **Pruebas unitarias y de contrato:**
   ```bash
   npm test
   # Exit code: 0 (17 tests pasados, 0 fallos, 0 omitidos)
   ```

4. **Pipeline completo de compilación y prerenderizado:**
   ```bash
   npm run build
   # Genera bundle cliente, WebP optimizados, bundle SSR, prerender HTML/MD y verificación de build limpia.
   ```

---

## 4. Comparativa de métricas antes y después

| Métrica / Dimensión | Antes (Baseline) | Después (Verificado local) | Delta / Impacto |
|---|---|---|---|
| **Payload asset decorativo** | 2,900,251 B (PNG) | 23,230 B (480w) / 35,550 B (720w) | **-98.8% a -99.2%** (-2.86 MB) |
| **Formato de imagen** | PNG no responsivo | WebP adaptativo con `srcset`/`sizes` | Optimización moderna conforme a CWV |
| **Aspect ratio / riesgo CLS** | 600x600 (desfasado del nativo) | 600x806 (aproximación de proporción intrínseca) y `picture` con `aspect-ratio` | Menor riesgo de salto; CLS real no medido |
| **Contrato Is Agentic** | 100/100 (Vary: Accept, index.md, 404.md) | 100/100 (Preservado íntegramente) | 0 regresiones en negociación de contenido |
| **Estructura JSON-LD** | Organization, WebSite, Service, ItemList | Sin alteraciones, 100% verificable | Sin claims inflados ni entidades ficticias |
| **Prerenderizado** | Rutas canónicas + legales + 404 | Todas las rutas prerenderizadas activas | Indexabilidad estática garantizada |

---

## 5. Estado de publicación y gate `READY_FOR_OWNER_RELEASE`

El runtime sandbox actual mantiene el directorio `/srv/orbital/workspaces/orbitalframeworks-landingpage/.git` como **sistema de archivos de solo lectura** (`Read-only file system`) y carece de credenciales SSH/tokens remotos. Conforme a las instrucciones del contrato del nodo, no se fuerza elevación de privilegios y se declara el paquete validado y listo para lanzamiento.

### Instrucciones para el Owner / Release Pipeline:

Para completar el despliegue automático hacia AWS Amplify, ejecutar desde una consola con permisos de escritura Git sobre el repositorio:

```bash
cd /srv/orbital/workspaces/orbitalframeworks-landingpage

# 1. Staging explícito de archivos en scope
git add scripts/optimize-images.mjs scripts/verify-build.mjs src/App.tsx tests/agent-readiness.test.mjs docs/seo-independent-optimization-20261015.md

# 2. Commit atómico y descriptivo
git commit -m "perf(seo): optimize decorative portfolio asset to responsive WebP and enforce build integrity"

# 3. Push sin force push a main (desencadena auto-deploy de AWS Amplify)
git push origin main
```

---

## 6. Clasificación de métricas y sistemas externos no medibles localmente

Conforme a las directrices de auditoría técnica, se documentan las limitaciones y dependencias de proveedores externos:

1. **`FIELD_DATA_UNAVAILABLE` (Core Web Vitals reales / CrUX 28d):**
   - INP (Interaction to Next Paint) y FID/LCP de campo requieren un volumen agregado de usuarios de Chrome durante 28 días que no está disponible públicamente para dominios nuevos o de bajo tráfico. No se deben extrapolar métricas de laboratorio a datos de campo p75.
2. **`EXTERNAL_ACCOUNT_DATA` (Google Search Console y Google Analytics 4):**
   - Las consultas de búsqueda reales, impresiones, CTR, posición media y flujo de eventos en vivo residen dentro de consolas autenticadas de Google. La landing mantiene la instrumentación de GA4 estrictamente condicionada a consentimiento del usuario sin almacenar datos personales.
3. **`EXTERNAL_INDEXING` (Bing Webmaster Tools / IndexNow):**
   - La velocidad de indexación y el rastreo por parte de bots de Microsoft y OpenAI dependen de los ciclos externos de los motores de búsqueda una vez que detectan las actualizaciones en `sitemap.xml`.

---

## 7. Recomendaciones priorizadas por impacto

1. **Lanzamiento del commit a producción (Impacto Inmediato - Alto):**
   - Ejecutar el release gate documentado arriba para reducir hasta ~2.86 MB de transferencia cuando el visitante alcanza y descarga la ilustración del portafolio.

---

## 8. Auditoría visual independiente y corrección posterior al run (2026-10-16)

La primera validación del Sponsor encontró una **regresión real no detectada por los tests**: con Chrome headless a 1440 × 1000, el `<picture>` nuevo era un flex item con rectángulo `0 × 0`, mientras la imagen hija mantenía `loading="lazy"`. Esto impedía reservar espacio y podía inhibir su carga en el primer render de escritorio. El `PASS` original del Director **no cubría** esta condición.

Se añadió `src/App.css` a los cambios: `.portfolioRobot picture` tiene ahora anchura explícita, `aspect-ratio: 600 / 806` y alineación consistente. Se respetan las anchuras visuales previstas del diseño (hasta 370 px desktop, 260 px tablet y 280 px móvil). La imagen llena el contenedor con altura automática; `tests/agent-readiness.test.mjs` contiene la aserción de regresión sobre ese contrato CSS.

**Revisión real en Chrome 154 headless sobre build limpio local (sin cuentas externas):**

| Viewport | Antes de corregir CSS | Después de corregir CSS | Desbordamiento horizontal |
|---|---|---|---|
| Escritorio 1440 × 1000 | `picture` e `img`: 0 × 0 en primer render | 361 × 485 px, arte renderizado en captura | No |
| Tablet 960 × 900 | La imagen se renderizaba, pero el wrapper no tenía tamaño reservado propio | 260 × 349 px | No |
| Móvil 390 × 844 | La imagen se renderizaba sin bloqueo | 280 × 376 px, centrada y legible en captura | No |

La prueba tomó capturas reales y midió `getBoundingClientRect()` y `scrollWidth` a los tres tamaños. La imagen y el contenido del portafolio no se superponen en las capturas inspeccionadas. **No se ejecutó una medición Lighthouse/PSI reproducible de LCP/CLS/FCP/TBT ni CrUX/INP de campo.** No atribuir mejoras numéricas de Core Web Vitals a esta optimización sin esos datos.

**QA después del ajuste:** lint, TypeScript, build desde carpeta temporal sin `dist/` previo y 17/17 tests PASS; `git diff --check` PASS. Se confirma la generación WebP (23.230 B móvil, 35.550 B escritorio), ausencia del PNG original en bundle y conservación de páginas HTML/Markdown y 404. Los informes previos de Cloudflare y medición no versionados permanecen intactos.

---

## 9. Continuación: diagnóstico y corrección de inestabilidad de fuentes (2026-10-16)

Tras publicar la versión WebP, el Sponsor midió el sitio vivo con Chrome 154 y PerformanceObserver en navegador real: 2 cargas de escritorio 1440 × 900 sin throttling y 2 de móvil 390 × 844 con CPU 4× más lenta, 150 ms RTT y enlace simulado de 1,28 Mbps, con caché deshabilitada. Son datos **sintéticos**, no Lighthouse oficial ni CWV de campo. Se observaron CLS de ~0,284 en escritorio y ~0,0755 en móvil.

El análisis de fuentes de layout shift y las pruebas de aislamiento señalaron la carga asíncrona de la CSS externa de Google Fonts mediante `rel="preload" as="style" onload="...stylesheet"`: cuando se bloquearon estas fuentes, el CLS de escritorio desapareció. Esta carga tardía cambiaba las métricas tipográficas después del primer render.

Se creó un build experimental aislado con la CSS de Google Fonts como `rel="stylesheet"` convencional, preservando las tres familias corporativas y sus variantes sin recursos adicionales ni cambios de composición visual. Una prueba A/B en el mismo servidor HTTP local con las mismas condiciones Chrome/CPU/red obtuvo:

| Medición sintética | CSS asíncrona (base) | CSS de render (variante) |
|---|---:|---:|
| CLS escritorio 1440 × 900 (2 cargas) | 0,28436 / 0,28421 | 0,000000153 / 0,000000172 |
| CLS móvil 390 × 844 (2 cargas) | 0,07550 / 0,07550 | 0,07550 / 0,07550 |
| FCP escritorio (ms, 2 cargas) | 844 / 396 | 516 / 408 |
| FCP móvil (ms, 2 cargas) | 1948 / 1896 | 1988 / 1860 |

El bajo número de muestras no permite afirmar mejora estadística de FCP; sí reproduce de forma determinista la desaparición del fuerte salto tipográfico en escritorio. `tests/agent-readiness.test.mjs` añade aserción de regresión para evitar reinstalar la CSS corporativa con `onload` tardío.

**Gate de publicación:** ejecutar lint, typecheck, build limpio sin `dist/` anterior, tests, diff y QA visual; hacer commit/push solo con acceso autorizado y comprobar en la URL pública que el HTML utiliza la hoja síncrona, que se mantiene la respuesta Markdown por Accept, y medir CLS de producción de nuevo con la misma metodología. No declarar esta mejora LIVE antes de esas pruebas.

### 9.1. Segunda iteración: sustituir la dependencia externa por las fuentes existentes alojadas localmente

Un primer deploy de la hoja de Google Fonts como `rel="stylesheet"` pasó QA pero **no eliminó consistentemente el CLS público**: en dos cargas reales de escritorio se midieron 0 y 0,28421. Por eso el cambio de hoja síncrona no se considera suficiente.

Se compararon cuatro configuraciones de las **mismas familias tipográficas** utilizando archivos WOFF2 latinos oficiales (Google Fonts, redistribución conforme a las licencias SIL OFL incluidas). Sin cambios de tipo, tamaños, colores ni composición:

| Versión local, Chrome 154 | CLS desktop sin throttling | CLS móvil 4× CPU / 1,28 Mbps | FCP móvil (dos cargas) |
|---|---:|---:|---:|
| CSS Google Fonts asíncrona original | ~0,284 | 0,0755 | 1.948 / 1.896 ms |
| CSS Google Fonts síncrona | ≈0 en pruebas locales, intermitente en producción | 0,0755 | 1.988 / 1.860 ms |
| WOFF2 local + tres preloads | ≈0 | 0 | 2.696 / 2.584 ms |
| WOFF2 local + una preload | ≈0 | 0 | 2.300 / 2.188 ms |
| **WOFF2 local sin preloads** | ≈0 | 0,0755 | **1.960 / 1.932 ms** |

Con un perfil adicional de escritorio lento (CPU 4× / 1,28 Mbps / 150 ms RTT), ambos Google Fonts asíncrono y la variante WOFF2 local sin preloads obtuvieron CLS 0,0777 y FCP cercanos a 2,1 segundos. La alternativa local sin preloads evita otra dependencia de red, preserva la velocidad sintética móvil y no crea una nueva penalización observable. No se afirma CLS universal 0; las cifras dependen del contexto de laboratorio.

**Decisión técnica:** alojar las cinco variantes WOFF2 oficiales de Big Shoulders Display, IBM Plex Sans e IBM Plex Mono en `public/fonts/`, incluir las tres licencias SIL OFL, definir `@font-face` en `src/index.css`, eliminar las tres conexiones Google Fonts de `index.html` y NO introducir preloads de fuente. La prueba 19 y `verify-build` validan que los activos existen y se sirven como fonts válidas. No hay cambios de tracking, proveedores de medición, contenido ni datos estructurados.

**Acceptance público pendiente de esta segunda iteración:** validar en el dominio final que la CSS apunta a WOFF2 propios, que los cinco endpoints responden 200, que no hay peticiones a Google Fonts, que las tres vistas responsive mantienen la tipografía y que la medición posterior no muestra CLS grave sistemático. Conservar el contrato HTTP de Is Agentic 100/100; no asumir que las pruebas locales sustituyen a la publicación.
2. **Monitoreo post-despliegue en AWS Amplify (Impacto Medio):**
   - Verificar la invalidación de caché en Cloudflare / AWS Amplify para certificar que `https://orbitalframeworks.qzz.io/portfolio/astro-720.webp` responda HTTP 200 con encabezados de caché inmutables.
3. **Vinculación autenticada de Search Console (Impacto Futuro - Alto):**
   - Una vez que el owner disponga de la cuenta GSC, revisar periódicamente la cobertura del sitemap y las métricas de rastreo del agente `OAI-SearchBot`.
