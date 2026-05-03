# MediVet

MediVet es un sistema web de gestion veterinaria orientado a centralizar la operacion de una clinica o consultorio. La aplicacion permite registrar usuarios, administrar perfiles, dar de alta mascotas, consultar cartillas medicas, gestionar servicios veterinarios y agendar citas entre clientes y veterinarios.

El proyecto esta dividido en dos bloques principales:

- Un frontend en Next.js que concentra toda la experiencia de usuario.
- Un backend en Flask + MariaDB que expone la API y persiste la informacion del dominio.

## Objetivo del proyecto

MediVet busca digitalizar procesos comunes de una veterinaria:

- Registro e inicio de sesion de clientes y veterinarios.
- Administracion de perfiles de usuario.
- Alta y consulta de mascotas.
- Gestion de cartillas de vacunacion y atenciones.
- Catalogo de servicios veterinarios.
- Relacion entre veterinarios y servicios ofertados.
- Agenda y cancelacion de citas.

## Stack tecnologico

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Componentes UI basados en Radix UI
- Sonner para notificaciones

### Backend

- Flask
- MariaDB
- python-dotenv
- Flask-CORS
- Pillow para manejo de imagenes de perfil

## Arquitectura general

La aplicacion sigue una arquitectura cliente-servidor:

1. El frontend en Next.js renderiza las vistas y maneja el estado principal de la aplicacion.
2. El frontend consume la API Flask usando la variable `NEXT_PUBLIC_API_URL`.
3. El backend procesa la logica de negocio y accede a MariaDB.
4. El endpoint `GET /api/bootstrap` entrega gran parte de la informacion inicial que usa la app al cargar.

## Estructura del proyecto

```text
Veterinaria_new/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── bootstrap/
│   │   ├── cartillas/
│   │   └── mascotas/
│   ├── citas/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── backend/
│   ├── backend.py
│   ├── requirements.txt
│   ├── schema.sql
│   ├── README.md
│   ├── .env
│   ├── .env.example
│   └── uploads/
├── components/
│   ├── ui/
│   ├── admin-servicios-view.tsx
│   ├── admin-veterinario-servicio-view.tsx
│   ├── app-sidebar.tsx
│   ├── calendario-view.tsx
│   ├── cartillas-view.tsx
│   ├── citas-view.tsx
│   ├── cliente-view.tsx
│   ├── dashboard-view.tsx
│   ├── lista-veterinarios-view.tsx
│   ├── login-view.tsx
│   ├── settings-view.tsx
│   └── veterinario-view.tsx
├── hooks/
├── lib/
│   ├── types.ts
│   └── utils.ts
├── public/
├── styles/
├── REQUISITOS_INSTALACION.md
├── package.json
└── tsconfig.json
```

## Modulos principales del frontend

### `app/page.tsx`

Es el punto de entrada principal de la aplicacion. Aqui se concentra el estado global de alto nivel:

- usuario autenticado
- vista actual
- servicios
- mascotas
- cartillas
- tratamientos
- veterinarios por servicio
- agenda de veterinarios
- citas agendadas

Tambien contiene los handlers que consumen la API para crear, actualizar o eliminar recursos.

### `components/dashboard-view.tsx`

Es la portada publica de MediVet. Presenta la propuesta del sistema, los servicios destacados y el acceso al flujo de autenticacion.

### `components/login-view.tsx`

Maneja:

- inicio de sesion
- registro de nuevos usuarios
- seleccion de rol entre cliente y veterinario

Consume directamente los endpoints `/login` y `/register`.

### `components/cliente-view.tsx`

Vista principal del cliente. Permite revisar sus mascotas, consultar informacion asociada y agregar nuevas mascotas.

### `components/veterinario-view.tsx`

Vista principal del veterinario. Se enfoca en la gestion de cartillas y atenciones medicas de mascotas.

### `components/citas-view.tsx`

Muestra las citas del usuario en formato calendario y permite cancelarlas.

### `components/lista-veterinarios-view.tsx`

Presenta los servicios disponibles, los veterinarios asociados a cada servicio y el flujo de agendamiento de citas.

### `components/settings-view.tsx`

Administra el perfil del usuario:

- datos personales
- correo
- nombre de usuario
- telefono
- foto de perfil

Consume endpoints de perfil y carga de imagenes.

### `components/admin-servicios-view.tsx`

Modulo administrativo para CRUD de servicios veterinarios.

### `components/admin-veterinario-servicio-view.tsx`

Gestiona la relacion entre veterinarios y servicios, incluyendo precios y datos de contacto.

### `components/cartillas-view.tsx`

Pantalla documental para consultar el historial medico de las mascotas y revisar cartillas.

### `components/calendario-view.tsx`

Vista de agenda orientada al veterinario. Actualmente funciona como modulo visual de apoyo para la gestion de actividades del dia.

### `components/app-sidebar.tsx`

Sidebar de navegacion que organiza el acceso a las distintas vistas segun el contexto del usuario.

### `components/ui/`

Contiene la libreria de componentes reutilizables del sistema: botones, tablas, dialogs, inputs, calendarios, selects, alerts, badges y otros bloques base de interfaz.

## Modulos principales del backend

### `backend/backend.py`

