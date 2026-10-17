# Pack de Publicación LinkedIn — Orbital Insights

**Documento:** `docs/linkedin-pilot-handoff-2026-10-17.md`
**Fecha de Verificación Gate:** 2026-10-17
**Canal Objetivo:** LinkedIn Orgánico (Empresa y Socios)
**Estado Editorial del Gate:** `LISTO_PARA_DISTRIBUCION_EXTERNA`
**Autopost Automatizado:** DESHABILITADO (Solo revisión humana)
Estado editorial: artículo piloto informativo revisado para publicación; este texto de LinkedIn es una propuesta para el flujo externo y no se ha publicado automáticamente.

---

## 1. URL de Campaña con Parámetros UTM Limpios

```
https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom
```

### Parámetros UTM Deterministas:
- `utm_source`: `linkedin`
- `utm_medium`: `organic_social`
- `utm_campaign`: `pilot_saas_vs_custom`
- **PII:** CERO parámetros personales (Validado por `sanitizeAndValidateUtmUrl`)

---

## 2. Texto de la Publicación (Copia de Difusión)

```text
Adoptar un SaaS comercial no siempre es la solución definitiva, pero construir software a medida tampoco debe ser el primer impulso.

En Orbital Frameworks evaluamos cuándo conviene cada alternativa según la madurez del proceso operativo:

1. Si una herramienta comercial estándar cubre los requisitos esenciales y se integra sin fricciones importantes, evalúa primero esa alternativa.
2. Si el proceso clave de tu empresa te obliga a deformar tu flujo de trabajo o el costo recurrente por usuario en dólares limita tu escala, un desarrollo a medida brinda trazabilidad y control.

Desglosamos la matriz de decisión y los puntos de evaluación operativa en nuestro nuevo artículo de Orbital Insights:
https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom
```

---

## 3. Contrato de Distribución e Instrucciones para el Operador

1. **Gate Preflight Superado:** Este paquete solo se genera tras verificar HTTP 200, Canonical definitiva, Prerender H1 real, Open Graph tags y sitemap.
2. **Desacoplamiento Absoluto:** Prohibido invocar APIs no autorizadas de LinkedIn o utilizar tokens de sesión automatizados. La publicación es efectuada manualmente por el operador autorizado o sesión social dedicada.
3. **Ventana Recomendada:** Publicar con un margen de **2 a 4 horas posteriores al despliegue** (o al día siguiente) para permitir que los crawlers de LinkedIn generen la previsualización del Open Graph (`og:image`, `og:title`) desde caché perimetral sin timeouts.
4. **Respeto a Publicaciones Históricas:** La publicación histórica institucional `urn:li:share:7516883410074836992` permanece intacta y no se altera ni duplica.

---

## 4. Medición GA4 y Embudo de Conversión

- **Página de Entrada:** `/blog/software-a-medida-o-saas-como-decidir/` conservando los parámetros UTM en `page_location`.
- **Consentimiento:** Google Consent Mode v2 activo; no se escriben cookies de rastreo sin aceptación explícita.
- **Eventos de Intención Calificados:**
  - `article_intent` (`intent_type: "article_to_service"`) al hacer clic hacia servicios comerciales.
  - `article_intent` (`intent_type: "article_to_contact"`) al hacer clic en el CTA de correo.
  - `contact_intent` emitido en aperturas de Gmail compose o copia de correo al portapapeles.
- **Prohibición de Falso Lead:** Cero disparo de `generate_lead` en el navegador. La única evidencia de lead calificado es el correo recibido en `contact.orbitalframeworks@gmail.com`.
