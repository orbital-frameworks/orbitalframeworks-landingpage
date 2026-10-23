# B2B-05 — autorización de publicación (22/10/2026)

**APROBADO por el propietario para publicar artículo y LinkedIn.**
Autorización explícita: «Perfecto, ahora sí queda completamente autorizada la publicación real cuando corresponda, tanto para el artículo como para LinkedIn».

## Material exacto aprobado

- Artículo: docs/social/b2b05/v1/article.md
  - SHA-256: d727b141071da46d9f7cbf5f727746164bb60db746ef0cd0b1f1a86470be075f
- Carrusel: docs/social/b2b05/v3/orbital-b2b05-carousel-v3.pdf (cinco páginas)
  - SHA-256: 134de8e5f671a2a0195ce778a18dc8bfbfb23368fc0d36cd7262af227074a96a
- Copy anterior de LinkedIn (V1): docs/social/b2b05/v1/linkedin-copy-preview.txt
  - Archivo original V1: conservado como historial, **sustituido** para publicación por la versión de texto autorizada el 23/10/2026.
- Copy definitivo: docs/social/b2b05/v3/linkedin-copy-approved.txt
  - SHA-256 del archivo: 05efb6e30580925aa42e74eb6c0a026142b0ac8f165cd018f65bfc0525c1ada2
  - SHA-256 del texto sin salto final: 32bd263a04fb3cef2f816eb5e39074c775cbc90056e05985b544aa7a72ad5131
- Enlace corto propio y aprobado: https://orbitalframeworks.qzz.io/pedidos/
  - Destino final exacto con UTM: https://orbitalframeworks.qzz.io/blog/integracion-pedidos-whatsapp-almacen-operaciones/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_whatsapp_to_warehouse
  - Archivo fuente de redirección: docs/social/b2b05/v3/redirect-pedidos.html
  - SHA-256 de ese HTML: 42c147d1da5f7b13ede9eef1fe1f3fdeb354e061598d19cbd3918c01f4fa354e
  - La página corta es NOINDEX y se activa con el artículo el martes 27; no se publica antes.

La modificación de copy y el uso del enlace corto corresponden a la aprobación posterior del propietario el **viernes 23 de octubre de 2026**, en la misma conversación. Se conserva intacto el artículo y PDF V3. El enlace corto es un HTML de redirección con noindex, follow, sin acortador externo. El destino UTM debe verificarse en el dominio público antes de permitir el post.

## Calendario aprobado (America/Lima)

- Artículo: martes **27/10/2026, 11:00** (16:00 UTC).
- LinkedIn empresarial: miércoles **28/10/2026, 16:00** (21:00 UTC).

## Alcance y gates

1. No publicar el artículo antes de su fecha: mantener DRAFT_NO_PUBLICABLE en Git.
2. Publicar una vez, comprobar Git remoto + CI/deploy + canonical/SEO/HTTP 200/sitemap/RSS, avisar por Telegram.
3. LinkedIn: adjuntar el documento PDF aprobado a la página empresarial Orbital Frameworks (ID 134014070). Nunca reemplazar el documento con texto solo.
4. Ventana de publicación LinkedIn: 28/10/2026, 16:00–17:00 Lima. Fuera de ella bloquear y alertar.
5. Estado durable antes y después del clic. No repetir envío ante resultado incierto. Notificaciones Telegram.

**No autoriza:** otros posts, cambios de credenciales, permisos o políticas globales, gastos, métricas inventadas o adelantar las publicaciones.
