# Diagnóstico de adquisición y conversión · Orbital Frameworks

**Corte de investigación:** 8 de noviembre de 2026 (Lima). **Zona:** `orbitalframeworks.qzz.io`. **Tipo:** investigación CRO específica, no reapertura de la auditoría general de noviembre. **Superficie:** página pública y fuentes empresariales conectadas. **Producción:** no modificada durante esta revisión.

## Conclusión principal

No se ha demostrado que la landing convierta mal **a compradores cualificados**. Se ha demostrado, en cambio, que gran parte de las solicitudes son de infraestructura/automatización, que Google Search Console casi no registra demanda de búsqueda y que GA4 **no puede** medir la mayor parte de los journeys cuando no hay consentimiento analítico. El sitio sí tiene fricción evitable: CTA principal de contacto dependiente de Gmail, sin formulario integrado, y banner de consentimiento que invade parcialmente el CTA móvil en la primera pantalla.

**Decisión estratégica:** `EXPERIMENTAR PRIMERO`, no rediseñar toda la landing, no comprar anuncios ni calcular una tasa 0/841 con poblaciones incompatibles. Ejecutar primero una mejora reversible de contacto, separar señales cualificadas y posteriormente probar demanda real con el calendario de seis publicaciones LinkedIn aprobado por el propietario.

## Datos primarios y límites

| Fuente y período | Valor real consultado | Interpretación válida / límite |
|---|---:|---|
| Captura Cloudflare del usuario, 09/10–08/11 | 841 unique visitors | Cloudflare cuenta IPs que hacen solicitudes, **incluidas máquinas, crawlers y servicios**; no son 841 prospectos humanos. La métrica del panel puede agrupar IPs de una ventana completa mientras suma solicitudes diariamente. |
| Cloudflare GraphQL por conexión oficial, 09/10–07/11 UTC aprox. | 63.061 HTTP requests | Solicitudes totales, no sesiones ni visitantes. |
| Cloudflare GraphQL `httpRequests1dGroups` (09/10–07/11) | 2.940 `pageViews` | Páginas vistas en el borde; incluyen repetición, pruebas automatizadas y navegaciones propias. No son 2.940 personas. |
| Cloudflare GraphQL `httpRequestsAdaptiveGroups` (mismo período; aproximado por muestreo) | `/mcp`: ~18.500, `/healthz`: ~11.370, `/.well-known/oauth-authorization-server`: ~9.070 | ~38.940 solicitudes de rutas de infraestructura/descubrimiento, aproximadamente **61,7 %** del total de solicitudes. No supone que todo el resto sea humano. |
| Cloudflare requests a `/`, por país de origen IP, aproximado | US ~1.140; CA ~810; PE ~80 | Solicitudes, no usuarios. La distribución puede reflejar máquinas, VPN o exploradores. Sin segmentación humana validada. |
| Cloudflare requests a `/`, browser identificado, aproximado | Unknown ~1.610, ChromeHeadless ~290, cURL ~150 | Evidencia material de actividad de herramientas/automatización; no excluye que algunos Chrome normales también sean bots o QA propios. BotScore avanzado no disponible en el plan Free. |
| GA4 propiedad `559260069`, 09/10–07/11, Windsor.ai conector conectado | 4 `sessions`, 4 `screen_page_views`, 4 eventos `page_view`, 0 `contact_intent` | No es población comparable con Cloudflare: GA4 JS solo carga al otorgar consentimiento. No extrapolar 0/4 al total real. Eventos observados: `first_visit`=4, `page_view`=4, `session_start`=4, `user_engagement`=2. |
| Google Search Console (dos propiedades confirmadas; no sumar duplicadas), 09/10–05/11 | 3 impresiones, 0 clics; única URL `/terms` | Falta evidencia de adquisición orgánica comercial de Google. Puede deberse a indexación/antigüedad/posicionamiento, sin causalidad verificada en esta investigación. |
| Gmail empresarial, 09/10–08/11 | 2 correos entrantes en búsqueda relevante, ninguno comercial | Un correo de verificación y otro relativo a un repositorio. No se verificaron leads por LinkedIn DM, otras bandejas, WhatsApp ni vías fuera del buzón. |

**Fuentes:** Cloudflare GraphQL Analytics API en zona activa del usuario (consultas `httpRequests1dGroups` y `httpRequestsAdaptiveGroups`); explicación de discrepancias en `https://developers.cloudflare.com/analytics/faq/about-analytics/`; Windsor.ai conector GA4 de Orbital, conector Search Console de ambas propiedades de Orbital; Gmail Empresa (`contact.orbitalframeworks@gmail.com`) consultas leídas sin exportar cuerpos; fuente React de la landing. Los datos no se copiarán como IPs, credenciales ni contactos personales.

