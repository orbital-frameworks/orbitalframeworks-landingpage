# B2B-05 V2 — Orbi integrado · revisión pendiente

**Estado:** REVIEW_NOT_PUBLISHED. No publicar ni programar sin aprobación exacta.

## Alcance visual

- **Slide 01:** Orbi confundido, asset oficial 11_confused.png, en la separación entre ventas y almacén. Solo los paneles inferiores se desplazaron 25 px para evitar superposiciones.
- **Slide 03:** Orbi presentando, asset 17_presenting.png, a la derecha del cierre del flujo. Se conserva la geometría de los cinco pasos.
- **Slide 05:** Orbi señalando, asset 10_pointing.png, sustituye el icono decorativo del CTA.
- **Slides 02 y 04:** exactamente idénticas a V1 a nivel de bytes PNG (SHA-256).

El artículo, copy, título, logotipo auténtico, identidad de marca y el contenido de todas las láminas permanecen intactos.

## QA y reproducibilidad

- Fuente editable V2 completa: source.html, generada por scripts/render-b2b05-v2.mjs desde el HTML original V1 mediante intervenciones localizadas.
- Tres ilustraciones oficiales Orbi copiadas desde Content Factory con hash SHA-256 idéntico al recurso propietario. PNG transparentes sin círculos ni recreaciones.
- Cinco PNG 1080 × 1350 y un PDF de cinco páginas. Previews móvil y escritorio simulados (no son capturas reales de LinkedIn).
- Renderer verifica texto de las cinco slides idéntico a V1, presencia y tamaño del Orbi correcto, ausencia de recortes de contenido y conexión geométrica del flujo con tolerancia horizontal <1,5 px.
- render-manifest.json registra los SHA-256 y comparación de cambios de V1 a V2.
- Contact sheet inspeccionado visualmente: Orbi no cubre titulares ni textos operativos; el CTA permanece legible.

## Paquete para Telegram

Cinco PNG ordenados; orbital-b2b05-carousel-v2.pdf; mobile-preview.png y desktop-preview.png; ZIP con fuente HTML/CSS, tres assets Orbi oficiales, renderer, previews, manifiesto y originales indispensables de V1, **sin archivos de tipografía**.

Para regenerar en la VPS: node scripts/render-b2b05-v2.mjs. Se necesitan V1 original, tipografías corporativas originales en public/fonts y las ilustraciones propietarias en Content Factory. Este paquete no reemplaza el repositorio completo.

**Publicación:** ninguna web ni LinkedIn, ni cola privada. El PDF V2 debe ser aprobado explícitamente antes del release.
