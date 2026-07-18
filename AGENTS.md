# Reglas Locales: Orbital Frameworks

## 1. Identidad del Proyecto
* **Nombre:** Orbital Frameworks.
* **Naturaleza:** Pagina publica / landing corporativa comercial enfocada en la oferta de servicios digitales.
* **Posicionamiento:** Empresa de desarrollo de software y soluciones digitales (Landing pages, sistemas web, apps moviles, automatizaciones).

## 2. Stack Tecnologico Detectado
* **Framework:** React 19 + Vite + TypeScript.
* **UI/Rutas:** Single Page Application (SPA). Todo el contenido principal y las vistas viven en `src/App.tsx`.
* **Estilos:** Custom Vanilla CSS (`App.css`, `index.css`).
* **SEO y Metadata:** Metadatos canonicos, Open Graph, Twitter Cards y bloque JSON-LD estructurado en `index.html`. Archivos estaticos complementarios (`robots.txt`, `sitemap.xml`, `llms.txt`) ubicados en `public/`.
* **Assets/Branding:** Imagenes de casos y logotipos en `src/assets/` y `public/`.

## 3. Reglas Especificas de Contenido y Copy
* **Cero Alucinaciones:** NO inventar clientes, logos, partners, testimonios, metricas, casos de exito ni social proof. Si no existe en el repositorio original, no se publica.
* **Contacto:** Respetar la informacion oficial detectada en el repo, como correo, LinkedIn u otros canales si estan presentes. No inventar telefonos, correos, URLs, redes ni canales no documentados.
* **Placeholders:** Los textos y datos de relleno estan permitidos unicamente si son estrictamente necesarios para una maqueta visual y estan marcados explicitamente como `[PLACEHOLDER]`.
* **Claridad Comercial:** Mantener el copy publico claro, directo y verificable. Evitar promesas absolutas, garantismos vacios o lenguaje de ventas excesivamente inflado ("el mejor del mundo", "crecimiento garantizado 1000x").
* **Branding:** No cambiar la paleta de colores, el logotipo ni la identidad visual del sitio (tonos oscuros, glassmorphism, tipografia mono/sans de IBM Plex) sin instruccion explicita.
* **Archivos Intocables:** Los archivos marcados como no trackeados (ej. scripts de auditoria locales) son intocables salvo instruccion explicita.

## 4. Reglas de SEO
* Revisar siempre la integridad de `title`, `meta description`, `canonical`, `Open Graph` y `Twitter cards` antes de alterar el `index.html`.
* Mantener la jerarquia semantica de headings (`<h1>` para el Hero, `<h2>` para secciones principales, `<h3>` para tarjetas de servicio o proyectos).
* Conservar los archivos `robots.txt` y `sitemap.xml`. Actualizar `<lastmod>` en el sitemap si ocurren cambios masivos de contenido.
* Garantizar que las imagenes importantes tengan `alt` text descriptivo para accesibilidad e indexabilidad.
* **Structured Data:** Mantener el JSON-LD en `index.html` limitado a datos de la `Organization` y los `Service`s reales y verificables. Si el JSON-LD declara servicios, esos servicios deben existir en el contenido visible y ser verificables. No declarar servicios, areas, clientes o claims que no aparezcan o no esten respaldados.
* **White-Hat:** Cero keyword stuffing. Promover legibilidad humana por encima de densidad de palabras clave.

## 5. Protocolo de Validacion
Cualquier cambio propuesto que sea aprobado debe pasar por el siguiente flujo de QA tecnico:
1. **Linting:** Ejecutar `npm run lint`. No deben existir advertencias de ESLint en React/Hooks.
2. **Typechecking y Build:** Ejecutar `npm run build` (dispara `tsc -b && vite build`) para asegurar que TS no esta roto y que Vite resuelve correctamente los assets estaticos.
3. **Visual QA:** Validar responsividad, contrastes y renderizado del DOM usando Playwright localmente o abriendo la pagina de desarrollo, si hay un cambio estructural en el HTML/CSS.
4. **Validacion SEO:** Comprobar el `<head>` del HTML compilado resultante.

## 6. Skills Permitidas (A discrecion)
* `seo-audit`: Para auditoria de metadata, contenido publico, indexabilidad y structured data.
* `project-analyzer`: Para reconocimiento estructural.
* `ui-ux-pro-max`, `impeccable`, `taste-skill`: Aplicar **solo** en contextos de diseno y pulido de CSS/Layout, sin redisenar la marca desde cero.
* `plankton-code-quality`: Para limpieza sintactica de componentes pesados en React.
* `security-review`: Unicamente si a futuro se habilitan endpoints API, auth, pagos o captura activa de formularios mas alla de un simple `mailto:`.