## Observación en navegador real de primera experiencia

Script reproducible: `first-user-conversion.mjs`. Evidencia: `OBSERVATIONS.json` y capturas locales bajo `evidence/`. Chrome en VPS host con `chromiumSandbox:true`, pantalla escritorio 1440 × 900 y móvil 390 × 844. Se bloquearon beacons de Google/Cloudflare durante las pruebas para evitar falsos eventos de funnel. No se envió formulario, correo, compra ni comunicación a terceros.

**Cinco perspectivas funcionales (no personas reales):** apurado, desconfiado, móvil/restringido, novato, explorador de límites. 13 comprobaciones técnicas reportaron PASS dentro del alcance del harness, pero ello **no** demuestra conversión de usuarios reales ni calidad comercial del mensaje. Se verificó que las rutas y CTA principales navegan, que el contacto existe, que las opciones no son botones rotos y que rechazar cookies mantiene las acciones utilizables. Un caso de navegación marcado PASS comprobó `#contacto` inmediatamente, no el fin de la animación; un retest posterior separado comprobó la navegación real a contacto.

**Fricciones observadas por fuente y DOM real:**

1. En pantalla móvil nueva, el banner de consentimiento comienza alrededor de **y=635,6** en un viewport de 844 px y el botón principal del hero ocupa **y=606–661**, quedando ~**25,6 px** de la parte inferior del botón bajo el banner. El centro del botón seguía accionable en el test: se trata de **oclusión parcial de primer impacto**, no de un fallo de clic completo.
2. El CTA superior «Cuéntanos qué necesitas resolver» navega a `#contacto`; el contacto **no tiene formulario HTML**. El CTA más visible «Consultar por correo» lleva directamente a **Gmail Web Compose**, que no es neutro respecto al proveedor. Existen un enlace `mailto:` y un botón copiar, pero son secundarios y el usuario debe abrir otra aplicación o pegar manualmente.
3. El hero está correctamente renderizado y presenta servicios/valor general pero usa una promesa **muy amplia** («Software para tu empresa») que no prioriza comprador, caso típico ni resultado de primera consulta. La sensación de ambigüedad comercial es una **hipótesis experta**, no una tasa observada de abandono.
4. El código `src/analytics.ts` **no carga GA4 si no se concede el permiso**. `contact_intent` mide abrir compositor/copiar, no un correo realmente enviado. No existe `generate_lead` sin confirmación de recepción, lo cual es correcto para evitar falsear conversiones.
5. El trayecto desde servicio hasta `/#contacto` funcionó en el test de emulación móvil. No se verificaron 5 humanos, ni email efectivamente enviado, ni comportamiento Android nativo, ni contenido que dependa de login.

## Decisión contrastada (Consejo Orbital)

| Perspectiva de análisis | Posición y refutador |
|---|---|
| Demanda (Graham) | No rediseñar la web para 841 IPs; atraer primero compradores concretos mediante distribución B2B y conversaciones cualificadas. Cambiaría ante evidencia de sesiones humanas relevantes que lleguen al contacto y abandonen. |
| Oferta (Hormozi) | Reducir fricción de contacto, concretar problema/entregable inicial y aportar prueba real; no prometer resultados inexistentes. Cambiaría si leads de calidad llegan con facilidad y la fricción principal es precio/encaje. |
| Distribución (Gary Vee) | Aprovechar las seis publicaciones educativas de LinkedIn ya aprobadas y enlazar a artículos públicos. No comprar tráfico indiscriminado ni confundir solicitudes de Cloudflare con demanda. Cambiaría ante sesiones orgánicas comerciales medidas y alta tasa de abandono. |
| Operaciones (Wickman) | Definir un pequeño scorecard por semana y separar `click/intención` de `lead recibido` y `reunión cualificada`. Sin esa cadena no se puede atribuir resultados a cambios de diseño. |

**Veredicto:** **EXPERIMENTAR PRIMERO.** No hay base para afirmar que la tasa real de conversión sea cero entre 841 clientes potenciales. El coste de un rediseño integral no está justificado por los datos. Sí hay pruebas concretas de baja visibilidad orgánica, tráfico automático y fricción en el contacto.

## Mejoras priorizadas (sin promesas inventadas)

### P1. Experimento reversible de contacto (primero)

- Simplificar el banner móvil sin eliminar la posibilidad explícita de aceptar/rechazar analítica ni alterar GA4/privacidad.
- Ofrecer una vía **neutral respecto al proveedor** (abrir aplicación de correo vía `mailto:` con asunto y estructura útil) con Gmail etiquetado claramente como alternativa. Conservar copia de email y LinkedIn. No añadir un endpoint de captura sin diseño legal, antispam y entrega verificada.
- Probar ambas rutas desde viewport móvil y escritorio sin enviar correos, con QA independiente en build generado.

