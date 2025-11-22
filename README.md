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
3.  **Git** (Opcional, para clonar).

---

## ⚙️ Instalación y Configuración

Sigue estos pasos en orden:

### 1. Configuración de la Base de Datos

Abre tu gestor de base de datos (DataGrip, Workbench, phpMyAdmin) y ejecuta el siguiente script SQL para crear la estructura necesaria:

```sql
CREATE DATABASE IF NOT EXISTS ticketera_db;
USE ticketera_db;

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('SUPER_USER', 'VENDEDOR', 'COMPRADOR') NOT NULL DEFAULT 'COMPRADOR',
    suscripcion_activa TINYINT(1) NOT NULL DEFAULT 0, -- 0: Inactiva, 1: Activa
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Eventos
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(255),
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Boletos
CREATE TABLE boletos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nombre_zona VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    cantidad_total INT NOT NULL,
    cantidad_vendida INT DEFAULT 0,
    CHECK (cantidad_vendida <= cantidad_total),
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);
```
