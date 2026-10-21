# Sistema Operativo Editorial y Procedimiento Comercial: Blog a LinkedIn

```yaml
document_id: orbital-blog-to-linkedin-operating-system-20261017
project: orbitalframeworks-landingpage
version: 1.0.0
authority: canonical-editorial-and-social-operations
classification: INTERNAL_OPERATING_MANUAL
status: ACTIVE
write_scope: docs/
target_channels:
  - blog: "https://orbitalframeworks.qzz.io/blog/"
  - social: "LinkedIn Orgánico (Empresa y Socios)"
official_contact: "contact.orbitalframeworks@gmail.com"
lead_policy: "Intent-only (Zero client-side generate_lead)"
factuality_policy: "Zero hallucinations / Strict local verifiable evidence"
```

---

## 1. Visión y Arquitectura del Funnel Comercial B2B

El sistema operativo editorial de **Orbital Frameworks** articula un recorrido comercial orgánico de alta confianza técnica. No busca viralidad superficial, clickbait ni métricas de vanidad, sino capturar el interés de directores de operaciones, gerentes de tecnología y fundadores de empresas que evalúan sistematizar o modernizar sus procesos.

### 1.1 Recorrido de Conversión Unidireccional (Embudo B2B)

```
[Problema Operativo Real en Empresa B2B]
                    │
                    ▼
[Tema B2B Priorizado con Intención de Búsqueda]
                    │
                    ▼
[Artículo Técnico Factual en Blog Nativo (Orbital Insights)]
   • Datos estáticos tipados (`src/blogData.ts`)
   • SSR Prerender determinista (`scripts/prerender.mjs`)
                    │
                    ▼
[Gate de Inspección Externa de Producción Viva] ◄── [BLOQUEO AUTOMÁTICO SI FALLA]
   • HTTP 200, Canonical viva, OG tags, Prerender H1, Sin noindex
                    │
                    ▼ (Solo si el Gate pasa al 100%)
[Publicación en LinkedIn con Enlace y Parámetros UTM Limpios]
   • Copia desacoplada en repo (`docs/linkedin-*.md`)
   • Activo visual obligatorio por publicación: imagen, carrusel PDF u otro recurso visual realmente adjunto
   • Preview y QA en feed móvil y escritorio antes de aprobar
   • Ventana recomendada: Día anterior / Mínimo 2-4 horas tras deploy
                    │
                    ▼
[Tráfico Calificado hacia el Artículo Piloto / Específico]
   • GA4: `page_view` consent-aware + UTM preservado sin PII
                    │
                    ▼
[Navegación Interna Contextual hacia Servicios B2B]
   • GA4: `article_intent` (tipo: `article_to_service`)
   • Enlaces a `/servicios/desarrollo-software-medida/`, `/automatizacion-procesos/`, `/landing-pages-b2b/`
   • Respaldo en casos reales (`/casos/checkio/`, `/casos/wasy/`, `/casos/localisa/`, `/casos/perulog-pallets/`)
                    │
                    ▼
[Intención de Contacto Directa]
   • GA4: `contact_intent` (tipo: `article_to_contact` o `service_to_contact`)
   • Canales: `mailto:`, redacción de Gmail o copia de dirección oficial al portapapeles
                    │
                    ▼
[Bandeja Oficial: contact.orbitalframeworks@gmail.com]
   • Recepción humana del correo con requerimiento operativo.
   • ÚNICA evidencia aceptada de lead calificado real.
```

---

## 2. Contratos de Estados: Blog Nativo vs. Distribución en LinkedIn

Para evitar la publicación de enlaces rotos, páginas en borrador o metadatos inconsistentes en redes sociales, rige un contrato de estados estricto y desacoplado entre el código del sitio y las piezas de LinkedIn.

### 2.1 Estados del Blog Nativo (`src/blogData.ts`)

