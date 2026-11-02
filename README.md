# OpenSpot — Frontend

Interfaz web de OpenSpot, la plataforma de gestión de espacios de coworking. Permite a los dueños publicar sedes y dibujar sus planos, y a los inquilinos buscar disponibilidad, reservar y coordinar equipos.

> **Nombre del producto:** OpenSpot. El código conserva identificadores legacy como `cowork-frontend` y `cowork-auth`; el backend mantiene `cowork-backend` por compatibilidad.

---

## Stack

| Componente | Tecnología |
|---|---|
| UI | React 19 |
| Lenguaje | TypeScript (modo strict) |
| Build / dev server | Vite 8 |
| Ruteo | React Router DOM 7 |
| Estado global | Zustand 5 (`persist`) |
| HTTP | Axios |
| Estilos | Tailwind CSS 4 |
| Mapas interactivos | Konva 10 + react-konva 19 |
| Login | `@react-oauth/google` |

---

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (probado con Node 24.22)
- npm
- El backend corriendo en `http://localhost:8080`

---

## Inicio rápido

### 1. Levantar el backend

Desde el repositorio del backend:

```bash
docker compose up -d db
./mvnw spring-boot:run
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Creá un `.env` en la raíz del frontend:

```env
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

Sin esta variable, la pantalla de login muestra un error y no se puede iniciar sesión con Google.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La app queda en `http://localhost:5173`.

Vite tiene configurado un proxy:

```text
/api → http://localhost:8080
```

Por eso Axios usa `baseURL: '/api'` y no hace falta configurar CORS en desarrollo.

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Sí, para login | Client ID OAuth de Google. Debe coincidir con `APP_GOOGLE_CLIENT_ID` del backend |
| `VITE_API_URL` | No | Declarada en `src/vite-env.d.ts`, pero **no se usa**. La base real es `/api` vía proxy |

> Si el frontend y el backend se despliegan en dominios distintos, hay que configurar un reverse proxy que exponga `/api` o modificar `src/api/client.ts`. Definir solo `VITE_API_URL` no alcanza.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en el puerto 5173 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de `dist/` |
| `npx tsc --noEmit` | Chequeo de tipos (el build de Vite no lo ejecuta) |

No hay script de lint ni de tests.

---

## Estructura

```text
src/
├── main.tsx                 # ReactDOM + GoogleOAuthProvider + App
├── App.tsx                  # Rutas y guards por rol
├── index.css                # Tailwind 4, design tokens y dark mode
├── vite-env.d.ts
├── api/
│   ├── client.ts            # Axios, interceptores y getErrorMessage
│   ├── types.ts             # Tipos espejo de los DTO del backend
│   └── amenities.ts         # GET /amenities
├── store/
│   └── authStore.ts         # Zustand + persist (token, user)
├── hooks/
│   └── useTheme.ts          # Tema claro/oscuro
├── editor/
│   └── types.ts             # Tipos del editor de planos, GRID_SIZE
├── components/
│   ├── Layout.tsx, ProtectedRoute.tsx, Spinner.tsx, ThemeToggle.tsx
│   ├── LocationForm.tsx, WorkspaceDetailsForm.tsx
│   ├── AmenitySelector.tsx, AmenityChips.tsx
│   ├── FloorSelector.tsx
│   ├── MapCanvas.tsx        # Plano de solo lectura (disponibilidad)
│   ├── MapEditorCanvas.tsx  # Plano editable (Konva)
│   ├── MapEditor.tsx        # Orquesta editor, estado y persistencia
│   ├── WorkspacePropertiesPanel.tsx
│   ├── StaticElementPropertiesPanel.tsx
│   └── DashboardCard.tsx    # Solo demo visual
└── pages/
    ├── Landing.tsx
    ├── LoginPage.tsx
    ├── OwnerDashboard.tsx
    ├── LocationDetail.tsx
    ├── WorkspaceEditorPage.tsx
    ├── WorkspaceReservations.tsx
    ├── BrowseWorkspaces.tsx
    ├── WorkspaceAvailability.tsx
    ├── MyReservations.tsx
    ├── TeamsPage.tsx
    └── DemoPreview.tsx
```

