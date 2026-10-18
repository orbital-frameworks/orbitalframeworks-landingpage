# Publicador empresarial de LinkedIn — Orbital Insights

**Estado:** Integración de sesión y compositor verificada. No se ha enviado una publicación nueva mediante este comando.
**Propietario:** Orbital Landing; la web y el artículo aprobado son la fuente, LinkedIn es únicamente el canal de distribución.
**Comando:** `scripts/linkedin-company-publisher.mjs`.
**Requisito:** ejecutar desde la cuenta privada de la VPS con sesión empresarial ya autenticada en Chrome.

## Contrato de funcionamiento

1. El artículo debe existir en el blog como `PUBLISHED`, figurar en el manifiesto como `LISTO_PARA_DISTRIBUCION_EXTERNA` y pasar la **verificación HTTP pública en ese momento**: canonical, prerender, OG, indexabilidad, CTA y sitemap.
2. El contenido de la única sección ```text del pack debe incluir **exactamente una URL**, idéntica a la UTM emitida por el gate. No se modifica el texto ni se añaden hashtags automáticamente después de aprobarlo.
   Para temas posteriores al piloto no se reutiliza el texto genérico de SaaS: se exige copy editorial propio. Se puede redactar en un archivo UTF-8 con el marcador `{{UTM_URL}}` y generar el pack mediante `node scripts/blog-linkedin-gate.mjs --slug SLUG --copy-file RUTA_DEL_COPY`; el gate reemplaza el marcador por la UTM calculada y conserva la verificación del artículo público.
3. La ejecución `--preview` devuelve su digest SHA-256; la ejecución `--publish` exige **ese digest aprobado exactamente**, junto al slug. La aprobación de una pieza nunca autoriza otras piezas, campañas o calendarios.
4. La sesión de Chrome se utiliza mediante la interfaz corporativa de LinkedIn (sin cookies, contraseñas ni API tokens copiados a este repositorio). Se valida el identificador de empresa **134014070** y el nombre **Orbital Frameworks**, tanto en el panel como en el compositor.
5. Se inspeccionan publicaciones recientes antes de enviar; no se envía si el manifiesto o la página muestran una distribución equivalente. Justo antes del clic se crea un journal privado `SUBMISSION_PENDING`, que **bloquea cualquier nuevo intento** en caso de caída del navegador/red. Si el envío confirma su URL pública, el manifiesto pasa a `DISTRIBUTED` con su URN, URL, fecha y hash de contenido.
6. Cualquier fallo posterior al clic deja una situación **incierta**: consultar la página real y reconciliar el journal manualmente antes de un nuevo envío; nunca reintentar a ciegas.
7. No hay publicación recurrente automática ni servicio permanente: el comando es invocado únicamente tras la aprobación editorial de una pieza. El marcado histórico del primer post sobre SaaS permanece intocable.

## Comandos (desde la raíz del repositorio en VPS)

```bash
# Sólo verifica la sesión corporativa. No modifica publicaciones:
node scripts/linkedin-company-publisher.mjs --probe

# Verifica artículo público y produce hash del copy a aprobar. No abre LinkedIn:
node scripts/linkedin-company-publisher.mjs --preview --slug NOMBRE-DEL-ARTICULO

# Comprueba el compositor con el texto exacto, sin hacer clic en Publicar:
node scripts/linkedin-company-publisher.mjs --composer-check --slug NOMBRE-DEL-ARTICULO

# Solo DESPUÉS de aprobación explícita del copy exacto:
node scripts/linkedin-company-publisher.mjs --publish --slug NOMBRE-DEL-ARTICULO --approve-sha256 DIGEST_DEL_PREVIEW
```

El artículo piloto `software-a-medida-o-saas-como-decidir` ya tiene una publicación histórica sin enlace. El comando **bloquea expresamente** su distribución por defecto. Una nueva pieza sobre el mismo asunto necesitaría aprobación independiente de seguimiento con `--allow-historic-followup`, texto distinto y digest correspondiente. No es necesario utilizarlo para la prueba ni para iniciar el siguiente ciclo editorial.

## Dependencias y seguridad

- No se instalaron paquetes ni servicios nuevos. Se utiliza Playwright desde una instalación existente; se puede resolver una instalación aprobada mediante `ORBITAL_LINKEDIN_PLAYWRIGHT_ROOT`. Actualmente la VPS dispone de una en el entorno compartido de Content Factory, pero no depende de sus datos editoriales.
- El perfil Chrome y el journal residen en `/srv/orbital/runtimes/private/linkedin-company-admin-browser/` y **no** deben publicarse ni copiarse al repositorio. La carpeta del journal requiere permisos privados y no contiene cookies ni credenciales.
- El comando por defecto es `preview`; sin `--publish` + digest correcto nunca pulsa el botón «Publicar».
- La interfaz web de LinkedIn puede cambiar o imponer controles de cuenta. En esos casos el comando debe bloquearse, no eludir desafíos de seguridad ni copiar credenciales.
- Si el manifiesto está marcado como `DISTRIBUTED`, o existe un journal previo, no lanzar un segundo envío. Primero validar el enlace y reconciliar el registro.
- Una aprobación editorial no es garantía de alcance comercial. Las métricas de tráfico se atribuyen mediante UTM y GA4 con consentimiento; los leads se verifican por solicitudes reales, no por clics.

## Estado de validación

- `--probe`: sesión de administración empresarial real confirmada.
- `--preview`: URL pública verificada, UTM y SHA-256 generados.
- `--composer-check`: contenido exacto en compositor de Orbital; botón habilitado sin envío.
- Pruebas unitarias de hash, aprobación, duplicados y recibo local: incluidas en `tests/linkedin-company-publisher.test.mjs`.
- **Publicación nueva real:** pendiente de aprobar un artículo y su correspondiente copy nuevo. No se ha probado con un nuevo clic irreversible.
