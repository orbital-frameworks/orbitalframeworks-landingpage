# Método de producción de carruseles para Orbital Frameworks

**Estado:** operativo desde el carrusel B2B-03 V4 aprobado el 21/10/2026.
**Propietario:** Orbital Frameworks / Content Factory y distribución de Orbital Landing.
**Documentos relacionados:** `AGENTS.md`, `docs/BLOG_TO_LINKEDIN_OPERATING_SYSTEM.md` (§2.3), `docs/BLOG_LINKEDIN_OPERATOR_GUIDE.md` y el caso `docs/social/b2b03/v4/`.

## Objetivo y principio

Producir piezas visuales **editorialmente interesantes, fieles a la marca, legibles en el feed y realmente publicables**, con el mismo nivel de atención y verificabilidad que B2B-03 V4. Reutilizar la **metodología y los controles**, no la composición, la distribución de colores ni los titulares como plantilla de cinco páginas. Un carrusel no debe ser texto dividido en láminas.

El criterio principal es: **cada página debe añadir una razón para seguir leyendo o una explicación que sería peor como párrafo.** Si una imagen no ilustra, demuestra o organiza una idea mejor que el texto, replantear la escena.

## Flujo de trabajo replicable

### 1. Definir problema, audiencia y tensión narrativa

- Identificar una decisión concreta del lector, su contexto, qué puede confundirse y qué podrá hacer al terminar.
- Validar hechos y claims con la fuente propietaria del artículo; no inventar clientes, tasas de conversión, testimonios o capturas reales.
- Explorar varios *hooks* con formulaciones distintas. El primero no tiene que repetir el título SEO del blog. Elegir una pregunta/observación que importe al lector y evitar el sensacionalismo gratuito.
- Diseñar un recorrido visual: apertura con curiosidad → caso/idea A → caso/idea B → contraste o síntesis → criterio accionable y CTA. Cinco diapositivas fueron apropiadas para B2B-03, **no son una cantidad obligatoria**.
- Escribir una frase dominante y un mensaje secundario corto por lámina; decidir qué debe reconocer alguien que scrollea rápido sin pulsar «ver más».

**B2B-03:** el artículo SEO se titula «Landing page B2B o web corporativa: cuál necesita realmente tu empresa»; la portada visual aprobada pregunta «Tu web se ve bien. ¿Y después?». Las páginas 2–4 explican enfoque, exploración y convivencia con diagramas distintos; la quinta entrega tres preguntas útiles.

### 2. Recuperar identidad auténtica (nunca recrearla)

- Leer branding del proyecto y la fuente de marca en Content Factory **en modo lectura** antes de diseñar. Para Orbital, usar el logo verdadero de `src/assets/Orbital Frameworks (1).png` y el símbolo de `public/Logo_favicon.png`.
- **Orbi:** el paquete canónico está en `/srv/orbital/workspaces/Content-Factory/projects/orbital-frameworks/brand/mascot/exports/`; en B2B-03 se usaron `03_thinking.png` y `10_pointing.png`. Se reutilizaron tal cual, sin redibujar una “mascota parecida”.
- Inspeccionar el canal alfa real de los PNG antes de montar: en V4 ambos tienen esquina alfa 0 y ~79 % de píxeles transparentes. **No poner a Orbi en un círculo de relleno** ni agregar un panel que lo haga parecer una pegatina.
- Tipografías aprobadas ubicadas en `public/fonts/`: Big Shoulders Display para titulares; IBM Plex Sans para explicaciones; IBM Plex Mono **solo** para metadatos/paginación. No multiplicar familias, tamaños y estilos sin una razón funcional.
- Respetar proporciones del logo; en fondos claros es válido un rótulo tipográfico de marca discreto si no se necesita el logo, pero **no reconstruir el símbolo con caracteres <, /, >**.
- Colores: el onyx/marfil, el cian funcional y el rojo de contraste sirvieron para B2B-03. **No se exige repetir esta paleta exacta en cada creatividad**; conservar identidad, legibilidad y coherencia sin estética genérica/neón.

### 3. Diseñar un *storyboard* de composiciones diferentes