| Estado en Código | Definición y Comportamiento | Impacto en Prerender y Sitemap |
| :--- | :--- | :--- |
| `DRAFT_NO_PUBLICABLE` | El artículo está en fase de estructuración o contiene vacíos de experiencia que requieren respuesta del propietario (`prioritizedOwnerQuestion`). | Se prerenderiza con banner visible de advertencia técnica, metadato `robots: noindex, nofollow`, excluido de `sitemap.xml` y excluido del feed RSS. |
| `PUBLISHED` | El artículo cuenta con hechos validados, matriz de decisión completa, enlaces internos y CTA configurado. | Se prerenderiza como HTML estático completo, canonical definitivo, `robots: index, follow`, incluido en `sitemap.xml` y feed RSS. |

### 2.2 Estados del Paquete de Publicación LinkedIn (`docs/linkedin-*.md`)

| Estado de Distribución | Definición y Guardrail | Acción Permitida |
| :--- | :--- | :--- |
| `BORRADOR_LOCAL_DESACOPLADO` | El texto para LinkedIn está redactado en Markdown local. No contiene credenciales ni automatizaciones activas. | Solo revisión interna y de copy. Prohibido programar o difundir. |
| `BLOQUEADO_POR_GATE` | El artículo referenciado está en `DRAFT_NO_PUBLICABLE`, no ha sido desplegado, devuelve HTTP no 200, presenta fallback SPA en lugar de HTML prerenderizado, o la canonical es errónea. | **Fail-Closed**: Queda estrictamente vetada la entrega o publicación del post. |
| `LISTO_PARA_DISTRIBUCION_EXTERNA` | La URL pública superó el preflight **y** la pieza social tiene un activo visual real adjuntable, preview móvil/escritorio revisado y copy/visual aprobados. | Publicación individual con el activo visual verificado, copy aprobado y URL UTM. |

### 2.3 Norma visual obligatoria para NUEVAS publicaciones (vigente desde 20/10/2026)

**No se publicarán nuevas piezas de Orbital Frameworks en LinkedIn como posts de solo texto.** Cada publicación debe incorporar **al menos un recurso visual pertinente** que sea parte efectiva de la publicación (no basta con el logo de perfil, el banner empresarial ni con presumir que LinkedIn generará una tarjeta Open Graph).

- **Formatos admitidos:** una imagen editorial con idea central, gráfico/infografía, captura de producto verificable, carrusel educativo en documento PDF con varias láminas, o video pertinente. Se elige el formato por valor para el lector, **no se obliga a usar carrusel en todos los casos**.
- **Fidelidad editorial:** la pieza visual aporta información o demuestra un punto concreto, no es decoración genérica sin relación con el tema. Un carrusel debe contar algo útil y legible; los claims, imágenes y marcas de terceros requieren sustento y autorización. Nunca inventar casos, métricas, capturas ni testimonios.
- **Identidad:** respetar marca de Orbital, contraste, tipografía, paleta y márgenes seguros. Conservar el original vectorial/editable cuando exista; exportar el medio adecuado para LinkedIn sin deformaciones y con calidad suficiente. Las portadas de empresa y las creatividades de posts son superficies distintas.
- **Primer impacto móvil:** comprobar el área visible al hacer scroll **antes de «ver más»**. El titular inicial y la composición visual deben comunicar el tema de inmediato. Revisar también feed de escritorio, recortes, legibilidad, relación de aspecto y posibles solapamientos.
- **Handoff mínimo por pieza:** copy final, URL UTM, formato seleccionado, archivo(s) visual(es) y fuente editable cuando exista, justificación del formato, previews móvil/escritorio y aprobación exacta del conjunto `copy + medio`. Si falta alguno de estos elementos, permanece **NO LISTO**, aunque la web haya pasado 15/15 checks.
- **Publicación real:** comprobar que el medio quedó **adjunto realmente** al compositor correcto y que el post público lo muestra. El archivo en un repositorio o una vista previa local **no equivalen** a adjuntarlo en LinkedIn.
- **Política de fallos:** ausencia de activo, vista previa ilegible, media no cargado o dudas sobre qué se enviará → **bloquear antes del clic** y corregir o pedir revisión. No degradar silenciosamente a texto solo por un fallo del cargador.