### P1. Definir medición y adquisición cualificada

- Reportar semanalmente, **sin mezclar fuentes**, clics de Google Search Console, sesiones GA4 consentidas, eventos `contact_intent` consentidos, correos comerciales efectivamente recibidos y conversaciones/reuniones con empresa real.
- Clasificar de modo no destructivo actividad de infraestructura, escáneres y pruebas propias en Cloudflare. No bloquear tráfico por país ni IP sin razón de seguridad.
- Una vez disponible tráfico real de las seis publicaciones LinkedIn, evaluar fuentes, páginas de destino, clics de contacto, mensajes recibidos y motivos de abandono. El objetivo de negocio es conversación comercial cualificada, no requests.

### P2. Oferta y canal sin rediseño total

- Probar un texto más específico en el hero o la sección de contacto, por ejemplo: problemas de inventario, Excel duplicado, aprobaciones, ERP y automatización; sin fabricar casos o ahorros. Priorizar una sola llamada a la acción.
- Considerar **formulario dentro de la web** solo en segunda fase si los datos y entrevistas prueban que Gmail/correo impiden contactar. Debe tener recepción comprobable, protección antispam, privacidad, consentimiento de tratamiento, retención mínima y eliminación. No improvisar infraestructura externa ni integrar tokens en frontend.
- Si después de un volumen significativo de visitas humanas **cualificadas** sigue sin haber consultas, realizar prueba con usuarios reales/entrevistas, y evaluar oferta/segmentación, no solo estética.

## Condiciones de cierre y límites

- **Diagnóstico:** completo con datos primarios, sin ejecutar ni reabrir la auditoría técnica general antigua.
- **Cambios de interfaz:** preferir staging aislado de Git, sin push ni despliegue hasta revisión visual y QA; preservar archivos modificados/untracked del workspace y el calendario editorial activo.
- **No publicado = no validado en producción.** Un build local que pasa tests no prueba conversión.
- **Sin atribución causal prematura:** comparar solo cohortes/datos compatibles, excluir pruebas propias si hay identificadores verificables y señalar tamaño reducido de las muestras.

## Implementación reversible y QA (staging aislado, SIN desplegar)

- **Worktree real:** `/srv/orbital/workspaces/orbital-landing-cro-20261108`, detached HEAD `9eb5106`, creado desde commit limpio **sin tocar cambios ajenos** del checkout principal. Código fuente del worktree aún sin commit, sin push, sin deploy.
- `src/App.tsx`: CTA principal del contacto deja de depender exclusivamente de Gmail. Abre `mailto:` con asunto y preguntas prellenadas; la opción «Usar Gmail» se conserva como secundaria, además de «Copiar correo». No se instaló formulario/servicio tercero ni se envió ningún correo real.
- `src/AnalyticsConsent.tsx` y `src/index.css`: aviso más conciso y compacto con controles aceptar/rechazar y enlace a privacidad todavía visibles; se respeta el consentimiento previo a la carga GA4.
- `src/App.css`: ajuste solamente para pantallas muy estrechas (≤360px) para que la CTA del hero quede libre del aviso inferior, sin modificar desktop ni identidad de marca.
- **Validación de código:** `npm run typecheck` PASS; `npm run lint` PASS; `npm run build` PASS, incluida verificación de `dist`; `npm test` **94/94 PASS** después del build, `git diff --check` PASS. La primera ejecución de tests realizada *antes* del build falló por falta de `dist` en el worktree nuevo (fallo de orden del harness, no de aplicación); se corrigió ejecutando build antes de test.
- **QA funcional visual:** `node tests/cro-contact-smoke.mjs` PASS en Chrome sandbox de host para viewports 390×844, 320×800 y 1440×900. En ambas resoluciones móviles, el límite vertical inferior del CTA está encima del borde superior del aviso (intersección 0 px); se verificó también el enlace Gmail secundario, el mailto, rechazo de consentimiento y conservación de la dirección de contacto. Screenshots y resultados reales: `cro-smoke-evidence/` dentro del worktree aislado. Sin envíos, posts ni mutaciones de producción.
- **Cobertura límite:** las pruebas validan el enlace/comportamiento local sin abrir un cliente de correo ni confirmar envío/recepción. El test de regresión se ejecutó con una emulación del navegador, no con participantes humanos. Tampoco atribuye mejoras de conversión: se requiere experimentar con sesiones genuinamente cualificadas y leads reales.
- **Siguiente fase pendiente:** integración Git mediante responsable de release, revisión independiente sobre build exacto y despliegue deliberado con medición posterior. El propietario no pidió publicación inmediata de estos cambios de interfaz; no se mezclaron con el run editorial autónomo de publicación.
