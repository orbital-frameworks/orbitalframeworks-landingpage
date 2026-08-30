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
- `npm run build`: genera el build de producción, optimiza imágenes, prerenderiza el HTML y valida el artefacto final.
- `npm run verify:build`: valida prerender, canonical, robots, sitemap, schema, assets y límite de JavaScript.
- `npm run verify:production`: comprueba contenido, enlaces, caché y headers del dominio público.
- `npm run preview`: sirve localmente el build generado.

## Build de producción

El proceso de build ejecuta:

1. validación de TypeScript;
2. build cliente de Vite;
3. generación de imágenes WebP responsive mediante ImageMagick;
4. generación de favicons optimizados;
5. build SSR temporal;
6. prerender de la home, la página institucional y los casos públicos dentro de `dist/`;
7. verificación automática del artefacto final.

ImageMagick debe estar disponible como `magick` o `convert`. El workflow de GitHub Actions lo instala explícitamente en Ubuntu.

## Despliegue

El repositorio está conectado a GitHub Pages y AWS Amplify:

- GitHub: `https://github.com/orbital-frameworks/orbitalframeworks-landingpage`
- Amplify: publica el dominio principal desde `main` usando `amplify.yml`.

El workflow `.github/workflows/deploy-pages.yml` se ejecuta al hacer push a `main` o manualmente mediante `workflow_dispatch`. Amplify compila el mismo commit y publica `dist`.

Antes de desplegar ejecuta:

```bash
npm run lint
npm run build
```

El dominio público configurado actualmente es:

- `https://orbitalframeworks.qzz.io/`

La publicación del artefacto no garantiza por sí sola que las capas CDN externas hayan invalidado una versión anterior. Después de cada despliegue debe verificarse el contenido, `last-modified`, `age`, sitemap y assets directamente en el dominio público.

## Rutas públicas

- `/`: landing principal, incluida una descripción pública de Orbital Leads.
- `/privacy`: política de privacidad de Orbital Frameworks y Orbital Leads para integración Google/Gmail.
- `/terms`: términos de uso de Orbital Leads.
- `/sobre-orbital-frameworks/`: identidad institucional, equipo, capacidades, método y proyectos públicos.
- `/casos/checkio/`: caso público de Checkio.
- `/casos/veterp/`: caso público de VetERP.
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
- `customHttp.yml`: caché y headers de seguridad de Amplify.
- `public/`: robots, sitemap, Open Graph y archivos públicos.
- `.github/workflows/deploy-pages.yml`: validación, build y despliegue a GitHub Pages.