---

## Rutas y roles

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Landing | Público |
| `/login` | Login con Google | Público |
| `/demo` | Demo de estilos | Público |
| `/dashboard` | Mis sedes | OWNER |
| `/dashboard/locations/:id` | Detalle de sede | OWNER |
| `/dashboard/locations/:id/edit` | Editor de plano | OWNER |
| `/dashboard/locations/:id/reservations` | Reservas de la sede | OWNER |
| `/workspaces` | Buscar espacios | Autenticado |
| `/locations/:id` | Disponibilidad y reserva | Autenticado |
| `/reservations` | Mis reservas | TENANT |
| `/teams` | Equipos | TENANT |

- `ProtectedRoute` exige token y usuario; opcionalmente exige un `accountType`.
- Si no hay sesión, redirige a `/login`.
- Si el rol no coincide, redirige a `/`.
- `HomeRedirect` manda OWNER a `/dashboard` y TENANT a `/workspaces`.

---

## Integración con el backend

- **Axios** (`src/api/client.ts`) usa `baseURL: '/api'` y timeout de 60 segundos.
- El interceptor de request agrega `Authorization: Bearer <token>` desde el store.
- El interceptor de response hace logout y redirige a `/login` ante un **401**.
- `getErrorMessage()` prioriza el `message` del `ApiError` del backend y maneja timeout / falta de conexión.
- Los tipos de `src/api/types.ts` se mantienen a mano y deben reflejar los DTO del backend.
- No hay React Query ni SWR: cada pantalla usa `useState` + `useEffect` y llama a Axios directamente.

### Autenticación

- El login se hace con Google (`GoogleLogin` de `@react-oauth/google`).
- El ID token se envía a `POST /api/auth/google` junto con el rol elegido (`OWNER` o `TENANT`).
- El backend responde `{ token, user }`.
- Se guarda en Zustand con `persist`, bajo la clave de localStorage `cowork-auth`.
- El rol solo se usa al crear la cuenta; si el usuario ya existe, el backend respeta su rol actual.

---

## Funcionalidades principales

### Dueño de espacio (OWNER)

- Crear y editar sedes.
- Ver los espacios de cada sede.
- Editor visual de planos:
  - Agregar hot desks, oficinas privadas y salas de reuniones.
  - Mover, redimensionar y rotar espacios.
  - Agregar paredes, puertas y zonas comunes.
  - Zoom, paneo, grilla y snap.
  - Crear y eliminar pisos.
  - Guardar el plano completo de cada piso.
- Configurar capacidad, tarifas por hora/día/mes, máximos, moneda, amenities y estado.
- Ver las reservas de la sede y cancelarlas.

### Inquilino (TENANT)

- Ver todos los espacios publicados.
- Consultar disponibilidad por sede, piso, fecha, horario y modalidad.
- Ver el plano con espacios disponibles (verde) y ocupados (rojo).
- Reservar individualmente o para un equipo.
- Ver y cancelar sus reservas.
- Crear equipos, invitar miembros y aceptar/rechazar invitaciones.

---

## Editor de planos

El editor está construido con Konva y se organiza en tres piezas:

- `MapEditor.tsx`: estado, carga de datos, creación/edición de espacios y persistencia.
- `MapEditorCanvas.tsx`: canvas editable con selección, drag, transformación, zoom y snap.
- `MapCanvas.tsx`: canvas de solo lectura para la vista de disponibilidad.

El plano se guarda como **string JSON** en `floor.mapStructure`:

```json
{
  "elements": [
    { "workspaceId": 1, "x": 40, "y": 40, "w": 120, "h": 70, "rotation": 0 }
  ],
  "objects": [
    { "elementId": "object-abc", "kind": "wall", "label": "Pared",
      "x": 0, "y": 0, "w": 220, "h": 18, "rotation": 0 }
  ]
}
```

- `elements`: posición de los espacios alquilables.
- `objects`: elementos estáticos (`wall`, `door`, `common-area`).
- Coordenadas en píxeles sobre un lienzo base de 1000 × 600.
- `GRID_SIZE = 50`.

