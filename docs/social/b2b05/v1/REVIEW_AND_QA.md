# B2B-05 V1 — Entrega para revisión

**Estado:** borradores completos; entrega para revisión del propietario. **NO autoriza publicar ni programar.**

## Material

- Artículo largo editable: article.md. PDF de lectura: orbital-b2b05-article-review.pdf (5 páginas A4).
- Copy LinkedIn con UTM resuelta para revisión: linkedin-copy-preview.txt; plantilla editable: linkedin-copy.txt.
- Carrusel orbital-b2b05-carousel-v1.pdf: 5 páginas verticales de 1080×1350 px; cinco PNG slide-01.png a slide-05.png.
- Fuentes editables: source.html, scripts/render-b2b05-v1.mjs, article-print.html.
- Previews simulados (NO capturas reales de LinkedIn): mobile-preview.png y desktop-preview.png.
- Contact sheet y render-manifest.json con hashes SHA-256.

## QA realizado

- Inspección visual de cinco láminas: problema → pedido estructurado → flujo de estados → tres niveles de madurez → diagnóstico/CTA; composiciones diferenciadas de B2B-03.
- Cinco PNG renderizados desde Chrome local, sin desbordes recortados detectados.
- Conexiones de cinco nodos del diagrama 3 con error de centrado horizontal menor que 1 px.
- PDF del carrusel: cinco páginas; artículo de lectura: cinco páginas.
- Símbolo de Orbital auténtico: public/Logo_favicon.png. No recreación por IA.
- Referencia pública Wasy limitada al catálogo, carrito y continuación por WhatsApp; no atribuir integración de almacén/inventario o API. Los ejemplos de pedido y flujos son ilustraciones conceptuales.
- Política oficial Meta: https://whatsappbusiness.com/es-la/policy/ (actualización de septiembre de 2026). Verificar vigencia antes del lanzamiento.
- Las fuentes corporativas se leen de public/fonts y NO se incluyen como archivos de fuente en el ZIP de entrega.

## Frontera de publicación

1. Revisar y aprobar artículo, copy y PDF exactos; registrar hashes aprobados.
2. Integrar el artículo en blog como borrador antes del release y validar CI/producción externa; no publicar automáticamente al preparar material.
3. Solo entonces crear campaña privada programada. No existe job B2B-05 en la cola en esta entrega.
4. Fechas tentativas: artículo martes 27/10/2026 11:00, LinkedIn miércoles 28/10/2026 16:00 (America/Lima). No programadas.
