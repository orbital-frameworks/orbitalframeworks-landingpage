# Social Release (owner) — calendario durable e idempotencia

## Objetivo y responsabilidad

El scheduler crítico no vuelve a ser una tarea de ChatGPT que abre una conversación nueva. El timer independiente del usuario `orbital-private`, `orbital-social-release.timer`, evalúa cada minuto solo las campañas **explícitamente aprobadas** depositadas en su cola privada. ChatGPT prepara, investiga y revisa; **no** es dueño de la ejecución a la hora programada.

El servicio usa `systemd --user` con `loginctl Linger=yes` verificado para `orbital-private`. Opera bajo `NoNewPrivileges=yes`, ejecuta dependencias Playwright copiadas a una ruta privada no modificable por Team y reutiliza únicamente la sesión LinkedIn de empresa ya autorizada. El navegador se verificó desde un **servicio transitorio con las mismas restricciones**, en modo solo lectura (HTTP 200, empresa correcta, sin clic de publicación).

**NO** se incorpora una campaña a la cola por publicar un artículo, por generarse un PDF ni porque un agente pida una campaña: debe existir autorización humana del copy+PDF exactos y una ventana horaria autorizada. No está permitida una cola de publicaciones periódicas genéricas. El 22/10/2026 B2B-03 quedó `DISTRIBUTED`, por lo que no se debe crear un job que la vuelva a publicar.

## Ubicaciones y aislamiento

- Fuentes y pruebas: `scripts/social-release-*.mjs`, `tests/social-release-core.test.mjs`.
- Unit files versionados: `deploy/social-release/orbital-social-release.{service,timer}`.
- Installer (owner): `bash deploy/social-release/install-owner.sh`.
- Runtime **privado owner-only**: `/srv/orbital/runtimes/private/social-release/`.
- Copia ejecutable, aislada del código editable por Team: `bin/*.mjs`, `src/blogData.ts` y `node_modules/{playwright,playwright-core}`; privilegios `0700`. El gate editorial publicado es el mismo de **15 comprobaciones**, no una heurística alternativa.
- Cola `queue/<slug>.json`, estados `state/<slug>.json` y lock global `.runner.lock`.
- Journal previo al clic: `/srv/orbital/runtimes/private/linkedin-company-admin-browser/publication-journal/<slug>.json`.
- Relay: secreto de `/srv/orbital/secrets/private/orbital-relay.env` leído únicamente en subproceso de envío de Telegram. El navegador nunca recibe esos secretos.

No editar el código privado como bypass de aprobación; modificar fuente versionada, revisar diff+QA y actualizar snapshot mediante instalador **fuera de la ventana de publicación**.

## Contrato de campaña, ejemplo NO ejecutable

Guardar una campaña nueva `queue/<slug>.json` únicamente después de confirmar la autorización humana y el dominio del artículo. No encolar este ejemplo:

```json
{
  "schema": "orbital.social-release.v1",
  "slug": "slug-articulo-aprobado",
  "companyId": "134014070",
  "approval": { "explicit": true, "reference": "docs/social/nueva-campana/aprobacion.md" },
  "campaign": "camp_nueva_campana",
  "scheduledAt": "2026-11-02T15:00:00Z",
  "expiresAt": "2026-11-02T16:00:00Z",
  "canonicalUrl": "https://orbitalframeworks.qzz.io/blog/slug-articulo-aprobado/",
  "utmUrl": "https://orbitalframeworks.qzz.io/blog/slug-articulo-aprobado/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_nueva_campana",
  "pdfPath": "docs/social/nueva-campana/carrusel-aprobado.pdf",
  "pdfSha256": "64_hex_chars_del_PDF_REAL",
  "copyPath": "docs/social/nueva-campana/copy-final.txt",
  "copySha256": "64_hex_chars_del_texto_exacto",
  "pdfPages": 5,
  "documentTitle": "Título del documento autorizado"
}
```

