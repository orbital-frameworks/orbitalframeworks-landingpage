# Orbital Frameworks Landing Page

Landing pública de Orbital Frameworks, empresa peruana de desarrollo de software y soluciones digitales. Está construida con React, TypeScript y Vite.

## Objetivo

La página explica:

- qué problemas resuelve Orbital;
- qué tipos de soluciones desarrolla;
- qué proyectos públicos pueden verificarse;
- cómo funciona una primera conversación;
- cuáles son los canales oficiales de contacto.

No presenta métricas, clientes, testimonios o resultados que no puedan demostrarse.

## Scripts

- `npm install`: instala dependencias.
- `npm run dev`: inicia el entorno local.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: ejecuta comprobación de tipos TypeScript sin emitir archivos temporales.
- `npm test`: ejecuta la suite de preparación para agentes y negociación de contenidos **después** de `npm run build`, ya que también valida el contenido de `dist/`.
- `npm run build`: genera `dist/` desde cero, optimiza imágenes, prerenderiza y valida que permanezca un artefacto de despliegue real (falla si está ausente). No usa salidas temporales que desaparezcan al terminar.
- `npm run verify:build`: valida prerender, canonical, robots, sitemap, schema, assets y límite de JavaScript.
- `npm run verify:production`: comprueba contenido, enlaces, caché y headers del dominio público.
- `npm run verify:agents`: comprueba directamente en el dominio publicado la negociación `Accept: text/markdown`, 404 Markdown, `Vary: Accept`, archivos para agentes y JSON-LD. Este comando falla antes de activar la ruta Cloudflare Worker; no lo confundir con `npm test`.

Las tipografías corporativas (Big Shoulders Display, IBM Plex Sans y IBM Plex Mono) se sirven como WOFF2 latinos desde `public/fonts/`, con sus licencias SIL OFL. No se solicita CSS a Google Fonts; evitamos su carga tardía y la dependencia de un tercer dominio. La auditoría sintética antes/después y los límites de los resultados figuran en `docs/seo-independent-optimization-20261015.md`.

## Google Analytics 4

El flujo web de GA4 de Orbital Frameworks usa el ID público `G-487MJFCW45` en `src/analytics.ts` (sobrescribible mediante `VITE_GA_MEASUREMENT_ID` para entornos especiales). No se debe insertar una segunda etiqueta estática en `index.html` ni crear un contenedor GTM redundante.

El navegador **no solicita** `gtag.js` antes del consentimiento afirmativo. Al aceptar, se carga una sola etiqueta, se configura `send_page_view: false` y se registra una vista controlada. Si se rechaza, la etiqueta sigue sin cargarse. Las acciones de contacto se miden como `contact_intent`, **no** como `generate_lead` sin confirmación de un mensaje enviado. Los eventos excluyen direcciones de correo e información introducida por el visitante. La comprobación automática de instalación de Google puede no detectar la etiqueta hasta que un visitante consienta; verificar con una visita consentida y el informe en tiempo real de GA4.

Importante: `gtag.js` solo procesa los comandos estándar si se encolan como objetos `arguments` (no como arrays). La validación de navegador debe comprobar una petición real a `google-analytics.com/g/collect` después de aceptar; observar únicamente el script `gtag.js` o una entrada en `dataLayer` **no demuestra medición activa**.
- `npm run preview`: sirve localmente el build generado.

## Build de producción

El proceso de build ejecuta:

1. validación de TypeScript;
2. build cliente de Vite;
3. generación de imágenes WebP responsive mediante ImageMagick o FFmpeg;
4. generación de favicons optimizados;
5. build SSR temporal;
6. prerender de la home, la página institucional y los casos públicos dentro de `dist/`;
7. verificación automática del artefacto final.

La optimización usa ImageMagick (`magick` o `convert`) si está disponible y, en su ausencia, FFmpeg (`ffmpeg`). El workflow de GitHub Actions instala ImageMagick explícitamente en Ubuntu; la VPS puede reutilizar FFmpeg sin instalar otra dependencia global.

## Despliegue

El repositorio está conectado a GitHub Pages y AWS Amplify:

- GitHub: `https://github.com/orbital-frameworks/orbitalframeworks-landingpage`
- Amplify: publica el dominio principal desde `main` usando `amplify.yml`.

El workflow `.github/workflows/deploy-pages.yml` se ejecuta al hacer push a `main` o manualmente mediante `workflow_dispatch`. Amplify compila el mismo commit y publica `dist`.

Antes de desplegar ejecuta:

```bash
npm run lint
npm run build
npm test
```

El pipeline de AWS Amplify y GitHub Pages ejecuta las pruebas después del build: en un checkout limpio `dist/` todavía no existe. Que el build termine con éxito garantiza que `dist/index.html`, `dist/index.md` y `dist/404.md` siguen presentes para su publicación.

El dominio público configurado actualmente es:

- `https://orbitalframeworks.qzz.io/`

La publicación del artefacto no garantiza por sí sola que las capas CDN externas hayan invalidado una versión anterior. Después de cada despliegue debe verificarse el contenido, `last-modified`, `age`, sitemap y assets directamente en el dominio público.

## Rutas públicas

- `/`: landing principal, incluida una descripción pública de Orbital Leads.
- `/privacy`: política de privacidad de Orbital Frameworks y Orbital Leads para integración Google/Gmail.
- `/terms`: términos de uso de Orbital Leads.
- `/sobre-orbital-frameworks/`: identidad institucional, equipo, capacidades, método y proyectos públicos.
- `/casos/checkio/`: caso público de Checkio.
- `/casos/wasy/`: caso público de Wasy.
- `/casos/localisa/`: caso público de Localisa.
- `/casos/perulog-pallets/`: caso público de PeruLog Pallets.

## Estructura relevante

- `src/App.tsx`: contenido y estructura principal.
- `src/App.css`: estilos de la landing.
- `src/AboutPage.tsx` y `src/AboutPage.css`: página institucional rastreable de Orbital Frameworks.
- `src/LegalPage.tsx` y `src/LegalPage.css`: Privacy Policy y Terms de Orbital Leads.
- `src/CaseStudyPage.tsx` y `src/CaseStudyPage.css`: páginas de casos públicos.
- `src/main.tsx`: resolución de rutas e hidratación del cliente.
- `src/entry-server.tsx`: entrada SSR usada durante el build para todas las rutas prerenderizadas.
- `scripts/optimize-images.mjs`: generación de imágenes responsive y favicons.
- `scripts/prerender.mjs`: inserción del HTML prerenderizado.
- `scripts/verify-build.mjs`: contrato técnico del artefacto de producción.
- `scripts/verify-production.mjs`: verificación del dominio publicado.
- `scripts/edge/`: arquitectura y especificación de negociación de contenidos en Cloudflare Workers.
- `tests/`: pruebas automatizadas para contratos de agentes, negociación de contenidos y schema.
- `customHttp.yml`: caché, Vary y headers de seguridad de Amplify.
- `public/`: robots, sitemap, Open Graph y archivos públicos.
- `.github/workflows/deploy-pages.yml`: validación, build y despliegue a GitHub Pages.
