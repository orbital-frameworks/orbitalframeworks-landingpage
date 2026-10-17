# Informe de Revisión del Propietario: Recuperación Visual E2E y Gate Blog a LinkedIn

```yaml
document_id: orbital-blog-linkedin-owner-review-20261017
project: orbitalframeworks-landingpage
version: 1.0.0
authority: canonical-owner-review-and-audit
classification: INTERNAL_OWNER_REPORT
status: APPROVED
write_scope: docs/
runs_covered:
  - run_id: "a7feed14"
    scope: "Visual / ProofHub E2E Recovery, Viewports & CTAs"
    verdict: "PASS"
  - run_id: "93498d21"
    scope: "Blog to LinkedIn Preflight Gate, Deterministic UTM & Manifest"
    verdict: "PASS"
execution_node: "blog-gate-implementation"
pilot_article_url: "https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/"
historic_linkedin_post: "https://www.linkedin.com/feed/update/urn:li:share:7516883410074836992?actorCompanyId=134014070"
```

---

## 1. Resumen Ejecutivo

Este informe consolida la resolución secuencial y completa de los dos bloqueos técnicos identificados en el sitio web corporativo de **Orbital Frameworks**:
1. **Recuperación Visual y E2E de ProofHub (`run a7feed14`)**: Corrección de proporciones naturales en 4 proyectos de evidencia, soporte responsive completo (320px, 390px, 768px, 1440px), enlace de conversión vía Gmail compose y resiliencia ante entornos sandbox con sistemas de archivos de solo lectura (`EROFS`).
2. **Gate de Preflight Blog a LinkedIn (`run 93498d21`)**: Construcción de un verificador determinista en Node.js que realiza preflight sobre el artículo público viva, valida 15 puntos de control de integridad técnica y SEO, genera enlaces UTM sanitizados sin datos personales (PII), gestiona manifiestos de distribución y previene duplicaciones, manteniendo estrictamente deshabilitado el autoposting.

Ambos frentes fueron implementados y verificados con éxito, pasando el 100% de las suites de prueba (61 tests unitarios e integrados), con cero advertencias de linter, compilación tipada limpia y verificación directa del artículo piloto en producción viva.

---

## 2. Detalle de Ejecución: Run a7feed14 (ProofHub y Visual E2E)

### 2.1 Estado Previo en HEAD (`b92da0d`)
- **Dimensiones Intrínsecas en Código**: En `src/ProofHubPage.tsx` ya se habían configurado las dimensiones nativas de las capturas de pantalla:
  - `Localisa`: 1905 × 852 (ratio ~2.2359).
  - `Wasy`: 960 × 704 (ratio ~1.3636).
  - `Checkio`: 1917 × 904 (ratio ~2.1205).
  - `PeruLog Pallets`: 1336 × 601 (ratio ~2.2229).
- **Ajuste CSS Responsivo**: En `src/ProofHubPage.css` se eliminó el recorte artificial `aspect-ratio: 16/10` y `object-fit: cover`, sustituyéndolo por `object-fit: contain` y `height: auto`.
- **CTA Directo a Gmail Compose**: El botón de contacto principal se configuró hacia `https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com` con asunto estructurado.

### 2.2 Defectos que se Encontraban Pendientes y Fueron Subsanados
1. **Fallo EROFS en Scripts de Captura Visual**:
   - `scripts/verify-wasy-visual.mjs` fallaba al intentar escribir capturas en directorios protegidos o de solo lectura del sandbox.
   - Se implementó manejo defensivo con `try/catch` para redirigir las capturas a `/tmp/orbital-landing-visual-qa`.
2. **Resolución de Directorio `dist` en Entornos Restringidos**:
   - `tests/engagement-ux.test.mjs` y `tests/proof-hub-visual-and-cta.test.mjs` se actualizaron para resolver `/tmp/orbital-dist` automáticamente cuando `dist/` en el host no tiene permisos de escritura.
