# Sistema de Gestión, Ejecución y Trazabilidad de Procedimientos de Desarrollo de Software
# Software Development Procedures Management, Execution, and Traceability System

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) | [🇬🇧 English](#-english)

---

<a name="-español"></a>
## 🇪🇸 Español

Prototipo funcional de aplicación web desarrollado como Trabajo Final de Grado (Ingeniería en Software - Universidad Siglo 21) por **Rodrigo Martín Quevedo**.

El sistema permite a pequeñas y medianas empresas (PyMEs) desarrolladoras de software gestionar, ejecutar y mejorar de manera trazable sus procedimientos de desarrollo, combinando la estandarización organizacional con la agilidad necesaria para registrar y evaluar desviaciones operativas sin burocracia excesiva.

---

### 🚀 1. Instalación y Ejecución desde Cero Absoluto

Esta guía está pensada para instalar y ejecutar el proyecto en una computadora limpia desde cero (Windows, macOS o Linux), sin necesidad de contenedores (Docker).

#### Paso 1: Instalar Git (Control de versiones)
Git es necesario para clonar el repositorio del proyecto.
1. Descarga el instalador desde el sitio oficial: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Ejecuta el instalador manteniendo las opciones por defecto (*Next* -> *Install*).
3. Verifica la instalación abriendo una terminal (CMD, PowerShell, Cmder o Terminal) y ejecutando:
   ```bash
   git --version
   ```

#### Paso 2: Instalar Node.js (Entorno de ejecución y gestor de paquetes npm)
Node.js es indispensable para ejecutar tanto el servidor Backend como el entorno de compilación del Frontend.
1. Descarga la versión **LTS (Long Term Support)** (v20 o superior recomendada) desde: [https://nodejs.org/](https://nodejs.org/)
2. Ejecuta el instalador y asegúrate de dejar marcada la opción *"Add to PATH"* (viene por defecto).
3. Reinicia tu terminal y verifica que tanto Node.js como `npm` estén instalados correctamente:
   ```bash
   node -v
   npm -v
   ```

#### Paso 3: Clonar el Repositorio
Abre tu terminal, ubícate en la carpeta donde deseas guardar el proyecto y ejecuta:
```bash
git clone https://github.com/rodrigo-quevedo/procedure-manager.git
cd procedure-manager
```

#### Paso 4: Configurar Variables de Entorno
Crea los archivos de variables de entorno necesarios para la comunicación entre el servidor, la base de datos y el almacenamiento de imágenes:

1. **En la carpeta `server/`**, crea un archivo llamado `.env` con las siguientes variables (ajusta los valores según tu entorno local o credenciales de Cloudflare R2):
   ```env
   PORT=5000
   JWT_SECRET=tu_clave_secreta_super_segura_aqui
   JWT_EXPIRES_IN=24h
   DB_PATH=./database.sqlite

   # Configuración de Cloudflare R2 (Almacenamiento de imágenes)
   R2_ACCOUNT_ID=tu_account_id_cloudflare
   R2_ACCESS_KEY_ID=tu_access_key_id
   R2_SECRET_ACCESS_KEY=tu_secret_access_key
   R2_BUCKET_NAME=nombre_de_tu_bucket
   R2_PUBLIC_URL=https://tu-dominio-r2.dev
   ```

2. **En la carpeta `client/`**, crea un archivo llamado `.env` apuntando a la URL de tu servidor local:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

#### Paso 5: Instalar Dependencias del Proyecto
Desde la **carpeta raíz** del proyecto (`procedure-manager/`), instala las dependencias de los workspaces (`shared`, `server` y `client`):
```bash
npm install
```
*(Nota: Si el proyecto no utiliza workspaces unificados en la raíz, instala las dependencias individualmente entrando a `cd server && npm install` y luego `cd ../client && npm install`).*

#### Paso 6: Ejecutar la Aplicación en Modo Desarrollo
Necesitarás **dos ventanas o pestañas de terminal** abiertas simultáneamente:

1. **Terminal 1 — Iniciar el Backend (Node.js + Express + SQLite):**
   ```bash
   cd server
   npm run dev
   ```
   *La base de datos SQLite se creará automáticamente si no existe y el servidor quedará escuchando en `http://localhost:5000`.*

2. **Terminal 2 — Iniciar el Frontend (React + Vite + TypeScript):**
   ```bash
   cd client
   npm run dev
   ```
   *La aplicación web estará disponible en tu navegador en `http://localhost:5173`.*

---

### 🛠️ 2. Stack Tecnológico y Arquitectura

El sistema sigue una arquitectura Cliente-Servidor desacoplada en cuatro capas:

* **Frontend:** React.js, TypeScript, Vite y Tailwind CSS (desplegado en producción en **Vercel**).
* **Backend:** Node.js, Express.js y TypeScript (desplegado en producción en **Render**).
* **Base de Datos Relacional:** SQLite alojado en disco persistente (Persistent Disk en Render).
* **Almacenamiento de Imágenes:** Cloudflare R2 (Object Storage con *Object Versioning* activado).
* **Seguridad:** Autenticación stateless mediante JSON Web Tokens (JWT), cifrado unidireccional de contraseñas con `bcrypt`, políticas de expiración de contraseñas (60 días), bloqueo automático ante 5 intentos fallidos y control de confidencialidad por proyecto (Público / Privado).

---

### 📁 3. Estructura del Proyecto

```text
procedure-manager/
├── client/                  # Aplicación Frontend (React + Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizables
│   │   ├── features/        # Módulos por dominio (auth, members, projects, procedures, executions)
│   │   ├── routes/          # Configuración de rutas protegidas por rol
│   │   └── services/        # Cliente HTTP y gestión de sesión
│   └── package.json
├── server/                  # API REST Backend (Node.js + Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── config/          # Conexión SQLite y cliente Cloudflare R2
│   │   ├── controllers/     # Lógica de negocio de Historias de Usuario
│   │   ├── middlewares/     # Verificación JWT y permisos por rol/confidencialidad
│   │   ├── models/          # Esquema relacional y consultas SQLite
│   │   └── routes/          # Definición de endpoints REST
│   └── package.json
├── shared/                  # Tipos e interfaces TypeScript compartidos (Single Source of Truth)
└── README.md
```

---

### ✨ 4. Funcionalidades Principales

* **Gestión de Acceso y Organización:** Registro de organizaciones, autenticación segura con expiración de claves y bloqueo preventivo, y administración de miembros con asignación de roles (**Organización**, **Líder Técnico** y **Desarrollador**).
* **Administración de Proyectos:** Creación y edición de proyectos con asignación de participantes y niveles de confidencialidad (**Público** o **Privado**) para resguardar Propiedad Intelectual y Secreto Comercial.
* **Creación y Ejecución de Procedimientos:** Creación y ejecución simultánea de nuevos flujos de trabajo (estructurados en *Pasos*, *Secciones* y *Campos* de texto, código o imagen) y ejecución paso a paso de procedimientos estándar existentes.
* **Gestión Ágil de Desviaciones:** Posibilidad de reordenar, agregar, editar o eliminar pasos durante una ejecución, exigiendo una justificación trazable del desvío.
* **Evaluación y Estandarización:** Revisión de ejecuciones por parte del Líder Técnico, envío de observaciones/correcciones al desarrollador y conversión automática de desviaciones aprobadas en nuevos procedimientos estándar para toda la organización.

---

### 📄 5. Licencia y Propiedad Intelectual

**Todos los Derechos Reservados (All Rights Reserved)**  
Copyright © 2026 Rodrigo Martín Quevedo.

Queda estrictamente prohibida la reproducción, copia, distribución, modificación, ingeniería inversa o uso comercial total o parcial de este código fuente y su documentación asociada sin la autorización previa y por escrito del autor. Este software fue desarrollado como prototipo académico en el marco del Trabajo Final de Grado de la carrera de Ingeniería en Software (Universidad Siglo 21).

---
---

<a name="-english"></a>
## 🇬🇧 English

Functional web application prototype developed as a Final Degree Project (Software Engineering - Universidad Siglo 21) by **Rodrigo Martín Quevedo**.

The system enables small and medium-sized software development enterprises (SMEs) to manage, execute, and traceably improve their software development procedures, combining organizational standardization with the agility required to log and evaluate operational deviations without excessive bureaucracy.

---

### 🚀 1. Installation and Setup from Scratch

This guide walks you through installing and running the project on a clean machine from absolute zero (Windows, macOS, or Linux), without requiring containers (Docker).

#### Step 1: Install Git (Version Control)
Git is required to clone the project repository.
1. Download the installer from the official website: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Run the installer keeping the default settings (*Next* -> *Install*).
3. Verify the installation by opening a terminal (CMD, PowerShell, Cmder, or Terminal) and running:
   ```bash
   git --version
   ```

#### Step 2: Install Node.js (Runtime Environment & npm Package Manager)
Node.js is required to run both the Backend server and the Frontend build environment.
1. Download the **LTS (Long Term Support)** version (v20 or higher recommended) from: [https://nodejs.org/](https://nodejs.org/)
2. Run the installer and make sure the *"Add to PATH"* option remains checked (enabled by default).
3. Restart your terminal and verify that both Node.js and `npm` are properly installed:
   ```bash
   node -v
   npm -v
   ```

#### Step 3: Clone the Repository
Open your terminal, navigate to the directory where you want to store the project, and run:
```bash
git clone https://github.com/rodrigo-quevedo/procedure-manager.git
cd procedure-manager
```

#### Step 4: Configure Environment Variables
Create the required environment variable files for communication between the server, database, and image storage:

1. **Inside the `server/` directory**, create a file named `.env` with the following variables (adjust values according to your local environment or Cloudflare R2 credentials):
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=24h
   DB_PATH=./database.sqlite

   # Cloudflare R2 Configuration (Image Object Storage)
   R2_ACCOUNT_ID=your_cloudflare_account_id
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=https://your-r2-domain.dev
   ```

2. **Inside the `client/` directory**, create a file named `.env` pointing to your local backend server URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

#### Step 5: Install Project Dependencies
From the **root directory** of the project (`procedure-manager/`), install all workspace dependencies (`shared`, `server`, and `client`):
```bash
npm install
```
*(Note: If root workspaces are not used, install dependencies individually by running `cd server && npm install` and then `cd ../client && npm install`).*

#### Step 6: Run the Application in Development Mode
You will need **two terminal windows or tabs** open simultaneously:

1. **Terminal 1 — Start the Backend (Node.js + Express + SQLite):**
   ```bash
   cd server
   npm run dev
   ```
   *The SQLite database file will be created automatically if it does not exist, and the server will listen on `http://localhost:5000`.*

2. **Terminal 2 — Start the Frontend (React + Vite + TypeScript):**
   ```bash
   cd client
   npm run dev
   ```
   *The web application will be accessible in your browser at `http://localhost:5173`.*

---

### 🛠️ 2. Tech Stack & Architecture

The system implements a decoupled four-tier Client-Server architecture:

* **Frontend:** React.js, TypeScript, Vite, and Tailwind CSS (deployed in production on **Vercel**).
* **Backend:** Node.js, Express.js, and TypeScript (deployed in production on **Render**).
* **Relational Database:** SQLite stored on a persistent volume (Persistent Disk on Render).
* **Image Storage:** Cloudflare R2 (Object Storage Service with *Object Versioning* enabled).
* **Security:** Stateless authentication via JSON Web Tokens (JWT), one-way password hashing with `bcrypt`, 60-day password expiration policy, automatic account lockout after 5 failed login attempts, and project-level confidentiality access control (Public / Private).

---

### 📁 3. Project Structure

```text
procedure-manager/
├── client/                  # Frontend Application (React + Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Domain-driven modules (auth, members, projects, procedures, executions)
│   │   ├── routes/          # Role-based protected routing
│   │   └── services/        # HTTP client and session management
│   └── package.json
├── server/                  # Backend REST API (Node.js + Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── config/          # SQLite connection and Cloudflare R2 client
│   │   ├── controllers/     # Business logic for User Stories
│   │   ├── middlewares/     # JWT verification and role/confidentiality guards
│   │   ├── models/          # Relational schema and SQLite queries
│   │   └── routes/          # REST API endpoints
│   └── package.json
├── shared/                  # Shared TypeScript types and interfaces (Single Source of Truth)
└── README.md
```

---

### ✨ 4. Key Features

* **Access & Organization Management:** Organization self-registration, secure user authentication (with password expiration and brute-force lockout), and member management with role assignment (**Organization**, **Technical Leader**, and **Developer**).
* **Project Administration:** Project creation and management with member assignment and confidentiality levels (**Public** or **Private**) to safeguard Intellectual Property and Trade Secrets.
* **Procedure Creation & Execution:** Simultaneous creation and execution of new workflows (structured into *Steps*, *Sections*, and *Fields* supporting text, code, or images) alongside step-by-step execution of existing standard procedures.
* **Agile Deviation Tracking:** Ability to reorder, add, edit, or delete steps during execution while requiring a traceable justification for every deviation.
* **Evaluation & Standardization:** Technical Leader review of completed executions, submission of actionable corrections to developers, and automatic promotion of approved deviations into new organization-wide standard procedures.

---

### 📄 5. License & Intellectual Property

**All Rights Reserved**  
Copyright © 2026 Rodrigo Martín Quevedo.

Unauthorized reproduction, copying, distribution, modification, reverse engineering, or commercial use of this source code and its associated documentation, in whole or in part, is strictly prohibited without the prior written permission of the author. This software was developed as an academic prototype for the Software Engineering Final Degree Project at Universidad Siglo 21.