# Appart’hotel Costa Verde — guía del proyecto

## Ejecutar

Este es un proyecto completo administrado de Runable: Bun + React + Vite + Hono + Drizzle/Turso. No es una página HTML independiente y no funciona abriendo `index.html` con doble clic. La estructura solicitada se adapta al stack desplegable de la plataforma.

Desde la raíz del proyecto:

```bash
bun install
bun run dev
```

La web y la API se sirven juntas en el puerto asignado en `__ports.cjs` (4200 en este proyecto). La infraestructura y el archivo `.env` ya están configurados en el proyecto de Runable. El ZIP de código no incluye secretos.

Para usar la copia descargada fuera de Runable, crea **solo un `.env` en la raíz** con una base Turso propia (`DATABASE_URL` y `DATABASE_AUTH_TOKEN`), `WEBSITE_URL` y `NODE_ENV`. No publiques ese archivo ni copies credenciales al código. Luego ejecuta:

```bash
bun run db:push
bun run build
bun run start
```

## Archivos que modificar

```text
appart-hotel-costa-verde/
  GUIA.md
  design.md
  package.json
  packages/web/
    index.html                 # Entrada HTML y metadatos
    public/images/             # Fotografías WebP reemplazables
    public/fonts/              # Fuentes locales
    src/shared/hotel.ts        # Datos, habitaciones, tarifas, servicios y galería
    src/web/pages/home.tsx     # Interfaz y comportamiento
    src/web/costa.css          # Diseño responsive
    src/web/styles.css         # Estilos base
    src/web/queries/hotel.ts   # Consultas y envíos tipados
    src/api/routes/hotel.ts    # API de reseñas y solicitudes
    src/api/database/schema.ts # Tablas para presente y futuro panel
    scripts/moderate.ts        # Moderación y consulta local del operador
```

## Cambiar fotos

Sustituye los archivos en `packages/web/public/images/` conservando sus nombres, o cambia `gallery` en `src/shared/hotel.ts`. Las rutas son públicas, por ejemplo `/images/patio.webp`. La portada usa `/images/exterior.webp` en `home.tsx`.

Las fotos actuales proceden de búsquedas de listados públicos del alojamiento y están marcadas como referencias **pendientes de validación**. No constituyen un catálogo verificado. Antes de publicar comercialmente, reemplázalas por imágenes propias/autorizadas y confirma que pertenecen al establecimiento. Elimina el aviso únicamente después de validarlas. Fuente de referencia: https://www.vrbo.com/pdp/lo/91171039. No se ha usado la imagen de un edificio que apareció erróneamente en la búsqueda.

Usa WebP de aproximadamente 1600 px para portada y 800–1200 px para galería. El motor de compilación también optimiza las imágenes. Las fotos interiores no implican características ni tipos de habitación confirmados.

## Precios, habitaciones y servicios

Edita `hotel.referencePrice` en `src/shared/hotel.ts` para cambiar el precio orientativo. El sitio no calcula un precio final usando esa referencia.

`rooms` comienza vacío a propósito. Para agregar una habitación, incluye un objeto con estos campos y únicamente datos verificados:

```ts
{
  id: 'identificador-unico',
  name: 'Nombre aprobado por el alojamiento',
  photo: '/images/foto-propia.webp',
  price: null,
  capacity: null,
  features: [],
  services: [],
  description: null,
  availability: null
}
```

`null` significa pendiente de confirmar; no introduzcas valores ficticios. Al completar `rooms`, se generan tarjetas, detalles y opciones del formulario automáticamente. La API valida los identificadores del mismo catálogo. Precio numérico en DOP por noche, capacidad numérica, características y servicios como listas de texto. Recompila para publicar cambios de configuración.

Puedes ampliar `services` y `gallery`; las categorías son Todas, Habitaciones, Exterior, Cocina y Áreas comunes. Actualmente no hay fotos confirmadas de cocina.

Hay estructuras de `seasons` y `availability` y tablas `seasonal_rates`, `room_availability`, `room_catalog` y `site_content` preparadas para un futuro panel. **No hay motor de tarifas por temporada, calendario de inventario, ni panel conectado todavía**. Introducir datos en esas tablas no modifica por sí solo la web. Su integración, roles y autenticación deberán implementarse con el panel.

## Reseñas y moderación

El formulario guarda nombre, estrellas, comentario y foto opcional en la base. La foto se reduce a un máximo de 1000 px y se almacena junto con la reseña. Las reseñas entran con `status: pending`. La API pública solo devuelve las aprobadas; no expone solicitudes ni controles de moderación.

Desde la raíz, el operador con acceso autorizado al entorno puede usar:

```bash
bun --env-file=.env packages/web/scripts/moderate.ts reviews
bun --env-file=.env packages/web/scripts/moderate.ts approve ID
bun --env-file=.env packages/web/scripts/moderate.ts reject ID
```

Reemplaza `ID` por el número de la reseña después de revisar su contenido. Al recargar la página, aparecen las aprobadas. El script no está disponible por Internet. No se ha inventado ninguna reseña ni distribución por estrellas. El 4.1/5 y las 37 reseñas son datos de referencia proporcionados y no se recalculan con las reseñas del sitio.

## Solicitudes de reserva

El formulario valida fechas, huéspedes y campos obligatorios; guarda una solicitud `requested`. No cobra ni confirma una reserva, y no manda automáticamente una notificación al teléfono o correo. Para leer las solicitudes:

```bash
bun --env-file=.env packages/web/scripts/moderate.ts reservations
```

El botón WhatsApp abre un mensaje con el resumen en el número proporcionado. El visitante debe enviarlo en WhatsApp. El enlace está construido correctamente; que el número tenga una cuenta activa de WhatsApp debe confirmarlo el establecimiento. Los enlaces de llamada usan `tel:+18097146337`; Cómo llegar abre Google Maps. El mapa embebido requiere conexión y que el navegador permita recursos de Google; siempre hay un enlace alternativo.

## Publicar en Internet

En Runable utiliza **Publicar** en la vista previa; dominio personalizado y ajustes se administran en la plataforma. La API y la base deben permanecer disponibles para los formularios. No subas solo `index.html` o la carpeta `dist` a un hosting estático: las solicitudes y reseñas necesitan el servidor.

Antes de abrir al público: confirma número de WhatsApp, fotografías, datos comerciales, flujo de revisión de reservas y requisitos legales de privacidad. Se incluye validación del lado servidor y campo antispam básico; para tráfico público elevado conviene añadir límites de peticiones y protección contra bots. No existen pagos, horarios, políticas o disponibilidad inventados.

## Verificación

Compilación y lint comprobados. Pruebas en Chromium: anchos 1440, 768, 390 y 375 px sin desbordamiento; perfiles iPhone 13 y Pixel 7; menú móvil, filtros, ampliación y cierre con Escape; sincronización de fechas; persistencia de solicitudes; reseñas pendientes excluidas del listado público. Estos perfiles son emulaciones, no pruebas físicas en Safari/iPhone o Android. Enlaces de llamada/WhatsApp revisados; no se realizaron llamadas ni se enviaron mensajes. Los datos técnicos de prueba se eliminaron.