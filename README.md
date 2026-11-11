# TFI Grupo 1 - Desarrollo de Moviles 2026 - UNER

# Grupo 1 - integrantes:
- Ariel Alejandro Aragón
- Luis Gutiérrez
- Natalia Pellegrineschi
- Elian Perez
- Vanesa Mariana Rimada Maidana
- Valeria Aylin Travnik Armitano

# Reporte Ciudadano

App móvil para  los vecinos de Gualeguaychú reporten problemas de la ciudad
(baches, luminarias, basura, ramas caídas, etc.) y puedan seguir qué pasa con
cada reclamo. Los operadores de la Municipalidad usan la misma app para
gestionarlos.


## Qué puede hacer

**Vecino**
- Crear un reporte con foto obligatoria, ubicación por GPS y descripción escrita o por nota de voz.
- Seguir el estado de sus reclamos: recibido, en revisión, asignado a cuadrilla, resuelto o rechazado.
- Ver todos los reportes en un mapa y sumarse a uno que ya existe en lugar de crear otro.
- Mostrar un código QR de su reclamo en el mostrador.
- Recibir avisos cuando cambia el estado de un reclamo, y apagarlos si no los quiere.
- Crear reportes sin conexión: se guardan en el teléfono y se suben solos cuando vuelve la señal.

**Operador**
- Ver la bandeja de reportes con filtros por estado, tipo y zona.
- Cambiar el estado de un reporte (dejando el motivo), asignarlo a una cuadrilla o marcarlo como duplicado.
- Escanear el QR del vecino para abrir su reclamo.
- Consultar las zonas y las cuadrillas de cada una.


## Estructura del proyecto

```
app/                  Pantallas y rutas (Expo Router)
├── auth/             Inicio de sesión y registro
├── (tabs)/           Pestañas del vecino
├── (tabs-operador)/  Pestañas del operador
└── reclamos/         Nuevo reporte y detalle de un reclamo

components/           Componentes reutilizables (modales, chips, etc.)
src/
├── contexto/         Sesión del usuario (AuthContext)
├── servicios/        Acceso a datos: toda lectura y escritura pasa por acá
└── tipos/            Tipos de TypeScript compartidos
styles/theme.ts       Colores, espaciados y tipografía (modo claro y oscuro)
```

## Datos y API

La app habla con la API de la cátedra a través de `api/clienteHttp.ts`. Las
pantallas no hacen pedidos directamente: usan siempre las funciones del servicio
`src/servicios/`.

La API responde siempre con esta forma:

```json
{ "datos": [], "meta": { "total": 0, "pagina": 1, "porPagina": 20 } }
```

o, si hay un error:

```json
{ "error": { "codigo": "FOTO_REQUERIDA", "mensaje": "El reporte necesita al menos una foto." } }
```

## Estilos

Todos los colores, espaciados y tamaños salen de `styles/theme.ts`. La app
respeta el modo claro y oscuro del teléfono. Para que las pantallas se vean
igual entre sí, usá esas propiedades en vez de escribir colores a mano.
