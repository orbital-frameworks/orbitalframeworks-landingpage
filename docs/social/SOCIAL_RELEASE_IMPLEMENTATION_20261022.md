# Reparación de ejecución autónoma — evidencia del 22/10/2026

## Problema original

La tarea programada de ChatGPT del 22/10 a las 10:10 marcó una ejecución, pero no publicó el documento de LinkedIn ni persistió un resultado terminal. Se recuperó B2B-03 a las 10:16, con permalink real, PDF V4 de cinco páginas, UTM y Telegram recibo 1228. La causa exacta de la tarea de ChatGPT sigue **sin stdout/stderr terminal recuperado**. No confundir carreras de LinkedIn confirmadas con el error específico del scheduler de ChatGPT.

## Trabajo implementado

- Se creó un timer **independiente, owner-only** que dispara un runner una vez por minuto. Su primera y varias ejecuciones posteriores terminaron `NO_APPROVED_RELEASES, publisherClicks:0`.
- Se instaló un snapshot aislado de los ejecutores, gate editorial y dependencia Playwright en `/srv/orbital/runtimes/private/social-release`, modo 0700; el servicio **no** ejecuta JavaScript desde Content-Factory compartido.
- Los jobs precisan manifest editorial `LISTO_PARA_DISTRIBUCION_EXTERNA`, aprobación explícita que referencia hashes de copy+PDF, URL UTM precisa, ventana de menos de 72h y documento real. No existe ninguna campaña en cola después de la instalación; **B2B-03 no se repetirá**.
- La subida de PDF ocurre antes del texto/URL; se espera autor empresarial y multimedia terminada antes de dar un solo clic.
- Se registra en disco el estado previo al envío y un `SUBMISSION_PENDING` exclusivo justo antes del clic. Un estado incierto nunca reintenta el clic: solo lectura y conciliación.
- La verificación pública exige actor, texto, documento visible, navegación de todas las páginas y destino UTM del enlace, incluyendo `lnkd.in` envuelto en `/safety/go/`.
- El gate editorial canónico de 15/15 se carga del snapshot privado además de comprobar HTTP200, canonical, sitemap y RSS.
- Se prevén errores terminales en ledger privado y aviso Telegram mediante un proceso Relay aislado de Chrome; los avisos no confirmados se vuelven a intentar sin volver a publicar.
- Se agregó recuperación de locks de procesos muertos, con ventana conservadora de nueve minutos y prohibición de reclamar un lock cuyo PID esté vivo.

## Evidencia de validación

1. Build TypeScript/React, lint, tests del proyecto y verify-build pasaron antes del cierre de implementación (sin cambios de contenido web).
2. Las seis pruebas iniciales de calendario, aprobaciones, hashes, estado incierto, cola vacía, duplicados y link wrapper pasaron; más tarde se añadió el test de lock de proceso, también PASS.
3. El timer `orbital-social-release.timer` está **enabled / active (waiting)** y el journal muestra varias ejecuciones reales de `orbital-social-release.service` finalizadas con `result=success`, cola vacía y cero clics.
4. `loginctl show-user orbital-private -p Linger` informó `Linger=yes`.
5. Un servicio transitorio de systemd con `NoNewPrivileges=yes` abrió la sesión empresarial owner desde la copia privada de Playwright: `http=200, correctCompany=true, mode=READ_ONLY_NO_SUBMISSION`, final `SUCCESS`.
6. QA real desde la copia privada de Playwright del post B2B-03: `PUBLISHED_VERIFIED`, permalink `urn:li:activity:7519053996737585153`, copy y PDF con hashes aprobados, cinco páginas y destino UTM correcto. Se detectó primero `LINKEDIN_APPROVED_UTM_LINK_MISSING` por envolver LinkedIn los links en `/safety/go/`; se reparó y el segundo QA devolvió PASS.

## Límites y deudas

- **No existe prueba de un segundo envío programado real.** El siguiente post nuevo necesitará aprobar un nuevo PDF/copy/horario y ejecutar su lanzamiento como canary; las pruebas actuales y QA del post ya publicado no autorizan una segunda publicación.
- Reautenticación de LinkedIn, cambios del compositor o sanciones/reglas del proveedor pueden detener el servicio. Esto es una frontera externa real: alertar, nunca evadirla.
- La preparación y el `git push` del artículo siguen bajo una superficie autorizada de Git, separada del worker sandbox. El runner social bloquea enlaces 404 y no repara automáticamente despliegues.
- El manifiesto Git es el registro editorial que requiere integración versionada tras una distribución nueva; el ledger privado conserva la verdad operacional inmediata para evitar duplicados, sin que el publicador haga commits automáticos que mezclen trabajo ajeno.
- Metricool no tiene red social conectada en la cuenta probada y no es fallback operativo. No es necesario para esta vía independiente.
