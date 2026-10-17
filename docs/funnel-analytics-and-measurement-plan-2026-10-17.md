# Plan de Medición del Embudo B2B en GA4 y Marco de Evaluación a 28 Días

```yaml
document_id: orbital-funnel-analytics-measurement-plan-20261017
project: orbitalframeworks-landingpage
date: 2026-10-17
node_id: funnel-analytics-and-editorial-review
role: software-builder
mode: workspace-write
status: PASS
verification_method: cdp-and-unit-tests
ga_stream_id: G-487MJFCW45
consent_mode: Google Consent Mode v2 (Strict Default Denied)
pii_policy: Zero PII / URL Query Sanitization
lead_generation_policy: Intent-only (Zero false generate_lead)
```

---

## 1. Resumen Ejecutivo de la Medición del Embudo

Para captar clientes empresariales B2B de forma orgánica y sin gasto publicitario, Orbital Frameworks requiere una instrumentación analítica que mida con precisión el recorrido del usuario desde el descubrimiento de contenido (*Orbital Insights*) y las páginas de servicio específicas hasta la intención real de contacto, respetando de manera absoluta la privacidad del usuario, la normativa de protección de datos personales y el consentimiento explícito.

Este documento establece la arquitectura técnica implementada en `src/analytics.ts`, detalla la taxonomía de eventos del embudo, analiza la brecha de reporte conocida en GA4 ("0 filas Windsor vs collect HTTP 204") y define el marco de evaluación de KPIs a 28 días tras la puesta en producción.

---

## 2. Arquitectura de Recorrido Consent-Aware (Embudo de Conversión)

El embudo de conversión mide cuatro etapas discretas sin capturar información de identificación personal (PII) ni simular conversiones no verificadas:

```
[Descubrimiento / Tráfico]
   │  • Enlace LinkedIn orgánico con UTMs / Búsqueda orgánica en Google
   ▼
[Etapa 1: Lectura de Artículo Piloto]
   │  • Evento: page_view (/blog/software-a-medida-o-saas-como-decidir/)
   │  • Preservación segura de: utm_source, utm_medium, utm_campaign
   │  • Sanitización estricta: eliminación de claves sensibles (?email=, ?user=, etc.)
   ├─────────────────────────────────────────────────┐
   ▼ (Ruta A: Profundización técnica)                ▼ (Ruta B: Contacto directo)
[Etapa 2: Navegación hacia Servicio]           [Intención de Contacto Directa]
   │  • Evento: article_intent                    │  • Evento: article_intent
   │    intent_type: "article_to_service"         │    intent_type: "article_to_contact"
   │    target: "/servicios/.../"                 │    target: "mailto" | "gmail" | "copy_email"
   │    article_slug: [slug-articulo]             │  • Evento: contact_intent
   ▼                                              │    method: "email" | "gmail" | "copy_email"
[Etapa 3: Página de Servicio B2B]                 │    contact_channel: "mailto" | "gmail_compose" | "clipboard"
   │  • Evento: page_view (/servicios/.../)       │    funnel_origin: [slug-articulo]
   ▼                                              └───────────────────┐
[Etapa 4: Intención de Contacto desde Servicio]                       │
   │  • Evento: service_intent                                        │
   │    intent_type: "service_to_contact"                             │
   │    target: "mailto" | "gmail" | "copy_email"                     │
   │    service_slug: [slug-servicio]                                 │
   │    from_article: [slug-articulo-previo-si-aplica]                │
   │  • Evento: contact_intent                                        │
   │    method: "email" | "gmail" | "copy_email"                      │
   │    contact_channel: "mailto" | "gmail_compose" | "clipboard"     │
   │    source_path: "/servicios/.../"                                │
   │    service_context: [slug-servicio]                              │
   │    funnel_origin: [slug-articulo-previo-si-aplica]               │
   ▼                                                                  ▼
[Bandeja Oficial: contact.orbitalframeworks@gmail.com] ◄──────────────┘
   • Recepción real de correo (ÚNICA evidencia de lead calificado real).
```

