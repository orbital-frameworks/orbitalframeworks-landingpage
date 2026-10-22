# Incidente B2B-03 — programación y publicación real (22/10/2026)

## Resultado

- **Artículo:** publicado y gate público 15/15 PASS; commit remoto `a9cf5e5`, GitHub Actions `39794225300` SUCCESS.
- **LinkedIn:** post empresarial publicado a las 10:16 America/Lima; URL pública y recibos en `LINKEDIN_RELEASE_20261022.json`.
- **Telegram:** confirmación de artículo `messageId=1226` y cierre artículo+LinkedIn `messageId=1228`.
- **Carrusel:** PDF V4 exacto aprobado, cinco páginas, SHA-256 `721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f`. No fue regenerado.
- **Importante:** que la publicación manual se recuperara **no demuestra** que el flujo programado haya quedado autónomo y fiable.

## Cronología verificable (America/Lima)

1. 07:00–07:13: release de artículo local PASS, push bloqueado por herramienta; dominio HTTP 404. Posteriormente el remoto avanzó y el dominio pasó a 200.
2. ~09:18: `last-modified` del HTML publicado en CloudFront. Se reconfirmó H1, prerender, canonical, OG, JSON-LD, sitemap, RSS y PeruLog; gate público 15/15.
3. ~10:07:30: el archivo `scripts/publish-b2b03-v4-document.mjs` recibió en el checkout una corrección *no commiteada* para esperar hidratación de autor empresarial. La procedencia de esa edición no queda demostrada por el timestamp.
4. 10:08:56: `last_run_time` de la tarea programada `6ad9822f4e888191a71b04996423f8c5` (API de automatizaciones de ChatGPT).
5. 10:10:04: la tarea aparece `is_enabled=false`, compatible con ejecución única consumida. No hay un log terminal de herramientas accesible en este checkout que permita identificar el error exacto de esa corrida. **No atribuirle automáticamente el fallo a la hidratación del autor.**
6. ~10:15: lectura de journal privado: no había archivo B2B-03 ni recibo de publicación, pero sí los de B2B-02. Artículo HTTP 200, `main` remoto actualizado, PDF intacto.
7. 10:16:20: una ejecución *manual y autorizada* de `node scripts/publish-b2b03-v4-document.mjs --publish` devolvió `PUBLISHED_VERIFIED`, URN real `urn:li:activity:7519053996737585153` y comprobación del post.
8. Después de publicar: lectura independiente del permalink en LinkedIn, documento y 5 páginas visibles; link corto `lnkd.in/dNfcPkrS` muestra la URL UTM exacta. Telegram entrega confirmada `messageId=1228`.

## Bloqueos, causas y remedios

