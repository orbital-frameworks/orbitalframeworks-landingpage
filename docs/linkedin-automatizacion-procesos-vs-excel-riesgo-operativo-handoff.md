# Pack de Publicación LinkedIn — Orbital Insights

**Documento:** `docs/linkedin-automatizacion-procesos-vs-excel-riesgo-operativo-handoff.md`
**Fecha de Verificación Gate:** 2026-10-18
**Canal Objetivo:** LinkedIn Orgánico (Empresa y Socios)
**Estado Editorial del Gate:** `BLOQUEADO_POR_GATE`
**Autopost Automatizado:** DESHABILITADO (Solo revisión humana)
Estado editorial: artículo piloto informativo revisado para publicación; este texto de LinkedIn es una propuesta para el flujo externo y no se ha publicado automáticamente.

---

## 1. URL de Campaña con Parámetros UTM Limpios

```
https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_excel_vs_automation
```

### Parámetros UTM Deterministas:
- `utm_source`: `linkedin`
- `utm_medium`: `organic_social`
- `utm_campaign`: `camp_excel_vs_automation`
- **PII:** CERO parámetros personales (Validado por `sanitizeAndValidateUtmUrl`)

---

## 2. Texto de la Publicación (Copia de Difusión)

```text
Excel puede funcionar muy bien para analizar datos, planificar y controlar operaciones pequeñas. El problema aparece cuando un proceso crítico depende de conciliar versiones, copiar registros o corregir fórmulas manualmente.

Antes de reemplazar una hoja de cálculo, conviene revisar tres señales:

1. ¿El equipo mantiene una fuente única o intercambia copias que luego debe conciliar?
2. ¿Las validaciones y permisos existentes son suficientes para los errores y datos sensibles del proceso?
3. ¿Cada registro debe sincronizarse con ventas, inventario u otros sistemas sin volver a digitarlos?

Excel en Microsoft 365 dispone de coautoría, historial de versiones, protecciones y herramientas de integración. Si eso resuelve el problema, mantenerlo puede ser la decisión correcta. Cuando la operación exige controles transaccionales o integraciones más exigentes, vale la pena evaluar una automatización o un sistema web.

En Orbital Insights explicamos cómo evaluar las alternativas de manera gradual, sin asumir que toda empresa necesita desarrollar software:
https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_excel_vs_automation
```

---

## 3. Contrato de Distribución e Instrucciones para el Operador

1. **Gate Preflight Superado:** Este paquete solo se genera tras verificar HTTP 200, Canonical definitiva, Prerender H1 real, Open Graph tags y sitemap.
2. **Desacoplamiento Absoluto:** Prohibido invocar APIs no autorizadas de LinkedIn o utilizar tokens de sesión automatizados. La publicación es efectuada manualmente por el operador autorizado o sesión social dedicada.
3. **Ventana Recomendada:** Publicar con un margen de **2 a 4 horas posteriores al despliegue** (o al día siguiente) para permitir que los crawlers de LinkedIn generen la previsualización del Open Graph (`og:image`, `og:title`) desde caché perimetral sin timeouts.
4. **Respeto a Publicaciones Históricas:** La publicación histórica institucional `urn:li:share:7516883410074836992` permanece intacta y no se altera ni duplica.

---

## 4. Medición GA4 y Embudo de Conversión

- **Página de Entrada:** `/blog/automatizacion-procesos-vs-excel-riesgo-operativo/` conservando los parámetros UTM en `page_location`.
- **Consentimiento:** Google Consent Mode v2 activo; no se escriben cookies de rastreo sin aceptación explícita.
- **Eventos de Intención Calificados:**
  - `article_intent` (`intent_type: "article_to_service"`) al hacer clic hacia servicios comerciales.
  - `article_intent` (`intent_type: "article_to_contact"`) al hacer clic en el CTA de correo.
  - `contact_intent` emitido en aperturas de Gmail compose o copia de correo al portapapeles.
- **Prohibición de Falso Lead:** Cero disparo de `generate_lead` en el navegador. La única evidencia de lead calificado es el correo recibido en `contact.orbitalframeworks@gmail.com`.
