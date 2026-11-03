# Caso de producción: carrusel LISA B2B07 V1 → V3 (2026-11-03)

## Resultado

Carrrusel LinkedIn de cinco páginas desarrollado como HTML/CSS y renderizado mediante Chrome/Playwright en la VPS. La V3 fue aprobada explícitamente por el propietario el 3/11/2026. El PDF aprobado es el **archivo exacto** cuya huella consta en `APPROVED_RELEASE_20261103.md`.

## Qué falló y qué se cambió

1. **Inventar interfaz y logos con imágenes generadas:** la primera propuesta no representaba el producto. Se descartó; se recuperaron logotipos, captura real de la app en `localisa.pe/map`, Orby oficial y fuentes de marca de repositorios del proyecto.
2. **Un recorte es correcto para CSS, pero no siempre para un lector:** la V1 mostraba una fracción del mapa, sin contexto. V2 presenta toda la captura original 1440 × 1000 dentro de un marco proporcional: 914 × 634.7 px en portada.
3. **DOM sin overflow no garantiza legibilidad:** el texto de las tarjetas quedó ajustado en V2 y se agregó una comprobación de distancia subtítulo→tarjetas, además de inspección visual en tamaño reducido.
4. **Metadatos internos contaminaban la pieza externa:** se retiraron «capturas auténticas», fecha de captura, folios editoriales, indicadores de proceso y nombres personales. Evidencias y fechas viven solo en los archivos de QA y provenance.
5. **Branding incompleto:** un wordmark «LISA» sin isotipo era inconsistente. Se reutilizaron el isotipo y logo originales, incluidos en el marco editorial del móvil; se dejó constancia de que dicho marco no forma parte de la interfaz original.
6. **Orby demasiado pequeño aunque el CSS fuera correcto:** los cuatro PNG 1080 × 1080 tienen márgenes alfa importantes. La V3 amplió su escala según el área visible, comprobó intersecciones con bloques de contenido y mantuvo cada pose canónica intacta.
7. **Óvalo de decoración confundido con parte de Orby:** `.s1::before` se eliminó en la V3. No era funcional ni parte de la identidad oficial.
8. **Evitar regresiones:** V2 se mantuvo, V3 se creó en directorio independiente y el slide 3 de V3 se comparó por SHA-256 con V2; la pieza final se entregó por Telegram con IDs de mensaje confirmados.

## Estándar que se reutiliza

- **Primero el repositorio fuente y el sitio real**; nunca inventar una UI, símbolo de marca o métrica para ilustrar un caso real.
- Diferenciar **elementos de producción** (timestamps, QA, hashes, evidencia y leyendas de captura) de **elementos publicables**.
- Medir la geometría efectiva: tamaño de píxel visible en PNG alfa, distancias entre tarjetas y texto, y encuadre completo de capturas.
- Inspeccionar la hoja de contacto y las láminas importantes a tamaño real; no confundir la aprobación automática de un render con el juicio editorial.
- Conservar versiones, fuente HTML, renderer, activos con procedencia, manifest y recibos, vinculados a un único PDF aprobado con SHA-256.
- La aprobación editorial de los artefactos **no** habilita por sí sola una campaña sin fecha/hora definida, verificación del destino y confirmación de derechos/atribución.

## Fuente de verdad

- Edición final: `v3/source.html` y `v3/render.mjs`.
- Arte exacto: `v3/lisa-orbital-carousel-v3.pdf` y PNG de `v3/`.
- QA: `v3/render-manifest.json` y `v3/QA_AND_DELIVERY.md`.
- Fuente de UI: capturas públicas de LISA del 03/11/2026 guardadas en `v3/assets/`.
- Entrega: `v3/telegram-delivery.json`, mensajes 1692–1697.
- Texto editorial: `v2/LINKEDIN_COPY_DRAFT_20261105.txt` y `v2/ARTICLE_DRAFT_20261105.md`.

Sin métricas públicas de alcance ni conversiones de esta campaña; no declarar aprendizaje de engagement aún.
