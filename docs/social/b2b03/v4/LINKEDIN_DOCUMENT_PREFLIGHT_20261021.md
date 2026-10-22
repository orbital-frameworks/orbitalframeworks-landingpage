# LinkedIn — prueba preparatoria de adjunto B2B-03 V4

**Fecha:** 21/10/2026 (Perú). **Estado:** PREPARACIÓN VALIDADA SIN PUBLICAR. No equivale a un post enviado.

## Evidencia observable de la interfaz empresarial

Desde el perfil privado autorizado `/srv/orbital/runtimes/private/linkedin-company-admin-browser/profile`, en el panel empresarial `https://www.linkedin.com/company/134014070/admin/page-posts/published/`:

1. `node scripts/linkedin-company-publisher.mjs --probe` devolvió `ADMIN_SESSION_VERIFIED`, company `134014070`, página `/admin/page-posts/published/`.
2. Se abrió «Crear publicación» y se confirmó el autor «Orbital Frameworks».
3. Se pulsó **«Más» → «Añadir un documento»** (la opción existe en la interfaz actual).
4. El selector de archivo del compositor acepta `.doc,.docx,.pdf,.ppt,.pptx`; el archivo V4, SHA-256 `721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f`, fue cargado correctamente hasta aparecer como `orbital-b2b03-carousel-v4.pdf` (**465 KB**) en «Compartir un documento».
5. LinkedIn exige **título del documento de máximo 58 caracteres**. El texto de prueba más largo (más de 58) fue rechazado con el aviso correspondiente. El título válido comprobado tiene 50 caracteres: `Landing B2B o web corporativa | Orbital Frameworks`.
6. Al pulsar **«Hecho»** con el título válido volvió al módulo de publicación. Apareció el botón «Eliminar contenido multimedia» y «Editar vista previa del contenido», y el texto transitorio «Cargando vista previa…».
7. No se pulsó «Publicar». El navegador se cerró sin enviar el post. **La carga final del preview completo y un recibo público todavía NO están demostrados.**

**Implicación:** existe un camino legítimo en la UI para adjuntar PDF como documento, pero la automatización de publicación con PDF **no está validada extremo a extremo**. No usar el publicador previo de texto+enlace para esta campaña.

## Contrato de comprobación del jueves 22 a las 09:00

- Verificar primero artículo real, gate 15/15, compañía, hashes PDF y copy del `publishing-brief.md`.
- Abrir compositor → «Más» → «Añadir un documento» → `input[type=file]` con PDF **V4 exacto**, título de 50 caracteres → «Hecho».
- **Esperar a que termine «Cargando vista previa…»** y comprobar que título/medio y páginas realmente quedan listos, sin error de procesamiento.
- Pegar copy UTM exacto y comprobar todo junto (autor, medio y enlace). Si no hay preview comprobable, **no enviar**.
- Hacer control de duplicados/journal antes del clic. Crear registro privado idempotente previo al único clic para no repetir tras errores ambiguos.
- Tras un solo clic: comprobar post real, permalink, documento descargable/visible y conservar recibo. Enviar ambas URLs por Telegram owner. Si falla: bloqueo sin degradar a texto.

**Nota:** las pruebas anteriores no realizan acciones públicas. El hecho de que la interfaz acepte el archivo como borrador no acredita que LinkedIn haya publicado el documento.