> Los cambios de geometría y los objetos estáticos se guardan recién al presionar **“Guardar plano”**. Al crear un espacio, la entidad se crea y el mapa se persiste de inmediato.

---

## Estilos y tema

- Tailwind CSS 4 con plugin de Vite y tokens definidos en `@theme` dentro de `index.css`.
- Paleta: `primary` (cian), `secondary` (naranja), `accent` (amarillo) y tokens semánticos (`background`, `surface`, `surface-muted`, `foreground`, `muted-foreground`, `border`, `success`, `danger`).
- Dark mode por clase `.dark` en `<html>`, con persistencia en `openspot-theme`.
- Tipografía: Plus Jakarta Sans.
- Sombras: `shadow-soft` y `shadow-soft-lg`.

Al crear componentes nuevos, usá los tokens existentes y verificá el resultado en tema claro y oscuro. En el canvas de Konva se usan colores hex porque Konva no interpreta clases de Tailwind.

---

## Build y despliegue

```bash
npx tsc --noEmit
npm run build
```

El resultado queda en `dist/`.

Para producción:

- Servir `dist/` con un hosting estático (Nginx, Vercel, Netlify, etc.).
- Exponer `/api` mediante un reverse proxy hacia el backend, o cambiar `baseURL` en `src/api/client.ts`.
- Configurar `VITE_GOOGLE_CLIENT_ID` en el entorno de build.
- Verificar que el `CORS_ORIGINS` del backend incluya el dominio del frontend.

> `VITE_API_URL` está declarada pero no está cableada. Si se quiere usar, hay que modificar `src/api/client.ts`.

---

## Convenciones para nuevos cambios

1. Actualizar `src/api/types.ts` si cambia un DTO del backend.
2. Si la llamada se reutiliza, crear `src/api/<feature>.ts`; si es de una sola pantalla, usar `api` directamente.
3. Agregar la ruta en `App.tsx` con el guard de rol correspondiente.
4. Agregar el link en `Layout.tsx` si es una sección principal.
5. Reutilizar `Spinner`, los tokens de color y los estados de carga/error/éxito.
6. Mantener los textos de UI en español.
7. Verificar con `npx tsc --noEmit` y `npm run build`.

---

## Limitaciones conocidas

- No hay tests de frontend ni script de lint.
- `npm run build` no ejecuta el chequeo de tipos; usar `npx tsc --noEmit`.
- `VITE_API_URL` no se usa.
- `BrowseWorkspaces` no filtra por tipo, ciudad, precio, capacidad, amenities ni disponibilidad.
- La vista de disponibilidad muestra el precio unitario de la modalidad, no el total calculado para el rango.
- Las pantallas de reservas muestran “ARS” fijo en el total, aunque la reserva tenga otra moneda.
- `LocationForm` no expone latitud/longitud aunque el backend las soporta.
- El editor de plano pierde cambios de geometría y objetos estáticos si no se guarda el plano.
- No hay paginación en los listados.
- `DemoPreview` y `DashboardCard` son una demo visual, no forman parte del flujo real.

---

## Problemas comunes

- **“Falta configurar VITE_GOOGLE_CLIENT_ID”:** creá el `.env` con el Client ID y reiniciá `npm run dev`.
- **`Network Error` o 404 en `/api`:** verificá que el backend esté corriendo en `localhost:8080` y que el proxy de Vite esté activo.
- **Google rechaza el origen:** agregá `http://localhost:5173` en “Authorized JavaScript origins” del Client ID en Google Cloud Console.
- **Un espacio no aparece en el plano de disponibilidad:** verificá que tenga `floorId` asignado y que esté guardado en el mapa de ese piso.
- **El total de una reserva no coincide con lo esperado:** la vista muestra el precio unitario de la modalidad; el total prorrateado lo calcula el backend.

---

## Documentación adicional

- **Contexto completo del proyecto (back + front):** `../CONTEXTO-OPENSPOT.md`, en la carpeta raíz que contiene ambos repositorios.
- **Backend:** [github.com/LeandroRossetti/Backend-OpenSpot](https://github.com/LeandroRossetti/Backend-OpenSpot)
