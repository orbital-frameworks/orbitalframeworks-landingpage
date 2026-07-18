# Auditoria Tecnica y SEO: Orbital Frameworks

## 1. Resumen Ejecutivo
El proyecto presenta una estructura altamente optimizada para indexacion basica, habiendo superado con exito la integracion de metadatos profundos (Open Graph, Twitter Cards, Schema.org y llms.txt). Su naturaleza de Single Page Application (SPA) requiere que el contenido SEO critico se mantenga estatico en el `index.html` (lo cual ya ocurre) para facilitar el crawling por buscadores y modelos de inteligencia artificial sin depender exclusivamente del renderizado JavaScript en el cliente. La legibilidad del copy comercial ha sido unificada recientemente.

## 2. Stack Detectado y Rutas SEO Relevantes
* **Framework:** React 19 + Vite (Client-side rendering).
* **Ruta de Entrada SEO:** `/index.html` (Contiene todos los metadatos estaticos canonicos).
* **Assets Relevantes:**
  * `/robots.txt` (Para orquestacion de crawlers y bots IA).
  * `/sitemap.xml` (Para indexabilidad base de la URL canonica).
  * `/llms.txt` (Directiva legible para RAGs y asistentes IA).
  * `/orbitalframeworks-open-graph.png` (Imagen OG estatica unificada).

## 3. Inventario de Paginas Publicas
Al ser una aplicacion de una sola pagina sin router complejo detectado (React Router, Next.js), el inventario se reduce a un unico endpoint canonico:
* **`https://orbitalframeworks.qzz.io/`** (Homepage integral con anclas).

## 4. Auditoria de Metadata
* **Title:** presente y razonable; revisar longitud/intencion antes de cambios finales.
* **Meta Description:** presente y alineada al posicionamiento actual; revisar longitud y claridad antes de publicar cambios.
* **Canonical URL:** `https://orbitalframeworks.qzz.io/` -> [X] **Presente y correcta.**
* **Open Graph:** [X] Completos (`og:title`, `og:description`, `og:url`, `og:image` en las resoluciones recomendadas 1200x630).
* **Twitter Cards:** [X] `summary_large_image` y su correspondiente mapeo multimedia.
* **Favicon / Logo:** [X] Enlazados en el `<head>`.

## 5. Auditoria de Contenido
* **H1 Principal:** Contiene `heroTitle`. Semanticamente correcto y unico por documento.
* **H2 / H3:** Estructura detectada correcta. Se detectan `<h2>` para subtitulos primarios ("Servicios construidos como...", "Casos donde la forma...") y `<h3>` para elementos granulares de UI (tarjetas de servicios y trabajos).
* **Claridad de propuesta de valor:** buena y mas concreta que versiones anteriores; revisar si el usuario objetivo entiende rapidamente la oferta.
* **CTA Principal:** Contacto via correo y LinkedIn. Claro y directo sin barreras de autenticacion innecesarias.
* **Duplicacion de Copy:** No se detectan bloques de canibalizacion de palabras clave.

## 6. Auditoria Tecnica
* **Robots.txt:** Presente. Habilita crawling global `User-agent: *` e incluye a `OAI-SearchBot`. Apunta al sitemap.
* **Sitemap.xml:** Presente con frecuencia `weekly` y `priority 1.0`.
* **Structured Data (JSON-LD):** Configurado como `Organization`, `WebSite` y un nodo `Service` con un `OfferCatalog` que expone limpiamente los 6 servicios centrales. No hay errores sintacticos en el Schema. OfferCatalog o servicios en JSON-LD deben coincidir con servicios visibles y verificables en la pagina.
* **Performance Basica:** pendiente de confirmar con npm run build y/o auditoria visual; no se midio Lighthouse en esta fase.
* **Accesibilidad Basica:** Se perciben `aria-label` en componentes de navegacion.

## 7. Riesgos Eticos / Comerciales
Aunque el sitio esta muy maduro, existen tres "Social Proofs" incrustados (hardcodeados) en el codigo que representan el principal riesgo de la marca si no pueden ser respaldados por la realidad comercial:
* [!] **Localisa:** Tarjeta de casos muestra `+15mil usuarios activos` y `+700mil visitas`.
* [!] **Checkio:** Tarjeta de casos muestra `+200 usuarios activos`.
* *Nota:* Estos datos otorgan enorme autoridad al sitio. Si las analiticas internas respaldan los numeros, es un gran acierto. Si no lo hacen, deben ser matizados inmediatamente para proteger la confianza institucional de Orbital Frameworks.

## 8. Priorizacion de Hallazgos
* **Critico:** ninguno detectado en esta auditoria read-only.
* **Alto:** Confirmacion humana sobre la veracidad de las metricas comerciales (Riesgo etico).
* **Medio:** Evaluar dominio corporativo propio para mejorar percepcion de marca, control y consistencia. No garantiza mejoras SEO por si solo.
* **Bajo:** Validar atributos `alt` en imagenes secundarias que Vite importa dinamicamente (`veterp_sis.png`, `checkio.png`).

## 9. Recomendaciones Concretas
1. **Quick Win de Transparencia:** Si las metricas (`+700mil`, etc.) son ciertas, redactar un pequeno caso de estudio en Notion o un PDF publico enlazado, para sustentar la cifra. Si no lo son, cambiar por claims de impacto ("Despliegue Nacional", "Testing en Beta").
2. **Dominio Final:** Planificar redirecciones 301 desde dominio/subdominio actual `.qzz.io` hacia el dominio corporativo raiz el dia de manana para no perder la indexacion de esta etapa.
3. **Imagenes Accesibles:** Asegurar en `App.tsx` que todas las etiquetas `<img src={...} />` cuenten con un atributo `alt=""` claro que describa funcionalmente el pantallazo mostrado, lo cual beneficia directamente a Google Imagenes.

## 10. Lista de Cambios Sugeridos (Por Aplicar)
* `[ ]` **(Pendiente Humano)** Revisar / Aprobar / Rechazar las metricas de `+700mil visitas`, `+15mil usuarios` y `+200 usuarios`.
* `[ ]` **(Tecnico)** Auditar en `App.tsx` que todas las tarjetas de la galeria de proyectos inyecten una prop `alt` legible en sus imagenes (`<img alt={item.title} ... />`).
* `[ ]` **(Comercial)** Considerar la compra de un dominio definitivo.