---

## 3. Principios y Salvaguardas Técnicas Implementadas

### 3.1 Cero Duplicación de `gtag` y Deduplicación de Clics
- Se implementó un filtro de deduplicación en memoria con ventana de enfriamiento de 250 ms (`isDuplicateEvent`) en `src/analytics.ts`.
- Se eliminaron los manejadores `onClick` redundantes en los elementos `<a>` de `BlogPostPage.tsx` y `ServicePage.tsx`. El delegado global de eventos `trackClick` procesa los enlaces una sola vez, emitiendo tanto el evento específico de sección (`article_intent` o `service_intent`) como el evento consolidado `contact_intent`.

### 3.2 Prohibición de Falsos Leads (`generate_lead`)
- El acto de hacer clic en un enlace `mailto:`, abrir una ventana de redacción de Gmail o copiar la dirección de correo al portapapeles constituye una **intención de contacto** (`contact_intent`), no un lead confirmado.
- **Regla inquebrantable**: El evento estándar `generate_lead` está prohibido para interacciones del lado del cliente. Solo una recepción confirmada en la bandeja oficial o una confirmación de formulario de doble factor (si se implementara en el futuro) califica como lead.

### 3.3 Sanitización Estricta de Parámetros de URL (Cero PII)
- La función interna `sanitizeUrl` analiza toda URL registrada en `page_location` y `page_referrer`:
  - **Conserva**: Parámetros estándar de analítica (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
  - **Elimina automáticamente**: Parámetros susceptibles de contener datos personales o credenciales (`email`, `mail`, `user`, `name`, `phone`, `tel`, `token`, `key`, `auth`, `pass`, `pwd`).

### 3.4 Compatibilidad Estricta de dataLayer con Google Tag Manager / GA4
- Toda invocación a `window.dataLayer.push` utiliza objetos nativos `Arguments`, no arreglos JavaScript estándar (`Array`), garantizando que la cola de comandos de `gtag.js` sea procesada correctamente por el motor de Google.

---

## 4. Diagnóstico Técnico: "0 filas Windsor vs collect HTTP 204"

Un hallazgo recurrente en las auditorías de medición es la aparente contradicción entre la confirmación técnica de red (el navegador emite peticiones hacia `https://www.google-analytics.com/g/collect` y recibe respuestas HTTP 204 No Content de Google) y las herramientas de extracción de datos por API (como Windsor.ai o conectores de Looker Studio), las cuales reportan `0 rows` durante las primeras 24 a 48 horas.

### 4.1 Causa Raíz
1. **Diferencia entre Pipeline de Ingestión en Tiempo Real y Tablas Agregadas**:
   - `google-analytics.com/g/collect` responde `HTTP 204` de forma síncrona en el borde de Google (Cloudflare / Google Edge) indicando que la carga útil (*payload*) fue aceptada sintácticamente por el colector.
   - La API de reportes de GA4 (*Data API v1beta*) y los conectores de terceros (Windsor.ai, Supermetrics) no consultan el colector en vivo; consultan las tablas de agregación procesadas (*daily summary tables*) o el esquema de exportación a BigQuery.
   - El acuerdo de nivel de servicio (SLA) de procesamiento de datos de GA4 para propiedades gratuitas estándar es de **24 a 48 horas**. Durante este periodo, las consultas por API devuelven 0 filas a pesar de que el tráfico es genuino.
2. **Filtrado por Umbrales de Datos (*Data Thresholding*)**:
   - Cuando el volumen de usuarios es bajo (sitio nuevo o entornos de prueba), Google Analytics aplica automáticamente umbrales de privacidad (*thresholding*) para evitar la identificación indirecta de usuarios individuales si Google Signals está activado o la dimensionalidad es muy granular.
   - En Orbital Frameworks, `allow_google_signals: false` y `restricted_data_processing: true` fueron configurados deliberadamente para mitigar este efecto, pero el retraso de consolidación de 24 horas persiste.

### 4.2 Protocolo de Validación Operativa
- **No asumir rotura de código**: La verificación local y de staging debe realizarse observando las peticiones de red hacia `/g/collect` y mediante la vista de depuración oficial **GA4 DebugView** o el reporte de **Tiempo Real (Realtime Report)** en la consola de Google Analytics.
- **Validación Externa**: Tras el despliegue a producción, esperar un ciclo completo de 48 horas de tráfico antes de auditar los conectores externos de Business Intelligence.

---

## 5. Marco de Evaluación y Plan de KPIs a 28 Días

Se descarta expresamente la optimización para métricas tautológicas o vanidosas (ej. "puntaje SEO 100/100" en herramientas automatizadas). El éxito de la iniciativa se mide por la captación real de oportunidades comerciales B2B en Perú a través del siguiente tablero a 28 días:

| Dimensión | Indicador / KPI | Fuente de Medición | Umbral de Éxito a 28 Días | Acción Correctiva si no se Alcanza |
| :--- | :--- | :--- | :--- | :--- |
| **Descubribilidad B2B** | Impresiones y clics en queries comerciales prioritarias (ej. "desarrollo software a medida peru", "automatizacion procesos empresas peru", "landing page b2b peru"). | Google Search Console (GSC) | Indexación del 100% de rutas de servicios y blog. >150 impresiones en primeras 4 semanas. | Ajustar snippets, títulos descriptivos y añadir enlaces internos en el index.md. |
| **Tráfico Cualificado** | Sesiones orgánicas en páginas de servicio y artículos de blog. | GA4 (Reporte de Adquisición de Tráfico) | >50 sesiones orgánicas acumuladas en el clúster de servicios y blog. | Revisar indexación en GSC e impulsar distribución orgánica pasiva en LinkedIn. |
| **Tráfico LinkedIn Piloto** | Sesiones con `utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom`. | GA4 (Campañas) | >25 visitas provenientes de publicaciones de LinkedIn hacia el artículo piloto. | Mejorar el gancho inicial y la claridad del resumen operativo en el post de LinkedIn. |
| **Intención de Servicio** | Clics en enlaces internos de artículos hacia páginas de servicio (`article_to_service`). | GA4 (`en=article_intent`) | Tasa de clic a servicio > 8% de los lectores del artículo. | Mejorar la relevancia y ubicación contextual de las tarjetas de recomendación técnica. |
| **Intención de Contacto** | Interacciones totales de contacto (`contact_intent`: mailto, gmail, copia de correo). | GA4 (`en=contact_intent`) | >5 eventos de intención de contacto acumulados. | Optimizar el llamado a la acción (CTA) y verificar visibilidad del canal directo. |
| **Consultas Cualificadas** | Correos recibidos en `contact.orbitalframeworks@gmail.com` con asunto del embudo. | Bandeja de entrada oficial | >= 1 consulta de empresa real con requerimiento operativo verificable. | Ajustar el enfoque de problema/solución en las páginas de servicio para alinear expectativas. |
| **Clientes Conseguidos** | Contratos de desarrollo o consultoría cerrados y facturados. | Registro contable / CRM | >= 1 cliente B2B convertido en el ciclo comercial extendido. | Revisión profunda del proceso de propuesta técnica y propuesta de valor de Orbital. |

---

## 6. Procedimiento de Revisión al Día 28
1. Extraer reporte de Search Console para las 3 URLs de servicios y las 2 URLs de blog.
2. Comparar el volumen de eventos `article_to_service` vs `contact_intent` para identificar cuellos de botella en la navegación.
3. Evaluar si el equipo aportó un ejemplo real documentable para enriquecer el artículo piloto publicado como guía general; añadir experiencia propia únicamente con evidencia y autorización. No convertir una anécdota no verificada en resultado comercial.
