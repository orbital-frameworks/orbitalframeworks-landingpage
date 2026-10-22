# B2B-05 · Carrusel V3 — ajuste final de ubicación de Orbi

**Estado: PARA REVISIÓN, NO PUBLICADO.**

## Alcance exacto

- Solo se ajusta la slide 05 respecto de la V2. Orbi, ilustración original 10_pointing.png, se separa del recuadro oscuro del CTA y se ubica en el espacio verde a la derecha de la introducción, apoyado visualmente en el primer renglón del checklist.
- El párrafo introductorio conserva el mismo texto, con anchura reducida para reservar un lugar propio para Orbi.
- Se vuelve a mostrar la flecha original del CTA: el personaje no sustituye el indicador de acción.
- Las slides 01, 02, 03 y 04 tienen SHA-256 de PNG **idénticos** a la versión V2.
- Artículo V1, copy, ilustraciones oficiales, títulos, paleta, diagrama de flujo y demás contenidos: **sin cambios**.

## Pruebas

- Renderer reproducible: scripts/render-b2b05-v3.mjs (genera source.html V3 desde source.html V2; no modifica V2).
- Compara el texto íntegro de cada lámina con V2, verifica cinco lienzos de 1080 × 1350, carga de recursos de marca, ausencia de recortes conocidos y exige que solo slide 05 tenga SHA distinto.
- Verifica que Orbi no sobreponga el párrafo de introducción ni invada el CTA.
- PDF: cinco páginas; revisión visual realizada sobre el PNG completo de la slide 05.
- SVG/PNG de Orbi no recreados. Assets provienen de la versión V2 y su fuente corporativa auténtica.

## Entrega por Telegram

- slide-05.png: ajuste único para comparar.
- orbital-b2b05-carousel-v3.pdf: documento completo que sustituiría la V2 tras aprobación.
- orbital-b2b05-carousel-v3-review.zip: cinco PNG, PDF, HTML/CSS, renderer y los tres PNG canónicos de Orbi utilizados, manifest, informe.

No distribuir archivos de tipografías. El artículo existente no se vuelve a enviar ni se reescribe.

**Publicación:** no se encola ni se publica en web o LinkedIn sin aprobación final del artefacto exacto.
