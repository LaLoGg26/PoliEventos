# 🎟️ Ticketera MVP (Poli Eventos)

Plataforma web para la gestión, venta y compra de boletos para eventos. Desarrollada con una arquitectura de **monorepo lógico** separando Frontend y Backend.

## 🚀 Características

- **Visualización de Eventos:** Catálogo de eventos con búsqueda por nombre y lugar.
- **Gestión de Boletos:** Soporte para múltiples tipos de boletos (General, VIP, etc.) con control de inventario.
- **Compras Seguras:** Uso de transacciones en base de datos para asegurar que no se vendan boletos agotados.
- **Roles de Usuario:**
  - **Comprador:** Puede ver eventos y comprar boletos.
  - **Vendedor:** Puede publicar eventos (requiere suscripción activa).
  - **Super Usuario:** Administración total.
- **Seguridad:** Autenticación mediante JWT y contraseñas encriptadas con Bcrypt.

## 🛠️ Tecnologías Usadas

### Backend

- **Node.js** (Entorno de ejecución)
- **Express** (Framework web)
- **MySQL2** (Driver de base de datos)
- **JWT** (JSON Web Tokens para autenticación)
- **Bcrypt** (Hashing de contraseñas)
- **Dotenv** (Variables de entorno)

### Frontend

- **React** (Librería de UI con Vite)
- **React Router DOM** (Navegación)
- **Context API** (Manejo de estado global de sesión)
- **CSS Modules/Inline** (Estilos personalizados)

### Base de Datos

- **MySQL** (Relacional)

---

## 📋 Prerrequisitos

Antes de instalar, asegúrate de tener:

1.  **Node.js** (v16 o superior) instalado.
2.  **MySQL Server** corriendo localmente (XAMPP, MAMP, o instalación nativa).
3.  **Git** (Opcional, para clonar el repositorio).

---

## ⚙️ Instalación y Configuración

Sigue estos pasos en orden:

### 1. Configuración de la Base de Datos

Abre tu gestor de base de datos (DataGrip, Workbench, phpMyAdmin) y ejecuta el siguiente script SQL para crear la estructura necesaria:

```sql
CREATE DATABASE IF NOT EXISTS ticketera_db;
USE ticketera_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('SUPER_USER', 'VENDEDOR', 'COMPRADOR') NOT NULL DEFAULT 'COMPRADOR',
    suscripcion_activa TINYINT(1) NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(255),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE boletos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nombre_zona VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    cantidad_total INT NOT NULL,
    cantidad_vendida INT DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    boleto_id INT NOT NULL,
    cantidad INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    uuid_unico VARCHAR(100),
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (boleto_id) REFERENCES boletos(id) ON DELETE CASCADE
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    uuid_unico VARCHAR(100) NOT NULL UNIQUE,
    estado ENUM('VALIDO', 'USADO') DEFAULT 'VALIDO',
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE
);
```

### 2. Configuración del Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de `/backend` y configura tus credenciales:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña
    DB_NAME=ticketera_db
    PORT=3001
    JWT_SECRET=tu_clave_secreta_super_segura
    ```

### 3. Configuración del Frontend

1.  Abre una **nueva terminal** y navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

---

## ▶️ Ejecución del Proyecto

Necesitarás tener **dos terminales** abiertas simultáneamente:

**Terminal 1 (Backend):**

```bash
cd backend
npm start
```

_Debería decir: "Servidor corriendo en el puerto 3001" y "Conexión exitosa a MySQL"._

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

_Abre el link que aparece (ej. http://localhost:5173) en tu navegador._

---

## 👤 Gestión de Usuarios (Cómo probar)

Para probar las funcionalidades de **Vendedor**, sigue estos pasos:

1.  Regístrate en la aplicación web como un usuario normal.
2.  Ve a tu base de datos y ejecuta el siguiente comando para darte permisos:
    ```sql
    UPDATE usuarios
    SET rol = 'VENDEDOR', suscripcion_activa = 1
    WHERE email = 'tu_email@ejemplo.com';
    ```
3.  Haz Logout y vuelve a hacer Login. ¡Ahora verás el botón "Crear Evento"!

---

## 📂 Estructura del Proyecto

```text
/ticketera-app
├── /backend          # API REST (Node.js/Express)
│   ├── /src
│   │   ├── /config       # Conexión DB
│   │   ├── /controllers  # Lógica de peticiones
│   │   ├── /middlewares  # Auth y seguridad
│   │   ├── /routes       # Definición de rutas
│   │   └── /services     # Lógica de negocio y SQL
├── /frontend         # Cliente Web (React/Vite)
│   ├── /src
│   │   ├── /components   # Navbar, Footer
│   │   ├── /context      # AuthContext (Estado global)
│   │   ├── /pages        # Vistas (Home, Login, CreateEvent)
│   │   └── /services     # Conexión con la API
```
