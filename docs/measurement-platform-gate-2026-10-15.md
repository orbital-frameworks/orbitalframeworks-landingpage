# Medición y Plataformas — 15 de octubre de 2026

## 1. Estado Observado y Verificación de Plataformas

### 1.1 Google Search Console (GSC)
- **Propiedad verificada**: Dominio `https://orbitalframeworks.qzz.io/`.
- **Token de verificación verificado**: `public/google466769daa2952733.html` con contenido canónico exacto:
  ```html
  google-site-verification: google466769daa2952733.html
  ```
- **Integración de Sitemap**: El archivo `public/sitemap.xml` declara las 9 rutas canónicas verificadas del sitio:
  1. `/` (Prioridad 1.0, actualización semanal)
  2. `/privacy` (Prioridad 0.8)
  3. `/terms` (Prioridad 0.7)
  4. `/sobre-orbital-frameworks/` (Prioridad 0.9)
  5. `/evidencia/` (Prioridad 0.8)
  6. `/casos/checkio/` (Prioridad 0.8)
  7. `/casos/veterp/` (Prioridad 0.8)
  8. `/casos/localisa/` (Prioridad 0.8)
  9. `/casos/perulog-pallets/` (Prioridad 0.8)
- **Directivas de rastreo**: `public/robots.txt` autoriza a todos los agentes de búsqueda generales (`User-agent: *`) y bots de búsqueda de IA (`User-agent: OAI-SearchBot`), enlazando formalmente el sitemap:
  ```text
  User-agent: *
  Allow: /

  User-agent: OAI-SearchBot
  Allow: /

  Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml
  ```
- **Ausencia de scripts duplicados**: `index.html` no contiene scripts embebidos de verificación ni etiquetas redundantes de rastreo.

---

## 2. Arquitectura de Medición y Privacidad (GA4 + Consent Mode v2)

### 2.1 Principios de Privacidad y Gating
- **Aislamiento de Entorno**: La carga de GA4 está desacoplada de la compilación y controlada por la variable de entorno `VITE_GA_MEASUREMENT_ID`. Si la variable no está definida, no se descarga ningún script de Google ni se configuran cookies.
- **Google Consent Mode v2**:
  - Antes de cualquier carga o decisión del usuario, se establece el estado de consentimiento estricto por defecto:
    ```js
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    ```
  - Parámetros de privacidad activos:
    ```js
    gtag('set', {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      restricted_data_processing: true,
    })
    ```
- **Cero PII (Personally Identifiable Information)**:
  - No se rastrean entradas de texto, nombres, teléfonos ni correos electrónicos ingresados por usuarios (el contacto se realiza vía cliente de correo o copiado al portapapeles).
  - Los eventos transmiten únicamente metadatos agregados de navegación y tipo de interacción.

### 2.2 Prevención de Tags Duplicados y Rutas SPA
- **Desactivación de Page View automático**: En `loadAnalytics()`, la inicialización invoca:
  ```js
  gtag('config', measurementId, { send_page_view: false })
  ```
  Esto previene que la librería gtag emita una página vista genérica no controlada al inyectar el script.
- **Control SPA y Navegación de Historial**:
  - `trackPageView()` emite la página vista con atributos canónicos (`page_location`, `page_path`, `page_title`, `page_referrer`).
  - Se suscribe un listener al evento global `popstate` para registrar cambios de ruta en navegación SPA o uso de botones de navegación atrás/adelante del navegador.

### 2.3 Taxonomía de Eventos y Conversiones Clave
| Evento GA4 | Parámetros | Tipo | Disparador |
| :--- | :--- | :--- | :--- |
| `page_view` | `page_location`, `page_path`, `page_title`, `page_referrer` | Medición de ruta | Carga inicial consentida y transiciones de ruta SPA |
| `generate_lead` | `method: 'gmail'` | **Key Event (Conversión)** | Clic en botón "Escribir por Gmail ↗" |
| `generate_lead` | `method: 'email'` | **Key Event (Conversión)** | Clic en enlaces `mailto:contact.orbitalframeworks@gmail.com` |
| `generate_lead` | `method: 'copy_email'`, `contact_channel: 'clipboard'` | **Key Event (Conversión)** | Clic en botón "Copiar correo" en sección de contacto |
| `view_item` | `item_category: 'case_study'`, `item_location: <pathname>` | Interacción comercial | Clics a casos de estudio (`/casos/*`) o hub de evidencia (`/evidencia/`) |
| `select_content` | `content_type: 'live_product'`, `item_id: <hostname>` | Validación de producto | Clics hacia productos públicos verificables (`.caseProductCta`) |

