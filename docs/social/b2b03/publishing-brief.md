# B2B-03 · Publicación coordinada · Jueves 22/10/2026

Estado: **V1 RECHAZADA POR EL PROPIETARIO — NO PUBLICAR. V2 EN REVISIÓN, NO PUBLICADA.**

El carrusel anterior docs/social/b2b03/orbital-b2b03-carousel.pdf no está aprobado. El V2, pendiente de aprobación, está en docs/social/b2b03/v2/: cinco PNG, PDF, código HTML editable y activos de marca auténticos. Ver v2/REVIEW_AND_QA.md. No publicar V1 ni V2 sin el visto bueno sobre los recursos exactos.

Tema: Landing page B2B o web corporativa: cuál necesita realmente tu empresa.

- Artículo: \`src/blogData.ts\`, slug \`landing-page-b2b-tecnica-vs-web-corporativa\`, actualmente DRAFT_NO_PUBLICABLE.
- Blog previsto: 07:00 America/Lima; dominio oficial \`https://orbitalframeworks.qzz.io/blog/landing-page-b2b-tecnica-vs-web-corporativa/\`.
- LinkedIn previsto: 09:00 America/Lima, página empresa \`134014070\`.
- Campaña: \`camp_b2b_landing_vs_corp\`; medio \`organic_social\`, fuente \`linkedin\`.
- Activo visual obligatorio: \`docs/social/b2b03/orbital-b2b03-carousel.pdf\`, **5 páginas PDF verticales**, source HTML editable, cinco PNG \`slide-01\`…\`slide-05\`, cada una de 1080×1350.
- El PDF se adjunta como DOCUMENTO a la publicación empresarial. Una tarjeta OG automática **no cuenta**.
- Prohibido publicar si el archivo no aparece adjunto correctamente, si falla el preview o hay duplicado.

## Copy LinkedIn (borrador final para revisión)

```text
Una web puede verse bien y aun así no explicar claramente qué ofrece tu empresa.

Antes de elegir entre una landing page B2B y una web corporativa, conviene responder una pregunta: ¿qué necesita saber tu comprador para dar el siguiente paso?

• Una landing concentra una oferta y una acción.
• Una web corporativa facilita explorar servicios, equipo y referencias.
• Las dos pueden convivir: una informa y otra profundiza.

Preparamos este carrusel con criterios de decisión y una guía completa en Orbital Insights:
{{UTM_URL}}

#OrbitalFrameworks #DesarrolloWeb #B2B
```

Texto original: sin promesas de conversiones, porcentajes, clientes ficticios ni comparaciones experimentales inexistentes.

## Secuencia de control

**21/10 noche:** preparar copia, 5 imágenes, PDF, revisar visual móvil/escritorio y enviar preview al propietario. No publicar blog ni post.

**22/10 07:00:** efectuar release del artículo solo si QA pasa (lint, TypeScript, build, tests, SEO, diff acotado). Dar de alta ruta, RSS, sitemap, schema y actualizar fechas. Verificar dominio real hasta 15/15 PASS. No asumir que el push equivale a publicación.

**22/10 09:00:** revalidar 15/15, manifest/duplicados, identidad empresarial, copy exacto aprobado y PDF realmente cargado. Publicar como documento solo mediante una vía legítima verificada. Capturar enlace real, URN, formato y UTC de post y comprobar que el PDF esté disponible. Si UI, adjunto o clic tienen estado incierto: NO reintentar. Telegram owner con ambos enlaces o bloqueo concreto.

**Dependencia pendiente:** \`scripts/linkedin-company-publisher.mjs\` sigue teniendo una ruta de texto+enlace; no garantiza subir documentos. No ejecutar ese modo como si fuera un envío visual. La implementación del uploader puede completarse bajo QA separado; en su defecto no publicar degradado a solo texto.
