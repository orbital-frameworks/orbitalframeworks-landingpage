# Guía del Operador: Flujo Blog a LinkedIn (Orbital Insights)

```yaml
document_id: orbital-blog-linkedin-operator-guide-20261017
project: orbitalframeworks-landingpage
version: 1.0.0
authority: canonical-editorial-and-social-operations
classification: INTERNAL_OPERATOR_GUIDE
status: ACTIVE
write_scope: docs/
cli_tool: "scripts/blog-linkedin-gate.mjs"
manifest: "docs/blog-linkedin-manifest.json"
handoff_pack: "docs/linkedin-pilot-handoff-2026-10-17.md"
official_contact: "contact.orbitalframeworks@gmail.com"
lead_policy: "Intent-only (Cero generate_lead en cliente)"
```

---

## 1. Propósito y Arquitectura

Esta guía describe el procedimiento operativo estándar para convertir artículos técnicos publicados en el blog nativo de **Orbital Frameworks** (`https://orbitalframeworks.qzz.io/blog/`) en paquetes de distribución social verificados para **LinkedIn Orgánico**.

### 1.1 Principios Rectores
1. **Desacoplamiento y aprobación por pieza:** No se incorporan tokens ni APIs privadas de LinkedIn al repositorio. El autopost masivo sigue deshabilitado. Una pieza con artículo público verificado y texto aprobado exactamente puede distribuirse mediante la sesión empresarial de la VPS usando `scripts/linkedin-company-publisher.mjs`; nunca se envía automáticamente por generar el pack.
2. **Fail-Closed Estricto:** Si una sola verificación técnica o editorial falla (HTTP no 200, canonical rota, título ausente, plantilla SPA en blanco, robots noindex, o artículo en borrador), el runtime bloquea la generación del paquete social y emite dictamen `BLOQUEADO_POR_GATE`.
3. **Cero Alucinaciones:** Cero testimonios, clientes, cifras o casos no existentes en el repositorio. La única evidencia comercial admitida son los 4 proyectos reales (`Checkio`, `Wasy`, `Localisa`, `PeruLog Pallets`) y los canales oficiales (`contact.orbitalframeworks@gmail.com`).

---

## 2. CLI de Preflight Gate (`scripts/blog-linkedin-gate.mjs`)

El preflight gate inspecciona de manera determinista la página del blog mediante peticiones HTTP(S) nativas de Node.js, evaluando 15 puntos de control de integridad técnica antes de producir el paquete de LinkedIn.

### 2.1 Modos de Ejecución

```bash
# 1. Verificación en vivo sobre la URL pública de producción (por defecto para el piloto)
node scripts/blog-linkedin-gate.mjs --dry-run

# 2. Verificación en vivo sobre un slug específico del backlog
node scripts/blog-linkedin-gate.mjs --slug automatizacion-procesos-vs-excel-riesgo-operativo

# 3. Verificación sobre el build local prerenderizado (sin red externa)
node scripts/blog-linkedin-gate.mjs --local

# 4. Verificación usando un fixture HTML específico
node scripts/blog-linkedin-gate.mjs --fixture tests/fixtures/sample-article.html

# 5. Salida estructurada JSON para pipelines
node scripts/blog-linkedin-gate.mjs --json
```

### 2.2 Puntos de Control Validados (15 Checks)

| Check ID | Comprobación | Condición de Fallo (Fail-Closed) |
| :--- | :--- | :--- |
| `http_200` | Código de estado HTTP | Código distinto a 200 (404, 500, 521, timeout). |
| `html_substantial` | Tamaño del contenido HTML | Longitud inferior a 2,500 caracteres. |
| `no_spa_blank_fallback` | Renderizado estático | Presencia de `<div id="root"></div>` sin DOM de artículo. |
| `canonical_tag` | Etiqueta canonical exacta | Canonical ausente o distinta a `https://orbitalframeworks.qzz.io/blog/[slug]/`. |
| `h1_heading` | Encabezado principal H1 | H1 ausente o que no coincide con el título del artículo. |
| `og_title` | Open Graph: Título | `og:title` ausente o menor a 5 caracteres. |
| `og_description` | Open Graph: Descripción | `og:description` ausente o menor a 20 caracteres. |
| `og_url` | Open Graph: URL | `og:url` no idéntica a la URL canonical. |
| `og_type_article` | Open Graph: Tipo de recurso | `og:type` distinto a `article`. |
| `robots_indexable` | Directiva de indexación | Presencia de directiva `<meta name="robots" content="noindex">`. |
| `no_draft_banner` | Estado editorial en HTML | Detección de `DRAFT_NO_PUBLICABLE` o banner de borrador. |
| `cta_contact_channel` | Canal oficial de conversión | Enlace CTA hacia `contact.orbitalframeworks@gmail.com` ausente. |
| `factual_integrity` | Integridad de datos | Presencia de números telefónicos no verificados (`+51 9...`) o claims falsos de ROI. |
| `internal_navigation` | Enlaces internos de valor | Ausencia de enlaces cruzados a servicios (`/servicios/`) o casos (`/casos/`). |
| `sitemap_inclusion` | Presencia en sitemap.xml | URL ausente en `public/sitemap.xml`. |

---

## 3. Generador de Parámetros UTM y Política Anti-PII

El gate genera URLs de campaña deterministas con la siguiente estructura:

```
https://orbitalframeworks.qzz.io/blog/[slug]/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=[campaign_name]
```

### 3.1 Política Estricta de Protección de Datos Personales (Anti-PII)
- El módulo `sanitizeAndValidateUtmUrl` examina todas las claves de consulta en búsqueda de parámetros sensibles (`email`, `mail`, `user`, `phone`, `token`, `key`, `auth`, etc.).
- Si se detecta un parámetro de PII en modo estricto, la ejecución aborta de inmediato con la excepción `RECHAZADO_POR_POLITICA_PII`.
- En modo permisivo, los parámetros PII se eliminan conservando exclusivamente los parámetros de campaña analítica.

