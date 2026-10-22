# B2B-03 — carrusel V3 | Revisión para aprobación

**Estado:** V3 GENERADA Y QA TÉCNICO, PENDIENTE DE APROBACIÓN DEL PROPIETARIO. Ni blog ni LinkedIn publicados como parte de esta tarea.

## Correcciones respecto del PDF V2 rechazado

- Orbi oficial sin círculo artificial ni fondo adicional; se reutilizaron las poses PNG transparentes canónicas thinking y pointing, sin recreación manual.
- El logo horizontal original se importa sin redibujarlo en láminas oscuras; en páginas claras se usa un rótulo tipográfico de marca, no una copia falsa del logo.
- Portada simplificada: «Tu web se ve bien. ¿Y después?». Una línea de explicación, un recorrido compacto y Orbi separado del mensaje.
- Desaparece el disclaimer técnico visible en lámina 2. La nota de que el mockup es ilustrativo se conserva solo en esta documentación interna.
- El mapa de la lámina 3 tiene tronco vertical continuo, rama horizontal y tres derivaciones centradas. El renderizador verifica posiciones y errores de más de 2 px.
- La lámina 4 conserva el concepto híbrido, con Orbi sin fondo; la 5 mantiene las tres preguntas con tamaños consistentes.
- Jerarquía reducida: display Big Shoulders, cuerpo IBM Plex Sans y mono solo para numeración/metadatos; títulos predominantes, explicaciones cortas, cian para conceptos clave, rojo reservado a contrastes mínimos.
- Menos palabras y espacios negativos intencionales; no se utilizan fondos generados por IA.

## Artefactos listos en la VPS

Ruta: docs/social/b2b03/v3/
- source.html (HTML/CSS editable)
- assets/ (logo oficial, sello de marca, Orbi canónico, tipografías aprobadas)
- slide-01.png ... slide-05.png (1080x1350, orden definitivo para preview)
- orbital-b2b03-carousel-v3.pdf (cinco páginas)
- mobile-preview.png / desktop-preview.png (simulaciones, no capturas de LinkedIn)
- render-manifest.json (hash SHA256, orígenes, transparencia, geometría, tamaños)
- orbital-b2b03-carousel-v3-review.zip (paquete autocontenido con HTML, PNG, PDF y assets)
- telegram-delivery.json (resultado de envío)

Renderizador reproducible: scripts/render-b2b03-carousel-v3.mjs desde la raíz del repo.

## QA

- Cinco páginas PDF 1.4, lienzos 1080 x 1350.
- Sin desbordes detectados de encabezados, diagramas o paneles.
- Orbi thinking y pointing tienen alfa 0 en esquina y más del 78% de píxeles transparentes reales.
- Ningún disco artificial detrás de las poses, fuente de identidad sin reconstrucción falsa.
- Diagrama de la tercera con conector raíz/rama/nodos alineado <=2 px.
- Vista móvil/escritorio simulada e inspección visual individual de láminas.
- Cumplimiento de contrato sin claims inventados ni UI atribuida a productos reales.

## Publicación

No subir V2 ni V3 sin aceptación expresa del propietario sobre V3. El blog B2B-03 permanece como borrador. El publicador actual de LinkedIn no acredita subida de documento: debe verificar adjunto real y permalink una vez aprobado; jamás degradar a solo texto.
