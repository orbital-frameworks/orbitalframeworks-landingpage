# B2B-06 · Carrusel V1 — revisión de producción

**Estado:** `READY_FOR_INDEPENDENT_QA · NO PUBLICADO`.

## Artefacto exacto

- PDF: `orbital-b2b06-carousel-v1.pdf`
- SHA-256: `095608a79536219c6a3b48e5b3dc313f8ff2091a156f105b07d262676c3bb3ec`
- Tamaño: `557871` bytes; PDF 1.4 con cinco páginas.
- Previews: `slide-01.png` a `slide-05.png`, cada una de `1080 × 1350` px.
- Fuente reproducible: `source.html` y `render.mjs`; procedencia de los recursos y hashes de las salidas en `render-manifest.json`.

## Claim → evidence → verification → result → limitations

**Claim.** El carrusel explica un diagnóstico editorial de demanda, distribución y conversión para visitas que no generan consultas; no presenta resultados, clientes, analítica ni casos inventados.

**Evidence.** Las cinco láminas de `source.html` cubren hook, diagnóstico previo, secuencia dentro de la página, orden de revisión y CTA. El cierre usa el correo oficial documentado; los recursos locales y sus SHA-256 constan en `render-manifest.json`.

**Verification.** `node --check render.mjs` pasó. `node render.mjs` devolvió `RENDER_PASS`: cinco lienzos de 1080 × 1350, `overflow: []`, PDF de cinco páginas, conectores de la lámina 3 unidos a sus tarjetas y Orbi separado del CTA. Inspección visual local de los cinco PNG a tamaño completo: contraste, recortes, jerarquía, composición deliberada y legibilidad del hook correctos. Se corrigió el contraste de la etiqueta `VISITA` de la portada; el PNG y PDF fueron regenerados después de la corrección.

**Result.** Paquete coherente y reproducible, listo para la crítica visual independiente del artefacto exacto y para la revisión del owner.

**Limitations.** Esta revisión de producción no sustituye el gate `qa-e2e` y no emite `QA_GO`. No hay aprobación del owner, publicación ni entrega Telegram.