Es el servidor principal Flask. En este archivo se concentra:

- configuracion general de Flask
- CORS
- conexion a la base de datos
- endpoints REST
- utilidades de validacion
- carga de archivos de imagen

Actualmente el backend esta organizado como un archivo monolitico, lo que facilita ubicar rapidamente la logica, aunque a futuro podria separarse por modulos o blueprints.

### `backend/schema.sql`

Define el esquema inicial de la base de datos MariaDB con las tablas del dominio veterinario.

### `backend/uploads/`

Almacena recursos subidos por usuarios, especialmente fotos de perfil.

### `backend/.env` y `backend/.env.example`

Contienen la configuracion del backend, incluyendo puerto, origenes permitidos y credenciales de base de datos.

## Endpoints principales de la API

Los endpoints identificados en `backend/backend.py` son:

- `GET /api/health`: verificacion de salud del backend.
- `GET /api/bootstrap`: carga inicial de datos para la aplicacion.
- `POST /api/login`: autenticacion de usuarios.
- `POST /api/register`: registro de nuevos usuarios.
- `GET /api/perfil/<user_id>`: consulta de perfil.
- `PUT /api/perfil/<user_id>`: actualizacion de perfil.
- `POST /api/foto_perfil/<user_id>`: carga de foto de perfil.
- `POST /api/mascotas`: alta de mascotas.
- `POST /api/cartillas`: creacion de cartillas.
- `PUT /api/cartillas/<cartilla_id>`: actualizacion de cartillas.
- `POST /api/citas`: registro de citas.
- `DELETE /api/citas/<cita_id>`: cancelacion de citas.
- `GET /api/servicios`: listado de servicios.
- `POST /api/servicios`: alta de servicios.
- `PUT /api/servicios/<servicio_id>`: edicion de servicios.
- `DELETE /api/servicios/<servicio_id>`: eliminacion de servicios.
- `PUT /api/veterinario_servicio/<veterinario_servicio_id>`: actualizacion de la relacion veterinario-servicio.

## Tipos y modelo de datos del frontend

El archivo `lib/types.ts` define las entidades principales que usa la interfaz:

- `Usuario`
- `Perfil_Usuario`
- `Cliente`
- `Veterinario`
- `Mascotas`
- `Servicios`
- `Cartilla_Vacunacion`
- `Tratamientos`
- `CitaAgendada`
- `VeterinarioAgenda`
- `VeterinarioServicio`

Estos tipos sirven como contrato entre la UI y la informacion que devuelve el backend.

## Flujo funcional resumido

### Usuario cliente

1. Se registra o inicia sesion.
2. Consulta su informacion y actualiza su perfil.
3. Registra mascotas.
4. Explora servicios y veterinarios disponibles.
5. Agenda y cancela citas.
6. Consulta cartillas e historial de atencion.

### Usuario veterinario

1. Se registra o inicia sesion.
2. Actualiza su perfil y foto.
3. Gestiona cartillas medicas.
4. Consulta agenda y citas.
5. Administra los servicios que ofrece o con los que esta relacionado.

## Configuracion de variables de entorno

### Frontend

Crea un archivo `.env.local` en la raiz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Nota importante: el frontend depende de esta variable para construir las URLs del API. Si no existe, las llamadas se convierten en rutas tipo `undefined/login` o `undefined/bootstrap`.

### Backend

Puedes basarte en `backend/.env.example`. Un ejemplo compatible con esta repo es:

```env
FLASK_APP=backend.py
FLASK_ENV=development
SECRET_KEY=MediVet_5
CORS_ORIGIN=http://localhost:3000
BACKEND_PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=admin482
DB_NAME=MediVet
```

## Ejecucion local

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Preparar la base de datos

Crea la base `MediVet` en MariaDB y ejecuta el esquema:

```bash
mysql -u admin -p -e "CREATE DATABASE IF NOT EXISTS MediVet;"
mysql -u admin -p MediVet < backend/schema.sql
```

### 4. Levantar backend

```bash
cd backend
source .venv/bin/activate
python backend.py
```

### 5. Levantar frontend

```bash
npm run dev
```

## Puertos esperados

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## Notas de implementacion

- La mayor parte de la logica del frontend vive en `app/page.tsx`, por lo que hoy funciona como contenedor principal de estado y orquestacion.
- El backend usa una conexion MariaDB configurada en el codigo y, en parte, mediante variables de entorno.
- Existen route handlers dentro de `app/api/`, pero buena parte del frontend consume tambien el backend Flask de forma directa usando `NEXT_PUBLIC_API_URL`.
- El proyecto incluye componentes UI reutilizables suficientes para seguir extendiendo vistas sin rehacer la base visual.

## Documentacion complementaria

- [REQUISITOS_INSTALACION.md](./REQUISITOS_INSTALACION.md): guia detallada de instalacion.
- [backend/README.md](./backend/README.md): notas especificas del backend.

## Estado actual del proyecto

La repo ya cuenta con una base funcional para:

- autenticacion
- perfiles
- mascotas
- cartillas
- servicios
- citas
- relacion veterinario-servicio

La siguiente evolucion natural seria desacoplar la logica del frontend en hooks o contextos, y dividir el backend por dominios para facilitar mantenimiento y pruebas.
