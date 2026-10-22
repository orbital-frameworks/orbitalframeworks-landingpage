# B2B-03 — Carrusel V4 (corrección quirúrgica de página 3)

**Estado de QA histórico:** PREVIEW ENTREGADO. **Estado actual:** V4 APROBADA explícitamente el 21/10/2026 para publicar el 22/10/2026 con el artículo B2B-03. Aprobación, hash y controles de release en `APPROVED_RELEASE_20261021.md`. No implica que ya esté publicada en LinkedIn.

## Único cambio de diseño
La V3 separaba la barra horizontal y las tres ramas verticales debido a que el contenedor reservaba **101 píxeles** y situaba la barra en el píxel **49**, dejando **52 píxeles** de aire donde debía haber conexión.

En V4 la altura del contenedor se ajustó a **49 píxeles**, de modo que el comienzo de cada rama coincide exactamente con la barra, sin huecos. El tronco conecta el centro del nodo raíz con el punto central de la barra.

## QA
- Distancia calculada entre horizontal y ramas: **0 px**.
- Desviación horizontal máxima de los extremos contra los centros de los nodos: **0,016 px**.
- Comprobación visual de la lámina 3 ya renderizada.
- Páginas **1, 2, 4 y 5 sin cambios de SHA256** respecto de la V3. Solo cambia la 3.
- 5 PNG de 1080×1350; PDF de cinco páginas; sin desbordamientos.
- Logo original y Orbi oficial preservados.

## Archivos
- Fuente HTML/CSS: `source.html`.
- Código de render: `scripts/render-b2b03-carousel-v4.mjs`.
- Imágenes: `slide-01.png` a `slide-05.png`.
- PDF: `orbital-b2b03-carousel-v4.pdf`.
- QA: `render-manifest.json`.
- Previews: `mobile-preview.png` y `desktop-preview.png`.
- Recursos originales: `assets/`.
- Archivo ZIP para revisión: `orbital-b2b03-carousel-v4-review.zip`.

**No publicar** artículo ni post empresarial hasta la aprobación expresa de esta V4; ejecutar ambos de forma coordinada, con PDF realmente adjunto.
