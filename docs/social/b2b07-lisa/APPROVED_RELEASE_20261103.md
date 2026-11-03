# B2B07 LISA — Aprobación del propietario y contrato de publicación

**Aprobación explícita recibida:** martes 3 de noviembre de 2026, en la conversación de Orbital Frameworks: «Muchísimo mejor, guarda y documenta esto que hicimos y deja esto listo para la publicación como aprobado también».

**Alcance aprobado:** la composición final del carrusel LISA V3, el enfoque editorial de software + información + automatización y la preparación de la campaña del jueves 5 de noviembre. No se ordenó difundir de inmediato ni se especificó una hora exacta para el jueves. **Aprobado no equivale a publicado o programado.**

## Piezas congeladas para revisión de lanzamiento

| Artefacto | Ruta única | SHA-256 exacto |
| --- | --- | --- |
| Carrusel PDF V3, 5 páginas | `docs/social/b2b07-lisa/v3/lisa-orbital-carousel-v3.pdf` | `2a9c734b212cd7d9b18794cb65ac20703f973c603c54d656ec8c2f8bf3b4befc` |
| Texto de LinkedIn (texto sin espacios exteriores) | `docs/social/b2b07-lisa/v2/LINKEDIN_COPY_DRAFT_20261105.txt` | `407fce7555c01a18b0e796fb06a777af90767eb6050074239dad2ccb89fe6e6b` |
| Texto base de artículo | `docs/social/b2b07-lisa/v2/ARTICLE_DRAFT_20261105.md` | `e39fda4a54ac9e56ce92f56c5c3b1da56d133a282bf7560b8088ec8c65cfc548` |

Los nombres originales `DRAFT` de los archivos editoriales se preservan para no romper enlaces ni reescribirlos después de revisados. Su contenido puede prepararse para el release, pero las URLs y el horario deben verificarse antes del envío. Cualquier cambio sustancial del texto, PDF o destino requiere actualizar estas huellas y dejar constancia.

**Evidencia entregada por Telegram:** imágenes PNG mensajes **1692–1696**; PDF V3 mensaje **1697**, con confirmación `DELIVERED` en `v3/telegram-delivery.json`.

## Atribución y límites públicos

- **LISA / Localisa** es un producto de un equipo multidisciplinario de médicos e ingenieros.
- Orbital Frameworks puede describir sus contribuciones verificables en **desarrollo de la aplicación**, **organización y automatización de datos**, sin atribuirse autoría exclusiva ni inventar métricas de adopción.
- La reunión mencionada con el MINSA el 3 de noviembre de 2026 **no se utiliza como prueba de aval, convenio, colaboración o resultado institucional**.
- El propietario indicó que consultará a los demás integrantes la atribución pública de Orbital al proyecto. Mantener registrado ese punto de coordinación antes de distribuir externamente.
- No modificar activos ni logos de LISA: V3 contiene capturas auténticas de escritorio y móvil, logo original, branding oficial Orbital y Orby oficial.

## Preparación de publicación

- Fecha objetivo: **jueves 5 de noviembre de 2026, America/Lima**.
- Artículo preparado en `src/blogData.ts` bajo `DRAFT_NO_PUBLICABLE`; ruta futura `/blog/lisa-serums-mapa-datos-automatizacion/`. **No existe aún un artículo nuevo publicado en producción.** Su activación exige despliegue, prerender, canonical, sitemap, feed y verificación de URL pública.
- Copy actual: lleva a la **ficha ya pública** `/casos/localisa/` con UTM; también enlaza `https://www.localisa.pe/`. No cambiar en silencio el enlace a un artículo no publicado.
- Página de LinkedIn empresarial: **134014070**. El documento que se debe adjuntar es el PDF V3 **con el SHA exacto anterior**.
- **Hora de publicación el jueves: NO DEFINIDA.** No heredar las 10:00 del incidente B2B06 del martes. Proponer una ventana cuando se disponga de instrucción horaria.
- Estado operativo al aprobar: **`APPROVED_CONTENT / RELEASE_PREPARED / NOT_QUEUED / NOT_PUBLISHED`**. No crear un archivo en la cola privada hasta completar horario, atribución y verificación del destino.

## Antes de activar la cola

1. Verificar la atribución coordinada con el resto del equipo y confirmar la hora local de **artículo** y **LinkedIn**.
2. Pasar el artículo de `DRAFT_NO_PUBLICABLE` a `PUBLISHED` solo dentro de la ventana autorizada, con despliegue validado, hash remoto, CI y dominio real; no publicar antes por un commit de documentación.
3. Mantener al menos 2–4 horas para comprobar el artículo real antes del post social, o utilizar la ficha pública ya existente como destino si así se mantiene el copy.
4. Preparar el manifiesto `docs/blog-linkedin-manifest.json` con gate comprobado y registrar el par **PDF+copy**. El checkout puede tener cambios ajenos: no usar `git add .` ni sobrescribir manifiestos de otras campañas.
5. Confirmar que el compositor LinkedIn muestra el PDF de **cinco páginas** y el texto exacto, en la página empresarial correcta; no degradar a texto solo.
6. Comprobar deduplicación, confirmar publicación única por permalink y journal, notificar por Telegram y reconciliar Git después del resultado.

**Archivo de preparación:** `docs/social/b2b07-lisa/RELEASE_READY_20261105.json`. No es un `queue/<slug>.json` ejecutable y no activa el timer.

## Validación de preparación (03/11/2026)

- `npm run lint`: **PASS**.
- `npm run build`: **PASS**, con TypeScript, Vite, prerender y verificador de build.
- `npm test`: **94/94 PASS**.
- Artículo LISA en `src/blogData.ts` con estado `DRAFT_NO_PUBLICABLE`: excluido de las rutas prerenderizadas y del sitemap/feed de la build validada.
- Aprobación/hashes exactos: **PASS** contra PDF V3, copy V2, artículo base V2, `render-manifest.json` y recibo de Telegram.
- No existe entrada de campaña LISA en la cola privada del timer: **confirmado**.
- Sitio ya existente `/casos/localisa/`: **HTTP 200**.

Estos resultados prueban preparación técnica **local**, no despliegue del artículo ni publicación de LinkedIn.

## Historial

- V1: primeras cinco láminas creadas con HTML/CSS, capturas reales y recursos canónicos. Observaciones: mapa de portada recortado, texto y etiquetas internas.
- V2: portada completa, logos LISA consistentes, captura móvil con marco editorial, tarjetas ajustadas, retiradas fechas, numeración y nombres personales.
- **V3 aprobada**: se eliminó el óvalo CSS tras Orby, se aumentó su escala real y se revisaron intersecciones. La lámina 3 es idéntica a la V2 según SHA-256.

Las fuentes y la evaluación están en `v3/source.html`, `v3/render.mjs`, `v3/render-manifest.json` y `v3/QA_AND_DELIVERY.md`. El método general permanece en `docs/social/CAROUSEL_PRODUCTION_METHOD.md`.
