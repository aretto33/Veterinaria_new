# Requisitos de instalacion del proyecto MediVet

Este proyecto necesita tres componentes para funcionar correctamente:

- Frontend con Next.js
- Backend con Flask
- Base de datos MariaDB

## Requisitos previos

Instala estas herramientas en tu equipo:

- Node.js 20 o superior
- npm 10 o superior
- Python 3.11 o superior
- pip
- MariaDB 10.6 o superior

## Si alguien descarga el proyecto

Si el proyecto se descarga como `.zip`, primero hay que descomprimirlo y entrar a la carpeta del proyecto:

```bash
cd /ruta/donde/descomprimiste/Veterinaria
```

Si el proyecto se obtiene con Git, los comandos serian:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Veterinaria
```

Despues de descargarlo, estos son los comandos minimos de instalacion:

### 1. Instalar frontend

```bash
cd /Users/pinkuuu/Documents/Veterinaria
npm install
```

### 2. Instalar backend

```bash
cd /Users/pinkuuu/Documents/Veterinaria/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Preparar base de datos

```bash
mysql -u admin -p -e "CREATE DATABASE IF NOT EXISTS MediVet;"
mysql -u admin -p MediVet < /Users/pinkuuu/Documents/Veterinaria/backend/schema.sql
```

### 4. Ejecutar el proyecto

Terminal 1, backend:

```bash
cd /Users/pinkuuu/Documents/Veterinaria/backend
source .venv/bin/activate
python backend.py
```

Terminal 2, frontend:

```bash
cd /Users/pinkuuu/Documents/Veterinaria
npm run dev
```

## Variables de entorno

### Frontend

Crea un archivo `.env.local` en la raiz del proyecto con:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend

Crea un archivo `backend/.env` con valores similares a estos:

```env
FLASK_APP=backend.py
FLASK_ENV=development
SECRET_KEY=change-this-secret
CORS_ORIGIN=http://localhost:3000
BACKEND_PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin482
DB_NAME=MediVet
```

Nota: actualmente `backend/backend.py` usa credenciales fijas dentro del codigo para la conexion a MariaDB:

- host: `localhost`
- port: `3306`
- user: `admin`
- password: `admin482`
- database: `MediVet`

Si quieres que el `.env` controle la conexion, habria que ajustar ese archivo.

## Instalacion del frontend

Desde la raiz del proyecto:

```bash
cd /Users/pinkuuu/Documents/Veterinaria
npm install
```

Para iniciar el frontend:

```bash
npm run dev
```

El frontend quedara disponible en:

```text
http://localhost:3000
```

## Instalacion del backend

Desde la carpeta `backend`:

```bash
cd /Users/pinkuuu/Documents/Veterinaria/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Para iniciar el backend:

```bash
python backend.py
```

El backend quedara disponible en:

```text
http://localhost:5000
```

## Base de datos

Crea la base de datos `MediVet` en MariaDB y luego ejecuta el esquema:

```bash
mysql -u admin -p MediVet < /Users/pinkuuu/Documents/Veterinaria/backend/schema.sql
```

Si la base de datos no existe, puedes crearla primero:

```sql
CREATE DATABASE MediVet;
```

## Orden recomendado para levantar el proyecto

1. Iniciar MariaDB.
2. Crear la base de datos `MediVet`.
3. Ejecutar `schema.sql`.
4. Instalar dependencias del backend.
5. Iniciar el backend.
6. Instalar dependencias del frontend.
7. Iniciar el frontend.

## Archivos importantes

- `package.json`: dependencias del frontend
- `backend/requirements.txt`: dependencias del backend
- `backend/schema.sql`: estructura inicial de base de datos
- `backend/backend.py`: servidor Flask principal