- Para cada lámina especificar: una idea, recurso visual elegido, jerarquía, frase principal y transición lógica a la siguiente.
- Alternar recursos con propósito: escena/concepto, mini navegador ilustrativo, diagrama de información, conexión entre sistemas y checklist. **No** repetir cinco veces «logo arriba, titular, línea roja y texto».
- Decidir qué aparece primero en el feed móvil. La legibilidad del titular a tamaño pequeño pesa más que la cantidad de detalles.
- Evitar elementos secundarios ilegibles (“nota” de 16 px en un lienzo 1080), advertencias técnicas dentro del arte y espacios decorativos sin función.
- Mantener las referencias y disclaimers técnicos en el *brief* salvo que sean legal/editorialmente indispensables en la pieza. Los *mockups* deben ser inequívocamente conceptuales, nunca hacer pasar un diseño inventado por capturas del cliente.
- Orbi aporta énfasis/explicación en páginas concretas; no convertirlo en sello decorativo repetido indiscriminadamente.

### 4. Construir desde código en la VPS y conservar fuentes

**Flujo técnico demostrado en B2B-03:**

1. Partir del repositorio dueño `/srv/orbital/workspaces/orbitalframeworks-landingpage` y revisar estado Git/AGENTS.md; no tocar recursos de otro proyecto.
2. Crear directorio versionado de campaña `docs/social/<id>/vN/` con `source.html` HTML/CSS y `assets/` con copias exactas de recursos de marca. **No usar el generador de imágenes de ChatGPT como artefacto final**.
3. Generar/renderizar con Chrome + Playwright local. La implementación **de referencia**, no plantilla cerrada, es `scripts/render-b2b03-carousel-v4.mjs`. Ejecución desde la raíz: `node scripts/render-b2b03-carousel-v4.mjs`.
4. Exportar PNG individuales (lienzo B2B-03: **1080 × 1350**), PDF de varias páginas, previews de feed móvil/escritorio y manifiesto de hash/origen/pruebas.
5. La misma salida versionada será la que se envíe a Telegram **y luego** se adjunte a LinkedIn. Evitar regeneraciones divergentes, descargas manuales del chat y sustituir archivos después de aprobación.
6. Conservar el código fuente y los links a assets canónicos para reproducibilidad. Las tipografías se reobtienen de `public/fonts/`; **no distribuir fuentes empaquetadas por chat**.

Cuando se usen imágenes/escenas adicionales, podrán proceder de recursos locales aprobados, composición SVG/HTML/Canvas o servicios de generación habilitados, pero su uso debe estar autorizado por la tarea, guardado en la VPS, inspeccionado y licenciado. No instalar herramientas persistentes ni consumir servicios externos solo por decoración.

### 5. QA de diseño y geometría (sin falsos PASS)

- **Evidencia visual:** inspeccionar todas las láminas renderizadas a tamaño real y también reducidas como en feed; verificar contraste, recortes, peso visual, jerarquía, ritmo, espacio negativo y lectura inicial.
- **QA mecánico:** contar páginas, medir ancho/alto, comprobar fuentes/archivos, que no haya desbordes DOM, imágenes rotas, pérdida de transparencia o deformación del logo; validar SHA-256 y procedencia.
- **Diagramas:** medir uniones geométricas reales, no declarar conectado por coincidir la intención del CSS. En árbol/flujo, verificar que la barra horizontal toque las líneas verticales y que el origen/centro de cada conexión esté en el destino correcto. Un `display:grid` correcto **no implica** un diagrama conectado.
- **Caso de fallo V3 → V4:** `.s3 .tree` tenía `height:101px` pero su barra horizontal estaba en `top:49px`; `.s3 .nodes` comenzaba al final del árbol. Resultado: **52 px de separación**. V4 cambió altura a **49 px**. El manifiesto mide `horizontalY === nodeTops[0]` (diferencia 0 px), extremos horizontales con error ~0,016 px, raíz/centro alineados; comprobar el PNG para no confiar exclusivamente en coordenadas.
- **Regresiones acotadas:** comparar SHA-256 de láminas no tocadas; en B2B-03, de V3 a V4 las páginas **1, 2, 4 y 5 son idénticas**. Si una corrección localizada altera otras páginas, revisar el diff/regen.
- **QA editorial:** una sola idea clara por lámina, sin texto sobrante, sin equivalencias incorrectas ni estadísticas/promesas no verificadas.
- **QA técnico del repositorio:** `node --check scripts/render-<campaña>.mjs`, `npm run lint`, `git diff --check`; ejecutar build/tests pertinentes cuando se toque la web, no confundir lint con la calidad visual.

