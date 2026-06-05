# StockFlow API

API RESTful para el Sistema de Gestión de Logística y Despacho, desarrollada con Node.js, Express, TypeScript y Prisma ORM.

---

## Tecnologías Utilizadas

- **Node.js** con **TypeScript**
- **Express** — Framework HTTP
- **Prisma ORM** — Acceso a base de datos
- **PostgreSQL** — Base de datos relacional
- **JWT (jsonwebtoken)** — Autenticación por tokens
- **bcryptjs** — Encriptación de contraseñas
- **Zod** — Validación de esquemas

---

## Requisitos Previos

- Node.js v18 o superior
- PostgreSQL instalado y corriendo
- npm v9 o superior

---

## Instalación y Configuración

### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@localhost:5432/stockflow_db
JWT_SECRET=supersecreto123
PORT=3000
```

Reemplazar `USUARIO` y `CONTRASEÑA` con las credenciales reales de PostgreSQL.

> Si la contraseña contiene caracteres especiales como `.`, `@`, `#`, deben escaparse en la URL.
> Ejemplo: el punto `.` se escribe como `%2E`

### 3. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev --name init
```

Esto crea todas las tablas en la base de datos automáticamente.

### 4. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 5. Sembrar datos iniciales

```bash
node prisma/seed.js
```

Esto crea los siguientes datos de prueba:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMIN | admin@stockflow.com | admin123 |
| OPERATOR | operator@stockflow.com | op123456 |

También crea una categoría **Electrónica** con dos productos:
- Laptop HP (stock: 10, minStock: 3)
- Mouse USB (stock: 2, minStock: 5)

### 6. Arrancar el servidor en modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## Estructura del Proyecto

```
src/
├── app.ts                        # Configuración de Express y rutas
├── server.ts                     # Punto de entrada del servidor
├── errors/
│   └── AppError.ts               # Clase de error personalizada
├── lib/
│   └── prisma.ts                 # Cliente de Prisma
├── middlewares/
│   ├── AuthMiddleware.ts         # Verificación de token JWT
│   ├── roleGuard.ts              # Control de acceso por roles
│   ├── validateRequest.ts        # Validación con Zod
│   └── errorHandler.ts          # Manejador global de errores
├── modules/
│   ├── auth.controller.ts        # Controlador de autenticación
│   ├── auth.routes.ts            # Rutas de autenticación
│   ├── auth.schemas.ts           # Esquemas Zod de auth
│   └── auth.services.ts         # Lógica de negocio de auth
├── products/
│   ├── product.controller.ts     # Controlador de productos
│   ├── product.routes.ts         # Rutas de productos
│   ├── product.service.ts        # Lógica de negocio de productos
│   └── products.schemas.ts      # Esquemas Zod de productos
├── orders/
│   ├── order.controller.ts       # Controlador de pedidos
│   ├── order.routes.ts           # Rutas de pedidos
│   ├── order.services.ts         # Lógica transaccional de pedidos
│   └── orders.schemas.ts        # Esquemas Zod de pedidos
└── types/
    └── express.d.ts              # Extensión de tipos de Express
```

---

## Endpoints de la API

### Autenticación (Públicos)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de nuevo usuario |
| POST | `/api/auth/login` | Login y obtención de token JWT |

### Productos (Autenticados)

| Método | Ruta | Rol requerido | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/products` | ANY | Listar productos (filtro por `?categoryId=`) |
| POST | `/api/products` | ADMIN | Crear producto |
| PUT | `/api/products/:id` | ADMIN | Actualizar producto |
| DELETE | `/api/products/:id` | ADMIN | Eliminar producto |

### Reportes (Solo ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/low-stock` | Productos con stock igual o menor al mínimo |

### Pedidos (Autenticados)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido (transaccional) |
| GET | `/api/orders/:id` | Obtener detalle de pedido |
| PATCH | `/api/orders/:id/status` | Cambiar estado del pedido |

---

## Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login en `/api/auth/login`.

---

## Reglas de Negocio

### Creación de Pedidos (Transaccional)
- Se verifica el stock disponible de **todos** los productos antes de procesar.
- Si algún producto no tiene stock suficiente, la transacción completa hace **rollback** y retorna un error 400 descriptivo.
- Si hay stock suficiente, se descuenta automáticamente de cada producto y se registra el pedido.

### Cancelación de Pedidos
- Solo se pueden cancelar pedidos en estado `PENDING`.
- Al cancelar, el stock de todos los productos del pedido se **reintegra automáticamente**.

### Estados de Pedido
- `PENDING` → estado inicial al crear
- `DISPATCHED` → pedido despachado (no se puede revertir)
- `CANCELLED` → pedido cancelado (reintegra stock)

---

## Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado exitosamente |
| 400 | Datos inválidos o regla de negocio violada |
| 401 | No autenticado (token ausente o inválido) |
| 403 | Sin permisos suficientes |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email o SKU duplicado) |
| 500 | Error interno del servidor |

---

## Colección de Pruebas

Se incluye el archivo `stockflow.http` en la raíz del proyecto para probar todos los endpoints con la extensión **REST Client** de VS Code.

### Instrucciones de uso:
1. Instalar la extensión **REST Client** en VS Code (autor: Huachao Mao)
2. Abrir el archivo `stockflow.http`
3. Ejecutar **1.3 Login ADMIN** y copiar el token de la respuesta
4. Pegarlo en la variable `@adminToken` al inicio del archivo
5. Ejecutar **1.4 Login OPERATOR** y pegarlo en `@operatorToken`
6. Ya puedes ejecutar cualquier petición con click en **Send Request**

---

## Scripts Disponibles

```bash
npm run dev      # Servidor en modo desarrollo con hot-reload
npm run build    # Compilar TypeScript a JavaScript
npm start        # Ejecutar versión compilada
```