La referencia de aprobación debe ser un archivo real bajo `docs/social/` que recoja **ambos hashes exactos**, la aprobación y su contexto. El manifiesto `docs/blog-linkedin-manifest.json` debe tener el mismo slug, `status=LISTO_PARA_DISTRIBUCION_EXTERNA`, `gateVerdict=PASS`, campaña y UTM idénticos. El texto se lee desde archivo plano y debe contener la URL UTM exacta. Las rutas deben estar dentro del checkout; no se admiten symlinks fuera ni PDFs regenerados.

## Secuencia automática

**B2B-05 (aprobación del 23/10):** el post muestra https://orbitalframeworks.qzz.io/pedidos/ mientras conserva internamente el destino UTM exacto del artículo. Es una excepción concreta y revisada, no un acortador genérico. La URL corta aparece en el texto aprobado; el gate exige HTML público con meta refresh a la URL UTM y noindex. El archivo public/pedidos/index.html se crea únicamente durante el release autorizado del artículo el 27/10. No distribuir en LinkedIn si el alias devuelve 404 o apunta a un destino distinto.

1. Timer consulta cola; si está vacía registra `NO_APPROVED_RELEASES` y **no abre LinkedIn**.
2. Validación de ventana UTC, autorización, manifiesto, hashes, dominio, sitemap y feed públicos.
3. Verificación de identidad empresarial y deduplicación por primera línea y feed.
4. Compositor PDF: `Más` → documento → título → esperar carga → copy exacto → PDF visible. **Nunca usar el antiguo publicador de texto solo**.
5. Crear journal `SUBMISSION_PENDING` exclusivo **antes** del único clic. Si el journal ya existe, solo conciliación en lectura.
6. Tras el clic, verificar permalink/URN, empresa, documento, navegación de **todas** las páginas y link UTM completo (incluido el shortlink LinkedIn).
7. Persistir `PUBLISHED_VERIFIED`; Telegram confirmado vía Orbital Relay. En fallo de preflight, registrar causa y reintentar máximo 3 veces dentro de ventana aprobada, sin clic. En incertidumbre posterior al clic, `NEEDS_RECONCILIATION`: **nunca reenviar**, consultar en lectura y notificar.

Los recibos privados son evidencia primaria de publicación. El manifiesto Git es el registro editorial versionado: después del éxito se debe conciliar y commitear mediante un canal de Git autorizado, preservando cambios ajenos. La tarea que distribuye no debe realizar `git add .`, pushes ni mutaciones de producción para arreglar un registro.

LinkedIn puede mostrar un enlace `lnkd.in` dentro de otro enlace `/safety/go/?url=...`. La normalización debe extraer la URL del query `url`, consultar la página intermedia de LinkedIn y comparar la URL UTM aprobada. **No** interpretar la ausencia de `href=https://lnkd.in` literal como fallo, pues el QA real del 22/10 reprodujo esa envoltura y validó el arreglo.

## Operación y pruebas

```bash
node --test tests/social-release-core.test.mjs
SOCIAL_RELEASE_HOME=/srv/orbital/runtimes/private/social-release node /srv/orbital/runtimes/private/social-release/bin/social-release-runner.mjs --dry-run
systemctl --user status orbital-social-release.timer --no-pager
systemctl --user list-timers orbital-social-release.timer --no-pager
journalctl --user -u orbital-social-release.service --no-pager -n 50
```

**Prohibido borrar** journals `SUBMISSION_PENDING` o `NEEDS_RECONCILIATION` para provocar un segundo clic. Si el link corto pasa por página intermedia de seguridad LinkedIn, el destino debe coincidir exactamente con el UTM aprobado. No considerar pruebas unitarias, status de timer o cierre de Chrome como publicación efectiva. Monitorear Telegram tanto en fallos como en éxitos.

Un lock `.runner.lock` nuevo incluye PID. Si queda huérfano por un corte, se considera recuperación solo después de nueve minutos y cuando el proceso propietario realmente haya terminado. Nunca eliminar un lock activo ni el journal de una publicación para "desbloquear".

## Alcance de la corrección del 22/10

El timer nuevo no agrega ninguna publicación a la cola y **no vuelve a publicar B2B-03**. La vía Metricool permanece no disponible mientras no tenga una red conectada; no se ha conectado ninguna cuenta nueva ni intentado evadir limitaciones de LinkedIn.
