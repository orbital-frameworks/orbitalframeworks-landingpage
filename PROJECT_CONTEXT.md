# PROJECT_CONTEXT — Orbital Frameworks Landing Page

```yaml
project_id: orbital-landing
name: Orbital Frameworks Landing Page
classification: COMPANY_ASSET
status: ACTIVE
root: orbitalframeworks-landingpage
```

## Propósito

Sitio público y posicionamiento oficial de Orbital Frameworks como empresa de desarrollo de software y soluciones digitales.

## Leer primero

1. `AGENTS.md`.
2. `README.md`.
3. Archivos de contenido, SEO o componente afectados.
4. `Docs/canonical/05_PORTAFOLIO_Y_MAPA_DE_PROYECTOS.md` solo para verificar proyectos y clasificación.

## Reglas críticas

- No inventar clientes, logos, partners, métricas, testimonios, integraciones ni casos.
- Wasy se presenta con catálogo web publicado en https://wasy.store/, pedido por WhatsApp y app móvil en beta privada.
- Orbital Frameworks debe ser visible sin apropiarse de la identidad de cada producto.
- El copy público no expone arquitectura ni procesos internos innecesarios.

## Graphify

No existe grafo local. Usar el grafo global solo para resolver relaciones de portafolio, nombres, capacidades o documentación.

## Zonas protegidas

- claims públicos;
- nombres y logos de clientes;
- metadata, SEO y datos estructurados;
- formularios y contacto;
- producción.

## Exclusiones por defecto

- `dist/`;
- `node_modules/`;
- assets no aprobados;
- documentación interna no necesaria para el copy.

## Validación

- lint;
- build;
- enlaces y metadata;
- responsive y QA visual;
- revisión de claims;
- diff final.

## Frontera de publicación

- Los trabajadores `workspace-write` del runtime Orbital operan en sandbox. Pueden editar las rutas concedidas y producir evidencia de QA, pero **no deben recibir como obligación ejecutable `git add`, `git commit` o `git push`**: la carpeta `.git` puede estar montada en solo lectura y el sandbox no garantiza SSH al remoto.
- Una vez aprobado el QA, el Sponsor coordina la publicación mediante una superficie externa autorizada que sí tenga permisos efectivos de Git/GitHub. El permiso comercial de publicar no amplía automáticamente el sandbox del trabajador ni elimina los gates del proveedor de despliegue.
- No replanificar repetidamente un fallo `Read-only file system` de `.git` o falta de SSH con el mismo worker y el mismo envelope. Registrar el bloqueo y transferir únicamente esa etapa al canal autorizado; preservar todos los cambios del checkout, sin `git add .` ni operaciones destructivas.
- La aceptación de un release requiere verificar el SHA remoto, CI y **el dominio público**, no solo un build, commit o push exitoso.

## Condición de parada

El contexto es suficiente cuando se conoce la página, claim, evidencia, activos permitidos, CTA y validación pública necesaria.
