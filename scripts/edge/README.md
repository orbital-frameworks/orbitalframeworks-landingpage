# Content Negotiation Edge Architecture & Rollback Plan

## 1. Diagnóstico de Infraestructura y Limitaciones de Hosting

Orbital Frameworks (`orbitalframeworks.qzz.io`) está hospedado sobre AWS Amplify Hosting con Cloudflare como autoridad DNS autoritativa (`jarred.ns.cloudflare.com`).

### Limitación de AWS Amplify Hosting estático:
- `customHttp.yml` permite inyectar encabezados estáticos (`Vary`, `Cache-Control`, `Content-Type`, `Strict-Transport-Security`) según patrones fijos de URL en la petición (`**/*.html`, `**/*.md`, `/llms.txt`).
- Sin embargo, AWS Amplify Hosting no expone capacidades de enrutamiento condicional dinámico basadas en encabezados de petición (`Accept: text/markdown` vs `Accept: text/html`) sin intervención en una capa edge previa.

### Retiro de la alternativa CloudFront Functions:
- La alternativa previa basada en CloudFront Functions (`cloudfront-content-negotiation.js`) fue excluida y eliminada del repositorio. CloudFront Functions no soporta sintaxis de módulos ES (`export`), y sus primitivas de ejecución en viewer-request/viewer-response no permiten realizar peticiones subrequest/fetch al origen ni sustituir cuerpos de error 404 con representaciones Markdown (`404.md`).
- Por tanto, la arquitectura estandariza en **UNA ÚNICA RUTA EDGE VIABLE**: Cloudflare Worker.

---

## 2. Arquitectura Canónica: Cloudflare Worker (`cloudflare-worker-content-negotiation.js`)

Dado que la zona DNS `orbitalframeworks.qzz.io` está delegada en Cloudflare, se especifica un Cloudflare Worker en la ruta `orbitalframeworks.qzz.io/*` con proxy habilitado (nube naranja):

1. **Home (`/` o `/index.html`)**:
   - Inspecciona el encabezado `Accept` mediante `prefersMarkdown(acceptHeader)`, evaluando pesos `q=` según RFC 9110:
     - Si `text/markdown` tiene mayor peso de calidad que `text/html` (`mdQ > htmlQ` y `mdQ > 0`), obtiene `/index.md`, entregando HTTP 200 con `Content-Type: text/markdown; charset=utf-8` y `Vary: Accept`.
     - Si `Accept` tiene ponderaciones iguales o prioriza `text/html`, entrega la versión HTML prerenderizada sin alteración.
     - Si `text/markdown;q=0`, se rechaza explícitamente la entrega de Markdown.
2. **404 para URL inexistente**:
   - Si el origen devuelve HTTP 404 y `prefersMarkdown` es verdadero, entrega el contenido de `/404.md` con status HTTP 404, `Content-Type: text/markdown; charset=utf-8`, encabezado `Vary: Accept` y enlaces válidos a `llms.txt` y `sitemap.xml`.
   - Si la petición solicita HTML, entrega el 404 HTML estándar del sitio con HTTP 404.
3. **Aislamiento de Caché y Seguridad**:
   - Emite siempre `Vary: Accept` en las respuestas para prevenir envenenamiento o contaminación cruzada de caché entre navegadores e intérpretes Markdown de agentes.
   - Preserva encabezados de seguridad de origen.

---

## 3. Configuración y Despliegue de Cloudflare Worker

El archivo de configuración versionado es `scripts/edge/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "orbitalframeworks-content-negotiation",
  "main": "cloudflare-worker-content-negotiation.js",
  "compatibility_date": "2026-10-15",
  "routes": [
    {
      "pattern": "orbitalframeworks.qzz.io/*",
      "zone_name": "orbitalframeworks.qzz.io"
    }
  ]
}
```

### Requisitos y Gate de Producción:
- **Disponibilidad de Wrangler**: La CLI Wrangler requiere credenciales de Cloudflare (`CLOUDFLARE_API_TOKEN` o `CLOUDFLARE_ACCOUNT_ID`) y conectividad externa a la API de Cloudflare. Dentro de entornos locales o sandboxes herméticos offline, no se realizan mutaciones de red hacia Cloudflare.
- **Activación de Proxy DNS**: Requiere que el registro DNS `orbitalframeworks.qzz.io` en Cloudflare esté configurado en modo Proxied (nube naranja) para que el tráfico pase por los edge nodes de Cloudflare.

### Comandos de Despliegue (Fase de Release Protegida):
```bash
# 1. Autenticación / Verificación de credenciales
npx wrangler whoami

# 2. Despliegue directo del worker
cd scripts/edge
npx wrangler deploy --config wrangler.jsonc

# 3. Comprobación de rutas activas
npx wrangler routes list
```

---

## 4. Plan de Rollback Inmediato y Reversible

En caso de cualquier anomalía o degradación en producción tras la activación:

- **Opción 1 — Desactivación de Ruta (Tiempo: < 5 segundos)**:
  Desde el Cloudflare Dashboard: `Workers & Pages` -> `orbitalframeworks-content-negotiation` -> `Triggers` -> Desactivar la ruta `orbitalframeworks.qzz.io/*`. El tráfico pasará directamente al origen AWS Amplify.
- **Opción 2 — Eliminación vía CLI (Tiempo: < 10 segundos)**:
  ```bash
  npx wrangler routes delete "orbitalframeworks.qzz.io/*"
  ```
- **Opción 3 — Bypass DNS (Tiempo: < 30 segundos)**:
  Cambiar el registro DNS de `orbitalframeworks.qzz.io` de Proxied (naranja) a DNS Only (gris). El tráfico bypasseará completamente el pipeline de Workers directamente a la IP/distribución de AWS Amplify.

---

## 5. Pruebas de Verificación de Endpoints

Una vez desplegado en el release gate, verificar los endpoints mediante peticiones con encabezados exactos:

```bash
# 1. Home con Accept: text/html (HTTP 200, Content-Type: text/html, Vary: Accept)
curl -i -H "Accept: text/html" https://orbitalframeworks.qzz.io/

# 2. Home con Accept: text/markdown (HTTP 200, Content-Type: text/markdown, Vary: Accept)
curl -i -H "Accept: text/markdown" https://orbitalframeworks.qzz.io/

# 3. 404 con Accept: text/html (HTTP 404, Content-Type: text/html, Vary: Accept)
curl -i -L -H "Accept: text/html" https://orbitalframeworks.qzz.io/ruta-inexistente-test

# 4. 404 con Accept: text/markdown (HTTP 404, Content-Type: text/markdown, Vary: Accept)
curl -i -L -H "Accept: text/markdown" https://orbitalframeworks.qzz.io/ruta-inexistente-test
```