3. **Suite Automatizada de Pruebas Visuales**:
   - `tests/proof-hub-visual-and-cta.test.mjs` introdujo 6 pruebas automatizadas que validan proporciones de aspecto, clases CSS, ausencia de llaves secretas o números telefónicos inventados, y comportamiento responsive.
   - Documentación técnica registrada en `docs/ORBITAL_LANDING_VISUAL_RECOVERY_QA.md`.

---

## 3. Detalle de Ejecución: Run 93498d21 (Gate Blog a LinkedIn)

### 3.1 Implementación del CLI de Preflight (`scripts/blog-linkedin-gate.mjs`)
Se desarrolló un gate determinista en Node.js sin dependencias de terceros que ejecuta comprobaciones contra la URL del artículo o fixtures locales:

```
[Entrada: Slug del Artículo]
             │
             ├──► 1. Comprobación en Código/Backlog: ¿Está en DRAFT_NO_PUBLICABLE?
             │       └── Si es borrador: ABORTA CON ERR_ARTICLE_IN_DRAFT (Fail-Closed)
             │
             ├──► 2. Comprobación de Manifiesto y Política de Duplicados
             │       └── Si ya fue distribuido sin --force: ABORTA (Fail-Closed)
             │       └── Verifica preservación de post histórico urn:li:share:7516883410074836992
             │
             ├──► 3. Petición HTTPS GET a la URL Pública Viva
             │       └── Si la red falla o timeout: ABORTA (Fail-Closed)
             │       └── Si HTTP != 200: ABORTA (Fail-Closed)
             │
             ├──► 4. Validación de 15 Puntos de Control en el HTML
             │       ├── HTML sustancial (>2500 caracteres)
             │       ├── Ausencia de plantilla SPA en blanco (<div id="root"></div>)
             │       ├── Tag <link rel="canonical"> exacto
             │       ├── Tag <h1> con título del artículo
             │       ├── Metatags Open Graph completos (title, description, url, type)
             │       ├── Ausencia de robots noindex
             │       ├── Ausencia de banners o avisos de borrador
             │       ├── CTA hacia contact.orbitalframeworks@gmail.com
             │       ├── Cero números de teléfono o afirmaciones no verificables
             │       ├── Enlaces internos hacia /servicios/ y /casos/
             │       └── Inclusión en sitemap.xml
             │
             └──► 5. Generación de Enlace UTM Sanitizado y Handoff Pack
                     ├── Cero PII en query string (RECHAZADO_POR_POLITICA_PII si existe)
                     ├── Actualización de docs/blog-linkedin-manifest.json
                     └── Generación de docs/linkedin-[slug]-handoff.md con estado aprobado
```

### 3.2 Verificación en Producción Viva (Artículo Piloto)
Ejecución del comando:
```bash
node scripts/blog-linkedin-gate.mjs --force
```

**Resultado Observado en Producción Viva:**
- **URL Objetivo:** `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/`
- **Estado HTTP:** `200 OK` (Cabecera `cf-cache-status: DYNAMIC`, servidor Cloudflare).
- **Tamaño del HTML:** `21,492 caracteres`.
- **H1 Prerenderizado:** `"Software a medida o SaaS: cómo decidir según el proceso de tu empresa"`.
- **Canonical:** `<link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/" />`.
- **Open Graph:** Tipo `article`, descripción presente, URL idéntica a la canonical.
- **Indexabilidad:** Directiva robots indexable (cero `noindex`).
- **Canal de Contacto:** `contact.orbitalframeworks@gmail.com` integrado en enlace compose de Gmail.
- **Veredicto:** **`✅ PASS`** (15/15 comprobaciones superadas).

### 3.3 Suite de Pruebas Unitarias (`tests/blog-linkedin-gate.test.mjs`)
Se crearon 11 pruebas unitarias exhaustivas con cobertura de:
1. Alineación de los 8 temas del backlog y calendario con el artículo piloto.
2. Generación determinista de UTMs y rechazo estricto de PII.
3. Validación positiva del HTML prerenderizado local.
4. Fallo cerrado ante artículos en estado borrador (`DRAFT_NO_PUBLICABLE`) y banners editoriales.
5. Fallo cerrado ante respuestas no 200 (HTTP 404, HTTP 521).
6. Detección de caída a plantilla SPA en blanco sin hidratar.
7. Detección y bloqueo ante directiva `<meta name="robots" content="noindex">`.
8. Detección y bloqueo ante números de teléfono ficticios o promesas de ahorro falsas.
9. Simulación de servidor HTTP local en loopback (éxito, errores 500, timeouts de red y puertos caídos).
10. Preservación del post histórico y bloqueo de publicaciones duplicadas en el manifiesto.
11. Generación del paquete de entrega en Markdown con recordatorio de autoposting deshabilitado.

