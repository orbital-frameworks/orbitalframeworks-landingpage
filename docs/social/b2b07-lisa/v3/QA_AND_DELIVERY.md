# B2B07 LISA — revisión V3 de Orby

Estado: OWNER_REVIEW_NOT_PUBLISHED_NOT_SCHEDULED.

## Correcciones solicitadas

- Portada: eliminado el óvalo decorativo gigante que producía .s1::before. No era parte del recurso original de Orby. Se amplió el personaje de 123 px a 240 px y se colocó junto al título, sin cubrir texto ni la captura.
- Lámina 2: Orby creció de 193 px a 310 px. Se mantiene el diagrama y el texto intactos.
- Lámina 3: preservada idéntica a la V2, verificado mediante SHA-256.
- Lámina 4: Orby creció de 130 px a 250 px; la caja de conclusión se estrechó levemente para mantener el personaje separado del texto.
- Lámina 5: Orby creció de 130 px a 240 px y se recolocó junto al mensaje sin cubrir logo, descripción ni enlaces.

Los PNG canónicos de Orby contienen amplios márgenes transparentes, de modo que el tamaño visual es menor que el ancho CSS. La V3 verifica los límites de píxeles visibles del personaje (x76–962, y268–914 en los assets 1080×1080) frente a los bloques críticos, no solo las cajas de imagen.

## Validación

- node --check docs/social/b2b07-lisa/v3/render.mjs
- node docs/social/b2b07-lisa/v3/render.mjs: RENDER_PASS.
- 5 láminas PNG de 1080 × 1350, PDF multipágina y render-manifest.json.
- Revisión visual de la hoja de contacto y la portada al tamaño de lectura.
- Cero imágenes rotas, contenido fuera de página, colisiones detectadas u óvalo CSS.
- La lámina 3 es byte por byte idéntica a la V2.
- Material editorial (artículo y copy) permanece en ../v2/ sin cambios.

No distribuir el PDF en LinkedIn ni activar programación hasta aprobación. Esta V3 es el archivo exacto para revisión.
