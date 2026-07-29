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
- `npm run build`: genera el build de producción, optimiza imágenes, genera variantes de favicon y prerenderiza el HTML.
- `npm run preview`: sirve localmente el build generado.

## Build de producción

El proceso de build ejecuta:

1. validación de TypeScript;
2. build cliente de Vite;
3. generación de imágenes WebP responsive mediante ImageMagick;
4. generación de favicons optimizados;
5. build SSR temporal;
6. prerender del contenido React dentro de `dist/index.html`.

ImageMagick debe estar disponible como `magick` o `convert`. El workflow de GitHub Actions lo instala explícitamente en Ubuntu.

## Despliegue

El sitio se publica mediante GitHub Pages desde:

- `https://github.com/orbital-frameworks/orbitalframeworks-landingpage`

El workflow `.github/workflows/deploy-pages.yml` se ejecuta al hacer push a `main` o manualmente mediante `workflow_dispatch`.

Antes de desplegar ejecuta:

```bash
npm run lint
npm run build
```

El dominio público configurado actualmente es:

- `https://orbitalframeworks.qzz.io/`

La publicación del artefacto no garantiza por sí sola que las capas CDN externas hayan invalidado una versión anterior. Después de cada despliegue debe verificarse el contenido, `last-modified`, `age`, sitemap y assets directamente en el dominio público.

## Estructura relevante

- `src/App.tsx`: contenido y estructura principal.
- `src/App.css`: estilos de la landing.
- `src/main.tsx`: hidratación del HTML prerenderizado.
- `src/entry-server.tsx`: entrada SSR usada durante el build.
- `scripts/optimize-images.mjs`: generación de imágenes responsive y favicons.
- `scripts/prerender.mjs`: inserción del HTML prerenderizado.
- `public/`: robots, sitemap, Open Graph y archivos públicos.
- `.github/workflows/deploy-pages.yml`: validación, build y despliegue a GitHub Pages.