---

## 4. Manifiesto y Política contra Duplicados (`docs/blog-linkedin-manifest.json`)

Para evitar publicaciones redundantes o dispersión de tráfico:
1. **Registro Persistente:** El archivo `docs/blog-linkedin-manifest.json` almacena el historial de revisiones, estados del gate, veredictos y rutas de los handoff packs.
2. **Protección del Post Histórico:** Se preserva de forma inmutable la publicación histórica institucional sin enlace:
   - **URN:** `urn:li:share:7516883410074836992`
   - **Política:** `IMMUTABLE_PRESERVE` (Prohibido modificar, borrar o replicar).
3. **Bloqueo de Duplicados:** Si un artículo ya figura con estado `DISTRIBUTED`, el gate bloquea la ejecución con `DUPLICATE_DISTRIBUTION_BLOCKED`, requiriendo la bandera `--force` para autorizar una actualización deliberada.
4. **Bandera Autopost:** `autopostAuthorized` permanece en `false` para impedir envíos sin aprobación individual. El publicador por sesión empresarial exige un hash SHA-256 del texto exacto más la opción explícita `--publish`. Véase `docs/LINKEDIN_COMPANY_PUBLISHER.md`.

---

## 5. Ventana Temporal entre Despliegue y Publicación

Se establece una ventana mínima y recomendada entre el despliegue del artículo y la publicación en LinkedIn:

```
[Despliegue de Código (Vite SSR Build + Deploy)]
                     │
                     ▼
  (Ventana Mínima: 2 a 4 horas / Recomendada: Día Anterior)
  • Propagación en Cloudflare Edge CDN (Caché HIT/DYNAMIC).
  • LinkedIn Post Inspector / Facebook Crawler actualizan caché de Open Graph.
  • Ejecución de QA independiente sobre producción.
                     │
                     ▼
[Ejecución de Preflight Gate: node scripts/blog-linkedin-gate.mjs]
                     │
                     ▼ (PASS)
[Publicación aprobada en LinkedIn por operador o por sesión empresarial verificada]
```

- **Mito técnico desmentido:** No existen "penalizaciones algorítmicas" por colocar enlaces en el cuerpo de la publicación. La ventana de 2 a 4 horas responde a los tiempos de propagación de caché y generación del preview (`og:image`) por los servidores de LinkedIn. Colocar enlaces en el primer comentario deteriora la experiencia y rompe la trazabilidad UTM.

---

## 6. Medición GA4 y Consent Mode v2

- **Consentimiento por Defecto:** Google Consent Mode v2 inicia con `ad_storage: 'denied'` y `analytics_storage: 'denied'`.
- **Eventos Calificados del Funnel:**
  - `page_view`: Registrado en `/blog/[slug]/` preservando UTMs sin PII.
  - `article_intent` (`intent_type: "article_to_service"`): Registrado al interactuar con enlaces hacia `/servicios/`.
  - `article_intent` (`intent_type: "article_to_contact"`): Registrado al interactuar con el CTA de contacto.
  - `contact_intent`: Disparado al abrir redacción de Gmail o copiar la dirección oficial al portapapeles.
- **Prohibición de Falso `generate_lead`:** Prohibido emitir `generate_lead` desde el navegador. Un lead calificado únicamente existe cuando un correo con requerimiento operativo ingresa en `contact.orbitalframeworks@gmail.com`.

---

## 7. Procedimiento de Auditoría Ligera Mensual (Cada 30 Días)

| Área de Auditoría | Fuente de Datos | Verificaciones Obligatorias |
| :--- | :--- | :--- |
| **SEO y Búsqueda** | Google Search Console | Cobertura de indexación en `/blog/` y `/servicios/`. Posicionamiento en términos comerciales de desarrollo de software en Perú. |
| **UX y Accesibilidad** | Navegador / Inspección visual | Legibilidad en pantallas móviles (320px/390px) y escritorio (1440px). Safe zones tipográficas y proporción de imágenes sin distorsión. |
| **Conversión y Telemetría** | GA4 Realtime / Eventos | Ratios de transición `article_to_service` y `article_to_contact`. Ausencia de errores de red o peticiones rechazadas. Conciliación estricta entre clics y correos entrantes reales. |

---

## 8. Checklist Paso a Paso para el Operador

- [ ] 1. Verificar que el artículo en `src/blogData.ts` esté en estado `PUBLISHED`.
- [ ] 2. Ejecutar `npm run build && npm test` localmente para garantizar SSR limpio.
- [ ] 3. Tras el despliegue en producción viva, esperar al menos 2 horas.
- [ ] 4. Verificar la página publicada sin escribir archivos: `node scripts/blog-linkedin-gate.mjs --dry-run`. Ejecutar sin `--dry-run` únicamente cuando esté lista la revisión del pack; reservar `--force` para una excepción deliberada a la política de duplicados.
- [ ] 5. Confirmar que el veredicto sea `✅ PASS` (15/15 checks superados).
- [ ] 6. Abrir el archivo de entrega `docs/linkedin-[slug]-handoff.md` o `docs/linkedin-pilot-handoff-2026-10-17.md`.
- [ ] 7. Copiar el texto de publicación y la URL con UTM limpio hacia la interfaz de publicación de LinkedIn de la empresa.
- [ ] 8. Comprobar que LinkedIn genere la previsualización de Open Graph correctamente.
- [ ] 9. Publicar manualmente la pieza.
- [ ] 10. Monitorear eventos en tiempo real en GA4 Realtime Report durante los primeros 30 minutos.
