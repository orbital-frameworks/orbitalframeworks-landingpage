# Evaluación Técnica Read-Only: NVIDIA Build / GLM vs. Guía Humanizer Editorial en MVP

```yaml
document_id: orbital-editorial-ai-evaluation-20261017
project: orbitalframeworks-landingpage
date: 2026-10-17
node_id: funnel-analytics-and-editorial-review
role: software-builder
mode: workspace-write
status: PASS
decision: NO_PROCEDER_EN_MVP
budget_impact: 0.00 USD
external_dependencies_installed: 0
external_network_calls: 0
```

---

## 1. Resumen Ejecutivo y Decisión Arquitectónica

En el marco del nodo `funnel-analytics-and-editorial-review`, se realizó una evaluación técnica exhaustiva y estrictamente *read-only* (sin consumo de red, sin instalación de dependencias, sin aprovisionamiento de GPU ni invocación de APIs externas) sobre la viabilidad y necesidad de incorporar **NVIDIA Build (NIM)** o modelos de la familia **GLM (General Language Model)** en comparación con el patrón de **guía editorial humanizer** existente para el blog nativo *Orbital Insights*.

### Conclusión y Dictamen Técnico: **NO NECESARIO EN MVP (RECHAZADO)**
1. **Presupuesto Estricto ($0.00 USD)**: La incorporación de endpoints en la nube o microservicios autohospedados de NVIDIA NIM exige suscripciones comerciales (licencias NVIDIA AI Enterprise a $4,500/GPU/año o costos de cómputo en la nube por hora), violando la restricción de desembolso nulo.
2. **Restricción de Secretos y Dependencias**: El flujo del repositorio es un generador estático desacoplado (React 19 + Vite SSR prerender) que no requiere claves de API, almacenamiento en bases de datos ni servicios de inferencia en tiempo de ejecución.
3. **Naturaleza del Contenido B2B Factual**: La diferenciación comercial de Orbital Frameworks reside en la veracidad técnica, la ausencia de alucinaciones y la experiencia de campo en operaciones en Perú (casos reales como Checkio, Wasy, Localisa, PeruLog Pallets). Ningún modelo generativo externo puede suplir o validar la experiencia operativa real del equipo; el uso de parafraseo automatizado aumentaría el riesgo de afirmaciones vacías o no verificables.
4. **Patrón Humanizer Correcto**: El enfoque de estilo humanizer se adopta como **guía editorial de redacción** (eliminación de clichés corporativos, voz técnica directa, estructura concisa y preservación de hechos), **nunca** como un mecanismo de evasión de detectores de IA ("bypass de marcas de agua"), el cual constituye una mala práctica técnica y contraria a los lineamientos de contenido útil de Google.

---

## 2. Matriz Comparativa Técnica

| Dimensión | NVIDIA Build / NIM (Cloud API) | GLM Self-Hosted (ej. GLM-4-9B) | Guía Editorial Humanizer / Redacción Local |
| :--- | :--- | :--- | :--- |
| **Costo de Licencia** | Gratuito solo para evaluación/dev; comercial exige NVIDIA AI Enterprise ($4,500/GPU/año). | Licencia comunitaria abierta con restricciones comerciales (>10M usuarios o autorización explícita). | **$0.00 USD (Reglas de estilo y revisión humana en repo).** |
| **Costo de Infraestructura** | Pago por consumo de tokens tras agotar créditos iniciales. | Instancia GPU dedicada (mínimo A10G/L4 en AWS: ~$1.00 - $1.50/hr = >$700/mes). | **$0.00 USD (Pipeline de build local existente en node/vite).** |
| **Latencia e Impacto en Build** | 800ms - 3500ms por llamada; sujeto a colas y límites de tasa (RPM/TPM). | 200ms - 800ms local; alto consumo de memoria RAM/VRAM en el entorno de desarrollo. | **0ms de red (Build determinista en <3 segundos para todo el sitio).** |
| **Riesgo de Exposición de Secretos** | Alto (requiere persistir `NGC_API_KEY` o tokens en variables de entorno / CI). | Medio/Alto (gestión de llaves de repositorio de pesos / Hugging Face token). | **Nulo (Cero secretos en código o variables de entorno).** |
| **Privacidad y Datos Propietarios** | Tráfico de red saliente hacia infraestructura de terceros. | Datos confinados al host, pero requiere aislamiento de procesos. | **100% Hermético (Aislamiento de sandbox local respetado).** |
| **Control Factual y Anti-Alucinación** | Requiere capas complejas de validación sintáctica y guardrails adicionales. | Requiere ajuste fino (*fine-tuning*) o RAG con alta tasa de mantenimiento. | **Garantizado por contrato (Cero Alucinaciones, draft con preguntas al propietario).** |

