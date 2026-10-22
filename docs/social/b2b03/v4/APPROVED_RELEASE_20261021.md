# B2B-03 — Aprobación y contrato de lanzamiento

**Aprobado por el propietario:** 21/10/2026, en la conversación de Orbital Frameworks. Aprobó expresamente **la V4** para publicarla al día siguiente con su artículo, y pidió documentar la metodología y conservar fuentes y evidencias.

**Pieza aprobada (no regenerar ni sustituir antes de publicar):**
- Carpeta: `docs/social/b2b03/v4/`.
- PDF para LinkedIn: `orbital-b2b03-carousel-v4.pdf`, 5 páginas verticales (1080 × 1350).
- SHA-256 del PDF aprobado: `721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f`.
- SHA-256 de la página 3: `aed8e7d22c9161561050f883208aaa5caf9cc0a61eed659dce86325247b13806`.
- Previews por Telegram del propietario con recibos registrados en `v4/telegram-delivery.json`.
- Fuente reproducible `v4/source.html`, `scripts/render-b2b03-carousel-v4.mjs` y manifiesto `v4/render-manifest.json`.
- Método transversal: `docs/social/CAROUSEL_PRODUCTION_METHOD.md`.

**Objeto autorizado:** un artículo público B2B-03 y un solo post LinkedIn empresarial de Orbital Frameworks, con PDF V4 adjunto y enlace al artículo mediante UTM. No autoriza campañas recurrentes, posts adicionales ni alterar posts existentes.

**Lanzamiento aprobado en America/Lima:**
- **Jueves 22/10/2026 a las 07:00:** activar artículo `landing-page-b2b-tecnica-vs-web-corporativa`, validar lint/build/SSR/prerender/sitemap/RSS, CI, SHA remoto y dominio real.
- **Jueves 22/10/2026 a las 09:00:** revalidar que la URL funciona, verificar PDF SHA exacto realmente adjunto como documento en el compositor de la página **134014070**, copy aprobado y ausencia de duplicados; publicar una sola vez, obtener permalink/URN y enviar ambos enlaces por Telegram.
- Si el blog no está realmente público, no se envía LinkedIn. Si el PDF no carga o no aparece en el compositor, **no publicar texto solo**. Si el resultado del clic es ambiguo, no reintentar.
- Si la publicación del artículo se retrasa y no hay ventana suficiente para validar, desplazar LinkedIn o informar bloqueo; jamás enviar enlace 404.
- Conservar journal, no borrar ni sobrescribir evidencias de otros posts.

**Copy:** utilizar el texto editorial del brief `docs/social/b2b03/publishing-brief.md` con UTM `utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_b2b_landing_vs_corp`. Evitar cambios creativos sustanciales después de la aprobación.

**Huella del copy preparado:** el bloque `text` del brief sustituyendo `{{UTM_URL}}` por la URL de campaña completa tiene SHA-256 `04e52f18ca35e47d80d631da023bba731c536f7de4a812d480be45344a4e5892`. No cambiarlo silenciosamente al entregar la publicación.

**Compositor PDF (evidencia previa):** `LINKEDIN_DOCUMENT_PREFLIGHT_20261021.md` recoge una carga real del PDF como borrador en LinkedIn empresarial y el título permitido de 50 caracteres. No se pulsó publicar; todavía debe validarse su previsualización final antes del envío.

**Estado al registrar esta instrucción:** V4 y contenido aprobados, pero artículo aún `DRAFT_NO_PUBLICABLE` y el publicador heredado no tiene demostrada la función de adjuntar PDF. La aprobación no prueba que ya se publicaron.