**Implementación existente:** `scripts/blog-linkedin-gate.mjs` cubre la URL/artículo; el publicador `scripts/linkedin-company-publisher.mjs` fue creado para **texto + enlace** y **no tiene todavía un flujo probado de adjuntos visuales**. Su preflight 15/15 no certifica el QA visual del post. Hasta ampliar y validar la carga de medios, no se debe presentar esa ruta como apta para nuevas publicaciones bajo esta política ni ejecutar `--publish` para una pieza que perdería su imagen/carrusel. Esta norma no exige borrar ni duplicar publicaciones históricas.

---

## 3. Ventana Temporal entre Despliegue y Distribución

### 3.1 Política de Tiempo Mínimo y Recomendado
1. **Ventana Recomendada (Ideal)**: **Publicación del artículo el día anterior** a la difusión del post en LinkedIn. Permite:
   - Tiempo holgado para la ejecución del QA independiente y pruebas de regresión.
   - Propagación completa en cachés perimetrales (Cloudflare Edge CDN) y resolución DNS global.
   - Indexación inicial o rastreo por bots de inspección social (LinkedIn Post Inspector / Facebook Crawler).
2. **Ventana Mínima Operativa**: **2 a 4 horas** antes de publicar el post en LinkedIn, sujeta a verificación externa exitosa de la URL viva.

### 3.2 Desmitificación de Mitos Algorítmicos
- **Falso mito**: *"LinkedIn penaliza los enlaces si el post se publica inmediatamente o si el enlace está en el cuerpo del post"*.
- **Hecho técnico objetivo**: La ventana de 2 a 4 horas responde estrictamente a factores de infraestructura:
  - Generación de la previsualización del Open Graph (`og:image`, `og:title`) en la infraestructura de LinkedIn (LinkedIn Scraping Bot). Si la página no responde HTTP 200 inmediato con cabeceras `image/png` o `image/webp` optimizadas, LinkedIn almacena un caché vacío de la tarjeta (*card*) durante semanas.
  - Verificación humana y técnica de que la landing page y el formulario/mailto responden con cero errores de consola.
  - No se realizan afirmaciones esotéricas sobre "trucos de algoritmo" ni se recurre a colocar enlaces en el primer comentario (lo cual degrada la experiencia de usuario y reduce la trazabilidad de UTMs).

---

## 4. Gate Editorial Fail-Closed (Preflight Técnico)

Antes de autorizar cualquier post para LinkedIn, se ejecuta una verificación técnica determinista. Si una sola comprobación falla, el estado pasa inmediatamente a `BLOQUEADO_POR_GATE`.

### 4.1 Criterios de Evaluación del Gate

```
[Comprobación de Preflight]
├── 1. HTTP Status == 200 OK (sin redirecciones 301/302 inesperadas)
├── 2. Header Content-Type == text/html; charset=utf-8
├── 3. Edge CDN Cache status (Cloudflare HIT/DYNAMIC válido, sin errores 52x)
├── 4. Presencia de marcado prerenderizado:
│      ├── Tag <h1 class="blogPostTitle"> coincide con el título del artículo
│      └── NO es una plantilla SPA en blanco esperando hidratación de cliente
├── 5. Tag <link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/[slug]/"> exacto
├── 6. Metatags Open Graph completos:
│      ├── og:title no vacío
│      ├── og:description conciso
│      ├── og:url con barra final idéntica a la canonical
│      └── og:image apunta a asset absoluto existente (HTTP 200)
├── 7. Ausencia de directiva noindex (<meta name="robots" content="noindex"> ausente)
├── 8. Enlaces internos hacia /servicios/ y /casos/ presentes y válidos en el DOM
├── 9. Bloque CTA presente con mailto estructurado hacia contact.orbitalframeworks@gmail.com
└── 10. URL de campaña UTM única y sanitizada (sin caracteres de escape erróneos)
```

