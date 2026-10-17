# Pack de Publicación LinkedIn — Piloto Orbital Insights

Fecha: 2026-10-17
Canal objetivo: LinkedIn Orgánico (Proyecto externo desacoplado)
Estado editorial: artículo piloto informativo revisado para publicación; este texto de LinkedIn es una propuesta para el flujo externo y no se ha publicado automáticamente.

---

## 1. URL de Campaña con UTM Pasivo

```
https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom
```

### Parámetros UTM:
- `utm_source`: `linkedin`
- `utm_medium`: `organic_social`
- `utm_campaign`: `pilot_saas_vs_custom`

---

## 2. Variante Corta de Contenido (Texto de Publicación)

```text
Adoptar un SaaS comercial no siempre es la solución definitiva, pero construir software a medida tampoco debe ser el primer impulso.

En Orbital Frameworks evaluamos cuándo conviene cada alternativa según la madurez del proceso operativo:

1. Si una herramienta comercial estándar cubre los requisitos esenciales y se integra sin fricciones importantes, evalúa primero esa alternativa.
2. Si el proceso clave de tu empresa te obliga a deformar tu flujo de trabajo o el costo recurrente por usuario en dólares limita tu escala, un desarrollo a medida brinda trazabilidad y control.

Desglosamos la matriz de decisión y los puntos de evaluación operativa en nuestro nuevo artículo de Orbital Insights:
https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom
```

---

## 3. Instrucciones de Integración Interoperable

1. **Desacoplamiento total**: Este pack no invoca APIs de LinkedIn, no utiliza tokens ni realiza autoposting. Se entrega como texto plano listo para ser consumido por la sesión externa encargada de redes.
2. **Sin cebo vacío**: El post resume criterios operativos reales y útiles por sí mismos, evitando clickbaits o promesas exageradas de ahorro.
3. **Mejora editorial futura**: El artículo ofrece criterios generales y no afirma resultados propios. Para añadir experiencia de campo verificable y diferenciada, solicitar una respuesta real del equipo a la pregunta:
   > *«¿Qué decisión concreta del equipo de Orbital sobre adaptar un SaaS o desarrollar software propio podemos documentar, y qué evidencia autorizada respalda esa decisión?»*

---

## 4. Medición y Embudo GA4

- **Ruta observada**: `/blog/software-a-medida-o-saas-como-decidir/` con parámetros UTM conservados de forma segura en `page_location`.
- **Métricas de intención**:
  - `article_to_service`: clics desde el artículo hacia servicios (`/servicios/desarrollo-software-medida/`, etc.).
  - `article_to_contact`: clics hacia mailto/Gmail.
  - No se computa como `generate_lead` sin recepción humana confirmada.
- **Límite de medición documentado**: El desfase conocido en GA4 ("0 filas Windsor vs collect HTTP 204") debe considerarse al monitorear la campaña, validando en informes en tiempo real (Realtime) antes de concluir sobre el volumen de tráfico.
