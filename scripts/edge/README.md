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

**Estado público comprobado (15-oct-2026):** la zona tiene nameservers Cloudflare, pero la respuesta del hostname procede de Amazon CloudFront/S3 sin `cf-ray`. Aún no hay evidencia de una ruta Worker activa. Los archivos `/index.md` y `/404.md` sí responden 200 como Markdown, mientras la portada y los 404 siguen respondiendo HTML incluso ante `Accept: text/markdown`.

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
   - La representación Markdown se obtiene específicamente desde la URL estática `/index.md`, distinta de la URL HTML `/`. No se debe confiar únicamente en `Vary` para separar las claves internas del caché de CDN.
   - Los métodos diferentes de GET y HEAD pasan al origen sin negociación de contenidos.
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
- **Acceso y ownership:** comprobar que la cuenta controla realmente la zona Cloudflare `orbitalframeworks.qzz.io` y que dispone de permisos DNS Edit y Workers Scripts/Routes Edit. La VPS no tiene credenciales de Cloudflare configuradas; no ejecutar comandos de despliegue ni crear tokens sin gate del owner.
- **Activación de Proxy DNS:** cambiar el registro de la web a Proxied (nube naranja) **solo en una ventana autorizada**, conservando el destino AWS Amplify. Hacer preflight de SSL/TLS Full (strict), del certificado Cloudflare para este hostname y del certificado ACM del origen. Mantener todos los registros CNAME de verificación de certificados en modo DNS Only; no eliminarlos ni cambiarlos.
- **Precaución de caché:** al servir `/index.md` y `/404.md` se usan URLs de origen distintas de `/`, además de `Vary: Accept`. Verificar de forma alternada agentes/navegadores y respuesta de 404 tras activar el proxy.
- **Coste y límite:** confirmar plan y volumen real antes de poner un Worker sobre `/*`. El plan gratuito tiene un límite diario de peticiones, y agotarlo puede producir errores de disponibilidad. No prometer coste total cero ni disponibilidad garantizada.

### Comandos de Despliegue (Fase de Release Protegida):
```bash
# 1. Autenticación / Verificación de permisos
npx wrangler whoami

# 2. Comprobar en dashboard el estado DNS, certificados TLS, registros de validación y rollback.
# 3. Desplegar SOLO tras aprobación explícita de DNS/Workers:
cd scripts/edge
npx wrangler deploy --config wrangler.jsonc

# 4. Confirmar la ruta activa en Cloudflare Dashboard > Workers & Pages > Triggers,
# y validar con las peticiones del apartado 5.
```

---

## 4. Plan de Rollback Inmediato y Reversible

Ante errores de disponibilidad o respuestas incorrectas:

1. Desde Cloudflare Dashboard, retirar/desactivar **únicamente** la ruta `orbitalframeworks.qzz.io/*` en `Workers & Pages > Triggers`. Conservar el Worker como artefacto versionado para auditar qué falló.
2. **Importante:** `wrangler deploy` aplica las rutas definidas en `wrangler.jsonc`. No volver a desplegar la configuración con la ruta antigua hasta corregir el incidente o la restablecería.
3. Solo si sigue fallando el proxy y la verificación TLS/Amplify está correcta, considerar regresar el registro de la web a DNS Only como rollback de infraestructura, con autorización específica. No modificar CNAME de validación ACM.
4. Repetir inmediatamente las cuatro pruebas del apartado siguiente. No prometer tiempos fijos de propagación o rollback: dependen del proveedor y del DNS/caché vigente.

---

## 5. Pruebas de Verificación de Endpoints

Una vez desplegado en el release gate, verificar los endpoints mediante peticiones con encabezados exactos:

La comprobación automática es `npm run verify:agents`. Se ejecuta sobre el hostname real y falla si `Accept: text/markdown` continúa sirviendo HTML; `npm test` solo demuestra el funcionamiento local del código.

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