### 6. Previsualizar, entregar y aprobar

- Entregar por **Telegram del propietario** las PNG en orden, un PDF multipágina y dos previews de feed, más ZIP del código y recursos no restringidos. Telegram debe devolver recibos reales de mensajes; no afirmar entrega por crear el archivo.
- Identificar los previews como **simulaciones**, no como capturas reales de LinkedIn.
- Pedir aprobación **del artefacto exacto**, no solo del concepto. Registrar estado, versión, fecha y hash del PDF final aprobado.
- Si el usuario objeta una página, **editar la composición localizada en código** y comparar los hashes de las páginas restantes. Conservar la versión anterior como evidencia, sin publicarla.
- Nunca tratar “subí el PDF a Telegram” como “publicación de LinkedIn”.

### 7. Distribución de blog → LinkedIn

- Blog: mantener `DRAFT_NO_PUBLICABLE` hasta la ventana aprobada; al publicar activar ruta, prerender, metadatos, fecha, sitemap y RSS; validar CI, SHA remoto y **URL del dominio oficial** con preflight público (HTTP 200, H1, canonical, OG, CTA, noindex ausente).
- LinkedIn: usar **página empresarial correcta**, copy y UTM del *brief*, PDF **realmente adjunto como documento**. Antes de pulsar «Publicar», verificar que el compositor muestra medio y titular/preview correctos.
- El script heredado `scripts/linkedin-company-publisher.mjs` está orientado a **texto+enlace**, no garantiza subir PDF. No degradar a texto solo, no marcar PASS por gate web ni prometer que una carga no verificada funciona.
- Reconciliar duplicados y journals privados antes de un clic. Si la confirmación es ambigua, **no repetir**. Reunir permalink/URN real y comprobar que el documento se ve en el post publicado.
- Registrar entrega real de ambas URLs por Telegram y estado verificable. Los horarios son por campaña; en B2B-03: **22/10/2026 07:00 blog y 09:00 LinkedIn, America/Lima**.

## Caso de referencia: de V1 a V4

| Versión | Fallo principal | Aprendizaje |
|---|---|---|
| V1 | Plantilla repetitiva de texto, logo reconstruido con caracteres, gancho genérico | Identidad auténtica + concepto visual antes de render |
| V2 | Exceso de jerarquías; Orbi en círculos rellenos, mapa desconectado, notas superfluas | Reducir ruido; respetar transparencia; validar diagramas |
| V3 | Diseño aceptable salvo hueco de 52 px en el árbol de la página 3 | Los diagramas requieren QA geométrico y visual, no solo render PASS |
| **V4** | **Corregido y aprobado por el propietario 21/10/2026** | Mantener fuentes, manifest, comparaciones por hash, Telegram y gates externos separados |

**Fuentes de evidencia:** `docs/social/b2b03/v4/REVIEW_AND_QA.md`, `render-manifest.json`, `telegram-delivery.json`, `source.html`, `scripts/render-b2b03-carousel-v4.mjs`, commits `eace192` (V2), `76cc34f` (V3), `17b6958` (V4). La aprobación es la instrucción explícita del propietario en el chat del 21/10/2026; no implica todavía despliegue ni post publicado.

## Resultado aceptable en futuras campañas

Un carrusel se declara **APROBABLE** solo si: contenido útil y propio, recursos oficiales, variedad de composiciones, primer impacto móvil claro, zero artefactos visuales defectuosos, pruebas + inspección humana, fuente reutilizable, hashes/versión y preview entregado. La decisión creativa se renueva en cada campaña: **el método se reutiliza; el diseño no se copia automáticamente**.