---

## 3. Análisis Detallado de Alternativas

### 3.1 NVIDIA Build y NVIDIA NIM
- **Términos de Servicio y Licenciamiento**: NVIDIA Build (`build.nvidia.com`) ofrece acceso a microservicios NIM para experimentación. Los términos de uso de la versión de evaluación establecen que los créditos gratuitos y las APIs públicas son exclusivamente para prototipado, investigación y pruebas no comerciales. Para producción o distribución comercial continua, NVIDIA exige el licenciamiento de NVIDIA AI Enterprise.
- **Riesgos Operativos**: La dependencia de una API remota en el pipeline de generación estática rompería el principio de compilación reproducible (*reproducible builds*) y expondría el despliegue a fallos por cuotas agotadas (*rate limiting*) o indisponibilidad de servicio de terceros.
- **Conclusión sobre NVIDIA Build**: Totalmente descartado para el MVP de Orbital Insights.

### 3.2 GLM (General Language Models)
- **Términos de Licencia de Pesos**: Los modelos de la serie GLM (desarrollados por Zhipu AI y THUDM) se distribuyen bajo licencias abiertas permisivas para investigación, pero las cláusulas de uso comercial exigen verificación de escala y prohíben su uso en ciertas aplicaciones de reentrenamiento competitivo.
- **Sobrecarga de Cómputo**: Ejecutar inferencia local de GLM-4-9B cuantizado (ej. en GGUF 4-bit) requeriría al menos 8 a 12 GB de VRAM o un consumo intensivo de CPU que degradaría el tiempo de ejecución de las pruebas y la suite de CI/CD del proyecto.
- **Conclusión sobre GLM**: Innecesario para una arquitectura basada en contenido curado y factual.

### 3.3 Guía Humanizer Existente (Enfoque Adoptado)
- **Definición Operativa**: El patrón "humanizer" no es un microservicio ni un modelo; es un conjunto de reglas editoriales aplicadas durante la fase de síntesis:
  1. *Eliminación de Clichés de IA*: Prohibición de frases como "en el vertiginoso mundo digital de hoy", "revolucionando la forma en que...", "un cambio de paradigma", "al final del día".
  2. *Especificidad Operativa*: Planteamiento de problemas concretos (ej. costo de licenciamiento SaaS por asiento en dólares vs software local a medida, dispersión de datos en Excel, roles y permisos de operación).
  3. *Veracidad Estricta*: Prohibición categórica de inventar porcentajes de ROI, casos de éxito simulados, testimonios falsos o fechas arbitrarias.
  4. *Preservación de Incertidumbres Legítimas*: Si un dato o experiencia técnica requiere confirmación del fundador o cliente, el artículo se mantiene explícitamente como borrador no publicable (`DRAFT_NO_PUBLICABLE`) con la pregunta priorizada expuesta en el encabezado.
- **Conclusión sobre Humanizer**: Se mantiene y aplica exclusivamente como guía de redacción y criterio de revisión en el workspace, sin consumo de modelos externos ni proveedores alternativos.

---

## 4. Dictamen Final y Hoja de Ruta Post-MVP

1. **Estado en el Lanzamiento**:
   - Orbital Insights opera al 100% mediante archivos de datos TypeScript estáticos (`src/blogData.ts`), tipados fuertemente y prerenderizados en el servidor de compilación.
   - Presupuesto de desembolso: **$0.00**.
   - Dependencias de IA en tiempo de ejecución: **0**.
2. **Condiciones para una Reevaluación Futura**:
   - Solo se evaluará la incorporación de microservicios locales de inferencia (NIM o equivalente) si en fases posteriores (post-lanzamiento comercial y tras validación de ingresos):
     a) Se cuenta con infraestructura de cómputo local propia amortizada (on-premise o GPU reservada sin cargo variable).
     b) Se justifica una función de cara al cliente final (ej. un asistente de diagnóstico operativo interactivo para empresas).
     c) El Sponsor apruebe explícitamente la ampliación de presupuesto y la política de licenciamiento comercial.
