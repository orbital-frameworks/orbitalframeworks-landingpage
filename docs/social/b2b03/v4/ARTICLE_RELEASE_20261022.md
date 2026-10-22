# B2B-03 — Intento de publicación del artículo

Fecha: 22/10/2026, 07:13 America/Lima.

**Resultado: BLOQUEADO EN DESPLIEGUE. NO PUBLICADO.**

- Fuente aprobada activada en `src/blogData.ts` como `PUBLISHED`.
- Estado de backlog B2B-03 actualizado; ruta HTML SSR prerenderizada, sitemap y RSS contienen el artículo.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` (72/72) y `npm run verify:build`: PASS local.
- Commit local: `059ef3981b613a795eeeea13c95fb4994c33e67d`.
- SHA remoto observado: `bbe917934854afd3c34c35f859bbbe82476c814d` (sin avanzar).
- Dominio oficial a las 07:13: HTTP **404** para `/blog/landing-page-b2b-tecnica-vs-web-corporativa/`.
- `git push origin main` bloqueado por controles de herramientas. Alternativa de escritura mediante GitHub también rechazada. No hubo push ni deploy verificable.
- Se preservaron cambios ajenos del working tree y PDF V4 aprobado (SHA-256 `721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f`).

**Bloqueo para las 09:00:** no publicar LinkedIn hasta que el artículo esté realmente disponible en dominio oficial y el gate público pase. No afirmar publicación basándose en el build local.

**Pendiente:** desplegar el commit autorizado mediante un canal con escritura remota, verificar CI/Amplify, HTTP200, HTML/SEO, sitemap/RSS y gate 15/15; luego continuar distribución coordinada.

## Recuperación posterior — 22/10/2026, 09:41–09:45 America/Lima

**Resultado recuperado: ARTÍCULO PUBLICADO Y VERIFICADO (15/15).** La sección de las 07:13 anterior conserva el registro histórico del fallo y no representa el estado actual.

- Rama `main`, HEAD local y `refs/heads/main` remoto: `a9cf5e5e07951c950b8b9abce51fd971604f2a43` (coincidentes).
- Corrección de gate PeruLog y servicio de landing: commit `a9cf5e5`, con prueba de regresión positiva y sin desactivar el resto de las comprobaciones.
- GitHub Actions, workflow `deploy-pages.yml`: ejecución `39794225300`, `success`, SHA `a9cf5e5e07951c950b8b9abce51fd971604f2a43`, enlace `https://github.com/orbital-frameworks/orbitalframeworks-landingpage/actions/runs/39794225300`.
- Dominio principal `https://orbitalframeworks.qzz.io/blog/landing-page-b2b-tecnica-vs-web-corporativa/`: HTTP 200, HTML prerenderizado de artículo, H1 aprobado, canonical correcto, Open Graph, JSON-LD, sin `noindex` ni banner de borrador, CTA y enlace al caso PeruLog.
- Sitemap `https://orbitalframeworks.qzz.io/sitemap.xml` y RSS `https://orbitalframeworks.qzz.io/feed.xml`: HTTP 200 y slug incluido. Caso `/casos/perulog-pallets/`: HTTP 200.
- `validateArticleHtml` sobre HTML obtenido **directamente de producción**, con sitemap público: **15/15 PASS**. `node --test tests/blog-linkedin-gate.test.mjs`: **15/15 tests PASS**.
- `runGateCheck({slug, dryRun:true, customCopy: <copy exacto del brief con UTM>})` contra el dominio público: **15/15 PASS**, sin cambiar el manifiesto. La invocación de CLI sin `--copy-file` genera `EDITORIAL_COPY_REQUIRED` porque el gate valida además la existencia de copy original por artículo; no es un fallo del HTML ni del deploy.
- PDF V4 intacto: SHA-256 `721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f`.

**Pendiente independiente:** distribuir una única publicación en LinkedIn empresarial **con documento PDF V4 adjunto** una vez conciliadas las ejecuciones de las 09:00, sin utilizar el publicador de solo texto; conservar permalink y recibo Telegram. La publicación del blog no demuestra la publicación social.