---

## 5. Checklists de Control de Calidad Editorial

### 5.1 Checklist Factual y Verificabilidad (Cero Alucinaciones)
- [ ] **Prohibición absoluta de social proof simulado**: No se inventan clientes, testimonios, logotipos, cotizaciones ni cifras de facturación.
- [ ] **Casos reales del repositorio**: Cualquier mención a implementaciones previas debe respaldarse exclusivamente en las rutas oficiales del proyecto:
  - `Checkio`: Sistema web para registro de asistencia, marcaciones y trazabilidad de personal (`/casos/checkio/`).
  - `Wasy`: Catálogo digital y gestión de pedidos conectado a canales operativos (`/casos/wasy/`).
  - `Localisa`: Plataforma web para búsqueda de inmuebles (`/casos/localisa/`).
  - `PeruLog Pallets`: Landing page técnica y captación de clientes industriales B2B (`/casos/perulog-pallets/`).
- [ ] **Tratamiento de afirmaciones de ahorro o rendimiento**: No afirmar porcentajes genéricos de ahorro (ej. *"ahorra 80% en costos"*). Describir la mecánica técnica (ej. *"elimina el costo por asiento en dólares al reemplazar licencias SaaS por infraestructura propia"*).
- [ ] **Gestión de lagunas de información**: Si un dato requiere confirmación del socio fundador o del cliente, el artículo debe declararse como `DRAFT_NO_PUBLICABLE` e incluir la pregunta explícita en `prioritizedOwnerQuestion`.

### 5.2 Checklist SEO y Descubribilidad Orgánica
- [ ] **Título del artículo (`<title>`)**: Entre 50 y 65 caracteres, enfocado en intención de búsqueda comercial o técnica de gerentes y directores (sintaxis: `[Título Descriptivo] | Orbital Insights`).
- [ ] **Meta Description**: Entre 130 y 155 caracteres, orientada al beneficio operativo real, sin lenguaje engañoso.
- [ ] **Jerarquía semántica de encabezados**:
  - Un único `<h1>` en la vista que contiene el título principal.
  - `<h2>` numerados para las secciones principales.
  - `<h3>` para subtemas, tablas o bloques de diagnóstico.
- [ ] **URL Canonical**: Formato absoluto con trailing slash: `https://orbitalframeworks.qzz.io/blog/[slug]/`.
- [ ] **Prerenderizado e Inclusión en Sitemap**:
  - Compilación verificada mediante `npm run build`.
  - Inclusión automática en `dist/blog/[slug]/index.html` con HTML legible sin JavaScript.
  - Registro en `public/sitemap.xml` con `<loc>` y `<lastmod>`.

### 5.3 Checklist Anti-Slop y Anti-Clichés de IA
- [ ] **Filtro de lugares comunes**: Prohibidas terminologías infladas de IA:
  - ❌ *"En el vertiginoso mundo digital de hoy en día..."*
  - ❌ *"Descubre cómo revolucionar tu negocio con un cambio de paradigma..."*
  - ❌ *"Navegar las complejidades del panorama actual..."*
  - ❌ *"En conclusión / En resumen / Al final del día..."*
- [ ] **Voz operativa directa**: Redacción orientada a personas que toman decisiones con presupuesto: problemas de licenciamiento, duplicidad de tareas en Excel, errores humanos en digitación, falta de reportes consolidados.
- [ ] **Estructura digerible**: Párrafos breves (máximo 3-4 líneas), uso de listas numeradas para secuencias lógicas y matrices de decisión con criterios contrapuestos.