| Prioridad | Hallazgo | Tipo de evidencia | Corrección o control necesario |
| --- | --- | --- | --- |
| P0 | La programación en ChatGPT invocó un agente pero no consiguió completar el envío, y la tarea única quedó desactivada | Estado confirmado de automatización; error interno exacto **no recuperado** | Usar un **job durable propietario** para publicaciones críticas, con estados `PREPARED`, `READY`, `SUBMISSION_PENDING`, `PUBLISHED_VERIFIED` o `NEEDS_RECONCILIATION`, checkpoints y monitor de resultado. No depender de que un nuevo chat haga la publicación a tiempo |
| P0 | Si el compositor aún no ha hidratado el autor, una comprobación inmediata puede rechazar la sesión correcta | Carrera identificada por cambio puntual local; no acreditada como causa exacta del run 10:10 | Esperar selector y texto de autor visibles antes de validar, con timeout y error identificable; corrección local existente debe pasar review y test |
| P0 | Si se inserta texto/URL primero, LinkedIn puede sustituir el área del adjunto por previsualización de enlace; el PDF no se carga | Reproducido en navegador durante preparación el 22/10; `setInputFiles` agotó timeout. PDF→título→finalizar carga→copy pasó | Conservar orden probado del compositor y comprobar `Tu documento ha terminado de cargarse` + elemento multimedia antes de permitir un clic |
| P0 | Tras un fallo previo a `SUBMISSION_PENDING`, no queda journal de diagnóstico para la campaña; el scheduler puede quedar consumido sin explicación | Journal B2B-03 ausente a las ~10:15 pese a ejecución programada | Añadir recibos preflight y terminales de fallo, sin confundir preflight con intento de publicación; notificación inmediata en fallo y reconciliación si existe posibilidad de clic |
| P1 | El proveedor puede acortar el enlace UTM a `lnkd.in`, y una búsqueda literal del UTM en el feed daría falso negativo | Post B2B-03 muestra shortlink; página de salida conserva UTM | Conciliar publicación por primer renglón + actor + URN, luego resolver el link corto en lectura y comparar destino UTM; nunca reintentar solo porque falta el URL largo en el feed |
| P1 | El script heredado `linkedin-company-publisher.mjs` no acredita adjuntar el documento | Contrato y código local | Prohibir su uso en posts nuevos con medio obligatorio. Consolidar un publicador de documentos con QA real antes de generalizarlo; no usar B2B-03 como plantilla creativa |
| P1 | Estado de publicación fragmentado: journal privado y recibo B2B-03 reales, pero manifiesto `docs/blog-linkedin-manifest.json` no contenía B2B-03 al cerrar | Archivo real inspeccionado; además contiene cambios B2B-02 sin commitear, que deben preservarse | Reconciliación transaccional/idempotente al manifest tras evidencia del post, con control de concurrencia y revisión del diff ajeno. Nunca marcar `DISTRIBUTED` por un mero clic |
| P1 | La automatización tenía notificaciones de ChatGPT desactivadas; el mensaje Telegram solo se envía si el flujo llega a la etapa de notificación | `notifications_enabled=false` en metadatos de tarea; Telegram de recuperación entregado | Enviar eventos explícitos de éxito/fallo/reconciliación desde el job, con acuse Telegram; no depender del estado visual de ChatGPT Tasks |
| P1 | El release del blog había sido bloqueado por push remoto desde superficie sin capacidad efectiva, aun pasando todos los tests | Recibo de las 07:13; posteriormente Git remoto/CI/dominio confirmados | Separar worker de contenido en sandbox del publicador Git autorizado; convertir SSH/push remoto en preflight de deploy, no en obligación de un worker read-only |
| P2 | Documentos de brief indicaban `DRAFT_NO_PUBLICABLE` y horario de las 09:00 pese al cambio efectivo | Contenido de `publishing-brief.md` | Anotar el estado final con enlaces/release, sin reescribir aprobaciones históricas; generar próximo calendario desde el estado real, no el texto de un brief fechado |
| P2 | Proveedor de programación alternativo Metricool no tiene una red social conectada en esta cuenta y no se ha verificado carga del PDF exacto como documento | Error de consulta de marcas Metricool y contrato del plugin | No asumir fallback. Evaluar con canary documental y cuenta vinculada si se adopta en el futuro; no convertir cinco imágenes a otro PDF por defecto |

## Cambio operativo recomendado

Para **nuevas campañas**: dejar ChatGPT como planificación, revisión y reporte; un publicador determinista operado en la VPS, controlado por el scheduler existente del host y notificado vía Orbital Relay, debe ser dueño de la ventana temporal y del lifecycle del envío. El publicador debe usar los artefactos aprobados por hash, bloqueo de duplicados, `SUBMISSION_PENDING` antes del único clic, lectura del feed/post, confirmación de documento, shortlink UTM y alertas inmediatas. Un error después de un clic **no puede disparar otro clic automáticamente**. No modificar ni instalar timers, permisos, control plane o integraciones de LinkedIn como parte de esta recuperación de contenido sin un bloque separado de revisión.

La revisión del job ChatGPT de las 10:10 no dispone de stdout/stderr terminal recuperable desde este repositorio; por tanto, distinguir el mecanismo de fallo concreto de las carreras y debilidades comprobadas. El resultado manual demuestra capacidad técnica actual del compositor, no fiabilidad del scheduler.

## Remediación posterior (22/10/2026)

Se implementó, instaló y activó el runner privado owner-only `orbital-social-release.timer` con ciclo por minuto, cola de campañas exactas aprobadas, firma por hash de PDF y copy, gate público canónico 15/15, comprobaciones del compositor y documento, journal exclusivo anterior al único clic, conciliación en lectura, avisos Telegram y recuperación conservadora de locks. `NoNewPrivileges=yes` y snapshot privado de Playwright fueron probados contra la empresa real **sin publicar**. La cola instalada está vacía; las primeras ejecuciones del servicio devolvieron `NO_APPROVED_RELEASES, publisherClicks:0`. También se validó en LinkedIn el post B2B-03 de cinco páginas y su enlace UTM desde el snapshot privado. Fuente: `docs/social/SOCIAL_RELEASE_IMPLEMENTATION_20261022.md`.

La falta de salida terminal de la ejecución de ChatGPT original y los permisos de despliegue del worker de blog no se pueden deducir de esta reparación. No hay todavía evidencia de un **nuevo** post autónomo ejecutado a la hora programada. Las campañas posteriores necesitan aprobar y encolar su material exacto; Git del artículo y manifiesto editorial siguen usando canales separados autorizados.
