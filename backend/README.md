# Backend Flask + MariaDB para React

El backend ahora esta simplificado al estilo del ejemplo que compartiste:

- `app.py` contiene la app Flask
- `conectar_bd()` abre la conexion a MariaDB
- los endpoints responden JSON para tu frontend React
- `schema.sql` contiene las tablas base del proyecto

## Estructura

```text
backend/
├── app.py
├── requirements.txt
├── .env.example
└── schema.sql
```

## 1. Instalar dependencias

```bash
cd /Users/pinkuuu/Documents/Veterinaria/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Configurar variables

```bash
cp .env.example .env
```

Ejemplo:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=change-this-secret
CORS_ORIGIN=http://localhost:3000
BACKEND_PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=medivet
```

## 3. Crear tablas en MariaDB

Corre el archivo [schema.sql](/Users/pinkuuu/Documents/Veterinaria/backend/schema.sql) en MariaDB.

Ejemplo:

```bash
mysql -u root -p < /Users/pinkuuu/Documents/Veterinaria/backend/schema.sql
```

## 4. Levantar Flask

```bash
cd /Users/pinkuuu/Documents/Veterinaria/backend
source .venv/bin/activate
python app.py
```

## 5. Endpoints

- `GET /api/health`
- `GET /api/bootstrap`
- `POST /api/login`
- `POST /api/register`
- `POST /api/mascotas`
- `POST /api/cartillas`
- `PUT /api/cartillas/<id>`

## 6. Login esperado

Peticion:

```json
{
  "email": "cliente@digicom.com",
  "contraseña": "cliente123"
}
```

Respuesta:

```json
{
  "user": {
    "id": 1,
    "nombre_usuario": "juan_perez",
    "email": "cliente@digicom.com",
    "role_id": 1
  },
  "fullName": "Juan Perez Gonzalez"
}
```

## 7. Como lo usas con React

Tu frontend puede llamar directo a:

- `http://localhost:5000/api/login`
- `http://localhost:5000/api/register`
- `http://localhost:5000/api/bootstrap`

Si quieres, el siguiente paso es conectar el frontend actual para que deje de usar mock y consuma este Flask.