### 5.4 Checklist de CTA y Rutas de Conversión
- [ ] **Enlaces internos a servicios**: Cada artículo debe incluir al menos 2 enlaces contextuales hacia las páginas de servicio oficiales:
  - `/servicios/desarrollo-software-medida/`
  - `/servicios/automatizacion-procesos/`
  - `/servicios/landing-pages-b2b/`
- [ ] **Enlaces a casos de estudio**: Al menos 1 o 2 enlaces hacia casos reales del portafolio.
- [ ] **Tarjeta de llamada a la acción (CTA) al pie**:
  - Titular claro y no agresivo (ej. *"¿Tu empresa evalúa sistematizar un flujo operativo?"*).
  - Enlace directo `mailto:contact.orbitalframeworks@gmail.com` con `subject` y `body` predefinidos que inviten a describir el problema del negocio.
  - Canal alternativo: Redacción de Gmail web y botón accesible para copiar la dirección al portapapeles.

### 5.5 Checklist de Analítica GA4 y Privacidad Consent-Aware
- [ ] **Google Consent Mode v2**: Estados por defecto `ad_storage: 'denied'`, `analytics_storage: 'denied'`. Las cookies analíticas no se escriben hasta que medie aceptación expresa del usuario.
- [ ] **Cero PII en URLs**: Parámetros de consulta sanitizados por `sanitizeUrl` (eliminación de `email`, `user`, `token`, etc.).
- [ ] **Parámetros UTM Pasivos**: Preservación segura en `page_location` de:
  - `utm_source`: `linkedin`
  - `utm_medium`: `organic_social`
  - `utm_campaign`: `[slug_campaña_específica]`
- [ ] **Eventos de Intención Calificados**:
  - `page_view` en el artículo.
  - `article_intent` con `intent_type: "article_to_service"` al hacer clic en enlaces de servicios.
  - `article_intent` con `intent_type: "article_to_contact"` al interactuar con el CTA.
  - `contact_intent` emitido en clics a `mailto:`, apertura de Gmail o copia al portapapeles.
- [ ] **Prohibición de Falso `generate_lead`**: Prohibido disparar `generate_lead` en eventos del navegador. La intención es un intento de contacto; el lead calificado solo existe tras la recepción efectiva del correo en la bandeja de entrada.
- [ ] **Monitoreo con SLA de Procesamiento**: Evaluar tráfico en tiempo real mediante **GA4 Realtime Report** o DebugView, recordando que las tablas agregadas y conectores de API (Windsor.ai, Looker Studio) tienen un retraso de procesamiento de 24 a 48 horas ("0 filas Windsor vs collect HTTP 204").

---

## 6. Procedimiento de Auditoría Mínima Mensual

Cada 30 días, el equipo técnico y editorial debe ejecutar una auditoría integral que documente hechos medibles y problemas detectados, sin extrapolar métricas vanidosas:

1. **Auditoría SEO y Descubribilidad (Google Search Console)**:
   - Cobertura de indexación de todas las rutas de blog y servicios.
   - Rendimiento en búsquedas: consultas comerciales de Perú (impresiones, clics, CTR y posición media).
   - Verificación de enlaces canónicos declarados vs. seleccionados por Google.
2. **Auditoría UX y Calidad de Navegación**:
   - Inspección visual de legibilidad en dispositivos móviles y de escritorio.
   - Verificación de contrastes tipográficos y safe zones.
   - Confirmación de funcionamiento de enlaces cruzados y botones de copia de correo.
3. **Auditoría de Conversión y Salud de Medición (GA4)**:
   - Ratio de lectura profunda y navegación de artículo hacia páginas de servicio (`article_to_service` / sesiones de blog).
   - Ratio de intención de contacto (`contact_intent` / sesiones totales).
   - Comparación estricta entre número de eventos `contact_intent` y correos reales entrantes en `contact.orbitalframeworks@gmail.com`.
   - Detección de posibles anomalías de red o peticiones rechazadas por el colector.