---

## 4. Estado de Publicación: Diferenciación de Niveles

Para máxima claridad operativa, se define el estado de cada componente del sistema:

| Componente | Nivel de Estado | Definición Operativa |
| :--- | :---: | :--- |
| **Artículo Piloto en Blog Web** | **`LIVE`** | Desplegado en producción pública, sirviendo HTML prerenderizado con HTTP 200 en `https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/`. |
| **Paquete de Entrega LinkedIn** | **`READY_FOR_RELEASE`** | Paquete técnico validado al 100% por el preflight gate (`docs/linkedin-pilot-handoff-2026-10-17.md`). Listo para ser copiado y publicado manualmente por el operador. |
| **Temas B2B-02 a B2B-08** | **`DRAFT_PENDING`** | Definidos en el backlog editorial bajo estado `DRAFT_NO_PUBLICABLE`. Requieren respuesta de campo del propietario a su pregunta priorizada antes de programar su despliegue. |
| **Post LinkedIn Histórico** | **`IMMUTABLE_PRESERVE`** | Post institucional previo (`urn:li:share:7516883410074836992`) sin enlace. Queda permanentemente protegido contra modificaciones o duplicaciones. |

---

## 5. Procedimiento Ligero de Auditoría Mensual (Cada 30 Días)

Se incorpora al flujo operativo el ciclo mensual de revisión técnica y comercial:
1. **Google Search Console**: Revisar cobertura de indexación en `/blog/` y `/servicios/`, y consultas comerciales de tomadores de decisión en Perú.
2. **Inspección Visual y UX**: Comprobación en dispositivos móviles reales (320px, 390px) y escritorio (1440px) de contrastes y proporciones de imágenes.
3. **Conversión y Telemetría GA4**: Evaluar ratios `article_to_service` y `article_to_contact`. Cotejar el número de eventos de intención contra los correos reales recibidos en `contact.orbitalframeworks@gmail.com`.

---

## 6. Comandos Exactos de Reproducción y Validación

Todos los comandos fueron ejecutados en el entorno de pruebas con salida satisfactoria:

```bash
# 1. Linting estricto (0 errores, 0 advertencias)
npm run lint

# 2. Comprobación de tipos TypeScript (cero errores)
npm run typecheck

# 3. Compilación de producción (SSR Prerender + Optimización WebP)
npm run build

# 4. Suite completa de pruebas automatizadas (61 tests superados, 0 fallos)
npm test

# 5. Ejecución del Preflight Gate contra la URL pública en vivo
node scripts/blog-linkedin-gate.mjs --force
```

### Resumen de Pruebas:
- **Total de pruebas ejecutadas:** 61 pruebas.
- **Pruebas superadas:** 61 (100%).
- **Pruebas fallidas:** 0.
- **Suites:** 6 archivos de test (`tests/*.test.mjs`).
- **Linter y compilador TS:** Limpios sin excepciones.

---

## 7. Cumplimiento de Guardrails

- **Cero Alucinaciones:** No se incorporaron testimonios ficticios, clientes no autorizados, métricas comerciales infladas ni afirmaciones no respaldadas.
- **Canales Oficiales:** Todos los flujos de contacto respetan `contact.orbitalframeworks@gmail.com`.
- **Seguridad y Desacoplamiento:** Prohibida la inclusión de tokens de redes sociales; el preflight gate es 100% seguro para ejecución en CI/CD o entornos locales.
- **Preservación del Repositorio:** Todos los archivos preexistentes no relacionados fueron estrictamente respetados.