### 2.4 Experiencia de Usuario y Prevención de Hydration Mismatch
- El componente `src/AnalyticsConsent.tsx` utiliza `useSyncExternalStore` con `getServerSnapshot` retornando `false`, garantizando que el banner no se renderice en el pase de renderizado del servidor (SSR/prerender) y se monte limpiamente tras la hidratación del cliente.
- Evita Cumulative Layout Shift (CLS) y advertencias de desajuste de hidratación en React 19.
- La decisión del usuario se almacena en `localStorage.getItem('orbital-analytics-consent')` (`'granted'` o `'denied'`) para evitar solicitudes redundantes.

---

## 3. Línea Base de Rendimiento y Core Web Vitals (CWV)

### 3.1 Optimizaciones Implementadas en Código
1. **Cumulative Layout Shift (CLS = 0)**:
   - Atributos dimensionales explícitos (`width` y `height`) en todos los elementos de imagen críticos:
     - Logotipo corporativo: `200x20`
     - Vistas previas de proyectos: `640x360`
     - Ilustración Hero / Robot: `600x600`
     - Imagen principal de casos de estudio: `960x540`
   - Regla CSS `aspect-ratio: 16 / 9` en el contenedor `caseHeroMedia img`.
2. **Interaction to Next Paint (INP) & Rendimiento del Hilo Principal**:
   - Suspensión del bucle de animación 3D Canvas en Hero mediante `IntersectionObserver`: cuando el lienzo queda fuera del viewport visible, `requestAnimationFrame` se detiene, liberando el hilo de ejecución para interacciones del usuario.
3. **Accesibilidad y Objetivos Táctiles Móviles**:
   - Dimensiones mínimas de 48x48px en botones de interacción móvil (`navToggle`).
4. **Optimización de Fuentes**:
   - Conexiones previas mediante `<link rel="preconnect">` a `fonts.googleapis.com` y `fonts.gstatic.com` con `font-display: swap`.

### 3.2 Monitoreo Continuo
- Los datos de campo de CrUX (Chrome User Experience Report) requieren una ventana móvil de 28 días con volumen mínimo de visitas en `https://orbitalframeworks.qzz.io/`.
- Las auditorías sintéticas locales mediante `verify-build.mjs` y la batería de pruebas unitarias confirman la ausencia de scripts bloqueantes y un bundle final de cliente inferior a 275 KB (264 KB observado).

---

## 4. Gates de Identidad y Cuentas Externas (`ACCOUNT_ACCESS` / `EXTERNAL_INDEXING`)

Debido a que el entorno de ejecución es hermético y no dispone de credenciales OAuth de Google o Bing ni acceso a red externa, la activación final en plataformas externas requiere los siguientes pasos humanos mínimos:

1. **Google Search Console**:
   - Ingresar a [Google Search Console](https://search.google.com/search-console) con la cuenta administradora de Orbital Frameworks.
   - Confirmar que la propiedad `orbitalframeworks.qzz.io` figure con estado "Verificado" (reconocido por `google466769daa2952733.html`).
   - En la sección **Sitemaps**, enviar la URL `https://orbitalframeworks.qzz.io/sitemap.xml` y confirmar estado "Correcto".
   - Monitorear las métricas de cobertura e indexación orgánica según el ciclo natural de rastreo de Googlebot.

2. **Google Analytics 4 (GA4)**:
   - En la cuenta de Google Analytics, comprobar si existe un flujo web activo para `https://orbitalframeworks.qzz.io/`.
   - Si no existe, crear la propiedad y flujo web bajo estándares de privacidad (desactivar recolección de datos de Google Signals para publicidad y personalización de anuncios).
   - Copiar el `Measurement ID` resultante (`G-XXXXXXXXXX`).
   - En la consola de AWS Amplify Hosting del proyecto, configurar la variable de entorno de compilación `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` y disparar un nuevo despliegue.
   - Realizar una visita de prueba en modo DebugView para verificar los eventos `page_view`, `generate_lead` (`email`, `gmail`, `copy_email`) y `view_item`.

3. **Bing Webmaster Tools**:
   - Ingresar a [Bing Webmaster Tools](https://www.bing.com/webmasters) e importar la propiedad directamente desde Google Search Console. No requiere añadir registros DNS adicionales ni archivos meta en el repositorio.

4. **PageSpeed Insights**:
   - Ejecutar la auditoría pública en [PageSpeed Insights](https://pagespeed.web.dev/) sobre `https://orbitalframeworks.qzz.io/` tanto para móvil como escritorio, registrando la fecha y los puntajes de rendimiento y Core Web Vitals observados.
