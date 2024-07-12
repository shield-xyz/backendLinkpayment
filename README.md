# Backend Project

## Descripción

Este proyecto es un backend desarrollado en Node.js que provee varias rutas y controladores para gestionar diferentes recursos.

## Estructura del Proyecto

```
backend/
├── bin/
├── config/
├── controllers/
├── middleware/
├── models/
├── node_modules/
├── public/
├── routes/
├── services/
├── uploads/
├── utils/
├── .env
├── .gitignore
├── db.js
├── package.json
├── package-lock.json
└── server.js
```

### Descripción de Carpetas y Archivos

- **bin/**: Archivos ejecutables o scripts.
- **config/**: Archivos de configuración.
- **controllers/**: Controladores que contienen la lógica de negocio.
- **middleware/**: Middleware personalizado para la aplicación.
- **models/**: Definición de modelos y esquemas de base de datos.
- **node_modules/**: Dependencias instaladas del proyecto.
- **public/**: Archivos públicos y estáticos.
- **routes/**: Definición de rutas y endpoints.
- **services/**: Servicios que encapsulan lógica de negocio compleja.
- **uploads/**: Archivos subidos.
- **utils/**: Utilidades y funciones auxiliares.
- **db.js**: Configuración de la base de datos.
- **server.js**: Punto de entrada principal de la aplicación.

## Instalación

1. Clona el repositorio: `git clone https://github.com/usuario/backend.git`
2. Navega al directorio del proyecto: `cd backend`
3. Instala las dependencias: `npm install`
4. Configura el entorno: Crea un archivo `.env` basado en `.env.example`

## Uso

Para ejecutar el proyecto, usa el siguiente comando:

```bash
npm start
```

## Rutas

Aquí se describen las rutas disponibles en la API, los métodos soportados, y las variables que reciben:

### Ejemplo de Rutas:

## Rutas de Autenticación (routes/authRoutes.js)

- **POST /api/auth/login**: Inicia sesión en la aplicación.
  - Parámetros en el cuerpo de la solicitud:
    - **email**: String. Correo electrónico del usuario.
    - **password**: String. Contraseña del usuario.
- **POST /api/auth/register**: Registra un nuevo usuario.
  - Parámetros en el cuerpo de la solicitud:
    - **name**: String. Nombre del usuario.
    - **email**: String. Correo electrónico del usuario.
    - **password**: String. Contraseña del usuario.

## Rutas de Link Payment (routes/linkPaymentRoutes.js)

- **POST /api/linkpayment/create**: Crea un nuevo link de pago.
  - Parámetros en el cuerpo de la solicitud:
    - **amount**: Número. Monto del pago.
    - **description**: String. Descripción del pago.
- **GET /api/linkpayment/:id**: Obtiene la información de un link de pago.
  - Parámetros en la URL:
    - **id**: String. ID del link de pago.

## Rutas de Merchant (routes/merchantRoutes.js)

- **GET /api/merchants**: Obtiene todos los comerciantes.
- **POST /api/merchants**: Crea un nuevo comerciante.
  - Parámetros en el cuerpo de la solicitud:
    - **name**: String. Nombre del comerciante.
    - **email**: String. Correo electrónico del comerciante.
- **PUT /api/merchants/:id**: Actualiza un comerciante existente.
  - Parámetros en la URL:
    - **id**: String. ID del comerciante.
- **DELETE /api/merchants/:id**: Elimina un comerciante.
  - Parámetros en la URL:
    - **id**: String. ID del comerciante.

## Rutas de Pagos (routes/payments.route.js)

- **POST /api/payments**: Crea un nuevo pago.
  - Parámetros en el cuerpo de la solicitud:
    - **amount**: Número. Monto del pago.
    - **method**: String. Método de pago.
    - **description**: String. Descripción del pago.
- **GET /api/payments/:id**: Obtiene la información de un pago.
  - Parámetros en la URL:
    - **id**: String. ID del pago.
- **PUT /api/payments/:id**: Actualiza la información de un pago.
  - Parámetros en la URL:
    - **id**: String. ID del pago.
- **DELETE /api/payments/:id**: Elimina un pago.
  - Parámetros en la URL:
    - **id**: String. ID del pago.

**Rutas de Transacciones (routes/transactionRoutes.js)**

- **GET /api/transactions**: Obtiene todas las transacciones.
- **POST /api/transactions**: Crea una nueva transacción.
  - Parámetros en el cuerpo de la solicitud:
    - amount: Número. Monto de la transacción.
    - description: String. Descripción de la transacción.
- **PUT /api/transactions/:id**: Actualiza una transacción existente.
  - Parámetros en la URL:
    - id: String. ID de la transacción.
- **DELETE /api/transactions/:id**: Elimina una transacción.
  - Parámetros en la URL:
    - id: String. ID de la transacción.

### Ejemplo de Modelos:

**Modelo de Usuario (models/user.js)**

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
```

- **name**: String. Nombre del usuario.
- **email**: String. Email del usuario (debe ser único).
- **password**: String. Contraseña del usuario.
- **createdAt**: Date. Fecha de creación del usuario (por defecto, la fecha actual).
