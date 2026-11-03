# B2B07 LISA V2 — QA de versión para revisión

**Estado:** OWNER_REVIEW_NOT_PUBLISHED_NOT_SCHEDULED.
**Base:** V1 preservada; la V2 se produce por cambios deterministas en render.mjs a partir del HTML y los assets reales de V1.

## Cambios implementados

- Slide 1: captura real de mapa en su proporción 1440 × 1000, sin recorte; marco con URL pública y logotipo oficial de LISA.
- Slide 2: fuentes → organización de datos → producto; tarjetas con tipografía y márgenes ajustados. Se corrigió además la colisión entre subtítulo y grupo.
- Slide 3: captura real de escritorio y captura real del móvil; cabecera de marca **editorial** encima de la vista móvil, compuesta exclusivamente por el isotipo y la palabra original de LISA. La captura conservada bajo el marco procede de la web pública y no fue redibujada.
- Slides 1–5: eliminadas las etiquetas internas y la numeración de páginas. Se mantiene únicamente información útil al visitante y las URLs externas.
- Slide 4: retiradas las atribuciones personales y los números de bloque; se conserva la descripción funcional de desarrollo y datos.
- Slide 5: se usa el lockup con el isotipo y wordmark originales de LISA.
- Copy y artículo: el borrador público V2 suprime nombres personales y conserva los aportes colectivos; no incluye afirmaciones institucionales.

## Evidencia técnica

- render-manifest.json registra procedencia y SHA-256 del PDF, los PNG y las imágenes originales.
- 5 láminas PNG de 1080 × 1350 píxeles; 5 páginas PDF.
- QA automatizada: imágenes cargadas, desbordamientos de tarjetas, límites de página y distancias entre secciones.
- La portada conserva la imagen original completa: ancho renderizado 914 px y alto 634.7 px; contenedor interno 914 × 636 px.
- Se inspeccionaron la composición completa y las láminas con cambios de layout.
- lisa-orbital-carousel-v2.pdf es el documento a aprobar; no sustituir ni volver a generar después de su aprobación sin una nueva revisión.

## Pendientes

- Aprobación final del propietario y confirmación del equipo sobre atribución pública.
- No publicar ni programar LinkedIn ni artículo con este estado.
- Medición de alcance/engagement: SIN_DATOS_FIRST_PARTY; no atribuir impacto demostrado.
