# B2B06 — Carrusel V3 (ajuste de Orbi)

**Estado: DRAFT_READY_FOR_OWNER_REVIEW. Sin autorización para publicar.**

## Corrección puntual

- **Láminas 1, 2 y 5:** se conserva Orbi en sus posiciones y con el tamaño de la V2; el PNG de cada lámina coincide exactamente con el original V2.
- **Lámina 3:** se elimina la pose con portapapeles para mantener el flujo registro → contexto → revisión → resolución sin elementos superpuestos.
- **Lámina 4:** se retira la pose de análisis que tapaba el radar y se restaura la posición original del marcador de ubicación.
- **Copy:** el texto visible es idéntico en las cinco láminas V2 y V3. No se modifican el artículo, el texto de LinkedIn, los colores ni los tipos de letra.

## Pruebas realizadas

- Cinco PNG de 1080 × 1350 generados mediante Chrome/Playwright, inspección visual de las cinco láminas y de la vista conjunta en escala móvil.
- PDF V3 de cinco páginas: `orbital-attendance-carousel-v3.pdf`, SHA-256 `ad831b217d5b883d24d54558d48304469128b1c5bb66ed2ff26c70d8c1e883ed`.
- Texto visible idéntico V2/V3: **PASS**.
- Imágenes 1, 2 y 5 idénticas bit por bit a la V2: **PASS**.
- Las imágenes 3 y 4 cambiaron exactamente por la eliminación de las poses. El gráfico polar queda visible.
- Geometría: todos los elementos relevantes están dentro de las páginas y sin intersecciones registradas con bloques de texto. El manifiesto `render-manifest.json` contiene la trazabilidad de todos los assets.

El resultado queda **pendiente de aprobación del propietario**, no equivale a una revisión independiente ni a publicación.
