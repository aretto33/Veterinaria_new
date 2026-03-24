import os
import mariadb
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, Response
from PIL import Image, UnidentifiedImageError
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-this-secret")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads", "perfiles")
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
#Cross-Origin Resource Sharing (CORS)
CORS(
    app, 
    resources={r"/api/*": {"origins": os.getenv("CORS_ORIGIN", "http://localhost:3000")}},
    supports_credentials=True,
)

#Conexión a la base de datos 
def conectar_bd():
    try:
        conn = mariadb.connect(
            host="localhost",
            port=3306,
            user="admin",
            password="admin482",
            database="MediVet"
        )
        return conn, conn.cursor()
    except mariadb.Error as error:
        print("Error de conexion:", error)
        return None, None


def validation_error(message, status=400):
    return jsonify({"message": message}), status


def get_role_id(data):
    role_value = data.get("role_id", data.get("rol_id"))
    if role_value in (None, ""):
        raise ValueError("role_id")
    return int(role_value)


def split_full_name(full_name):
    cleaned = str(full_name or "").strip()
    if not cleaned:
        return "", ""

    parts = cleaned.split()
    if len(parts) == 1:
        return parts[0], ""

    return parts[0], " ".join(parts[1:])


def is_allowed_image(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


#Funcion para optener el nombre completo de la persona
def get_full_name(cursor, user_id):
    cursor.execute(
        """
        SELECT nombre, apellidos
        FROM Perfil_Usuario
        WHERE fk_usuario = %s
        """,
        (user_id,),
    )
    profile = cursor.fetchone()
    if not profile:
        return "Usuario"

    return f"{profile[0]} {profile[1]}".strip()


def get_user_related_ids(cursor, user_id, role_id):
    client_id = None
    vet_id = None

    if role_id == 1:
        cursor.execute("SELECT pk_cliente FROM Cliente WHERE fk_usuario = %s", (user_id,))
        row = cursor.fetchone()
        client_id = row[0] if row else None
    elif role_id == 2:
        cursor.execute("SELECT pk_veterinario FROM Veterinario WHERE fk_usuario = %s", (user_id,))
        row = cursor.fetchone()
        vet_id = row[0] if row else None

    return client_id, vet_id


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

#---- Funcion de inicio 
@app.get("/api/bootstrap")
def bootstrap():
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            SELECT pk_servicio, nombre, descripcion, precio
            FROM Servicios
            ORDER BY pk_servicio
            """
        )
        servicios = [
            {
                "pk_servicio": row[0],
                "nombre": row[1],
                "descripción": row[2],
                "precio": float(row[3]),
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT pk_mascota, nombre, especie, raza, fecha_nacimiento, fk_cliente
            FROM Mascotas
            ORDER BY pk_mascota
            """
        )
        mascotas = [
            {
                "pk_mascotas": row[0],
                "id": row[0],
                "Nombre": row[1],
                "Especie": row[2],
                "Raza": row[3],
                "Fecha_Nacimiento": row[4] or "",
                "fk_cliente": row[5],
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT pk_cartilla, fecha_atencion, peso, diagnostico, receta_medicamento,
                   fk_mascota, fk_veterinario, fk_tratamiento
            FROM Cartilla_Vacunacion
            ORDER BY pk_cartilla
            """
        )
        cartillas = [
            {
                "id": row[0],
                "fecha_atencion": row[1],
                "peso": float(row[2]) if row[2] is not None else 0,
                "diagnostico": row[3],
                "receta_medicamento": row[4],
                "fk_mascota": row[5],
                "fk_veterinanio": row[6],
                "fk_desparacitacio_vacuna": row[7],
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT vd.pk_tratamiento, vd.fecha_aplicacion, vd.fk_medicamento, vd.fk_servicio,
                   m.nombre, m.descripcion, s.nombre
            FROM Vacuna_Desparacitacion vd
            LEFT JOIN Medicamentos m ON m.pk_medicamento = vd.fk_medicamento
            LEFT JOIN Servicios s ON s.pk_servicio = vd.fk_servicio
            ORDER BY vd.pk_tratamiento
            """
        )
        tratamientos = [
            {
                "id_tratamiento": row[0],
                "fecha_aplicacion": row[1],
                "fk_medicamento": row[2],
                "fk_servicio": row[3],
                "nombre_producto": row[4] or "Tratamiento",
                "descripcion": row[5] or "",
                "servicio_nombre": row[6] or "",
                "tipo": row[6] or "",
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT vs.fk_veterinario, vs.fk_servicio, vs.precio_vet,
                   p.nombre, p.apellidos, v.especialidad, p.telefono, v.direcc_consultorio
            FROM Veterinario_Servicio vs
            INNER JOIN Veterinario v ON v.pk_veterinario = vs.fk_veterinario
            INNER JOIN Perfil_Usuario p ON p.fk_usuario = v.fk_usuario
            ORDER BY vs.fk_servicio, vs.fk_veterinario
            """
        )
        veterinario_servicios = [
            {
                "fk_veterinario": row[0],
                "fk_servicio": row[1],
                "precio": float(row[2]) if row[2] is not None else 0,
                "veterinario_nombre": f"{row[3]} {row[4]}".strip(),
                "especialidad": row[5] or "",
                "telefono": str(row[6] or ""),
                "direccion": row[7] or "",
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT fk_veterinario, dia, hora_inicio, hora_fin, disponible
            FROM Agenda_Veterinario
            ORDER BY fk_veterinario, pk_agenda
            """
        )
        agenda_veterinarios = [
            {
                "fk_veterinario": row[0],
                "dia": row[1],
                "hora_inicio": str(row[2]),
                "hora_fin": str(row[3]),
                "disponible": bool(row[4]),
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT c.pk_cita, c.fecha_hora, c.estado, c.motivo_consulta,
                   c.fk_cliente, c.fk_veterinario, c.fk_mascota,
                   m.nombre,
                   p.nombre, p.apellidos,
                   v.direcc_consultorio,
                   s.nombre
            FROM Citas c
            INNER JOIN Mascotas m ON m.pk_mascota = c.fk_mascota
            INNER JOIN Veterinario v ON v.pk_veterinario = c.fk_veterinario
            INNER JOIN Perfil_Usuario p ON p.fk_usuario = v.fk_usuario
            LEFT JOIN Veterinario_Servicio vs ON vs.fk_veterinario = c.fk_veterinario
            LEFT JOIN Servicios s ON s.pk_servicio = vs.fk_servicio
            ORDER BY c.fecha_hora DESC
            """
        )
        citas = [
            {
                "id": row[0],
                "fecha_hora": row[1],
                "estado": row[2],
                "motivo": row[3],
                "fk_cliente": row[4],
                "fk_veterinario": row[5],
                "fk_mascota": row[6],
                "mascota": row[7],
                "veterinario": f"{row[8]} {row[9]}".strip(),
                "direccion": row[10] or "",
                "servicio": row[11] or "Consulta",
            }
            for row in cursor.fetchall()
        ]

        cursor.execute("SELECT pk_usuario FROM Usuario ORDER BY pk_usuario")
        nombres_usuarios = {}
        for row in cursor.fetchall():
            nombres_usuarios[row[0]] = get_full_name(cursor, row[0])

        return jsonify(
            {
                "servicios": servicios,
                "mascotas": mascotas,
                "cartillas": cartillas,
                "tratamientos": tratamientos,
                "veterinarioServicios": veterinario_servicios,
                "agendaVeterinarios": agenda_veterinarios,
                "citas": citas,
                "nombresUsuarios": nombres_usuarios,
            }
        )
    except mariadb.Error as error:
        return validation_error(f"Error al cargar datos: {error}", 500)
    finally:
        conn.close()

#-----------------------------------------------------------------------------
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("contraseña", "")

    if not email or not password:
        return validation_error("Email y contraseña son obligatorios")

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            SELECT pk_usuario, nombre_usuario, email, contraseña_hash, fk_rol
            FROM Usuario
            WHERE email = %s
            """,
            (email,),
        )
        user = cursor.fetchone()

        if not user or not check_password_hash(user[3], password):
            return validation_error(
                "Credenciales invalidas. Verifica tu email y contraseña.", 401
            )

        client_id, vet_id = get_user_related_ids(cursor, user[0], user[4])

        return jsonify(
            {
                "user": {
                    "id": user[0],
                    "nombre_usuario": user[1],
                    "email": user[2],
                    "role_id": user[4],
                    "cliente_id": client_id,
                    "veterinario_id": vet_id,
                },
                "fullName": get_full_name(cursor, user[0]),
            }
        )
    except mariadb.Error as error:
        return validation_error(f"Error al iniciar sesion: {error}", 500)
    finally:
        conn.close()


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    required_fields = [
        "role_id",
        "email",
        "contraseña",
        "telefono",
        "Nombre",
        "Apellidos",
    ]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if data.get("role_id") in (None, "") and data.get("rol_id") not in (None, ""):
        missing_fields = [field for field in missing_fields if field != "role_id"]
    if missing_fields:
        return validation_error(
            f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        email = data["email"].strip().lower()
        role_id = get_role_id(data)

        cursor.execute("SELECT pk_usuario FROM Usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            return validation_error("Este email ya esta registrado")

        password_hash = generate_password_hash(data["contraseña"])

        cursor.execute(
            """
            INSERT INTO Usuario (email, contraseña_hash, fk_rol)
            VALUES (%s, %s, %s)
            """,
            (
                email,
                password_hash,
                role_id,
            ),
        )
        user_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO Perfil_Usuario (fk_usuario, telefono, nombre, apellidos)
            VALUES (%s, %s, %s, %s)
            """,
            (
                user_id,
                str(data["telefono"]).strip(),
                data["Nombre"].strip(),
                data["Apellidos"].strip(),
            ),
        )

        if role_id == 2:
            cursor.execute(
                """
                INSERT INTO Veterinario (
                    fk_usuario, cedula_prof, direcc_consultorio, especialidad
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    user_id,
                    str(data.get("cedula_prof", "")).strip(),
                    str(data.get("direcc_consultorio", "")).strip(),
                    str(data.get("Especialidad", "")).strip(),
                ),
            )
        else:
            cursor.execute(
                """
                INSERT INTO Cliente (fk_usuario)
                VALUES (%s)
                """,
                (user_id,),
            )

        conn.commit()
        return jsonify({"message": "Registro exitoso. Ahora puedes iniciar sesion."}), 201
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo registrar: {error}", 500)
    finally:
        conn.close()

@app.get("/api/perfil/<int:user_id>")
def get_profile(user_id):
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            SELECT u.pk_usuario, u.nombre_usuario, u.email, u.fk_rol,
                   p.telefono, p.nombre, p.apellidos, p.foto_perfil
            FROM Usuario u
            LEFT JOIN Perfil_Usuario p ON p.fk_usuario = u.pk_usuario
            WHERE u.pk_usuario = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()

        if not row:
            return validation_error("Usuario no encontrado", 404)

        return jsonify(
            {
                "id": row[0],
                "nombre_usuario": row[1],
                "email": row[2],
                "role_id": row[3],
                "telefono": str(row[4] or ""),
                "Nombre": row[5] or "",
                "Apellidos": row[6] or "",
                "foto_perfil": row[7] or "",
            }
        )
    except mariadb.Error as error:
        return validation_error(f"No se pudo cargar el perfil: {error}", 500)
    finally:
        conn.close()


@app.put("/api/perfil/<int:user_id>")
def update_profile(user_id):
    data = request.get_json(silent=True) or {}
    full_name = data.get("fullName", "")
    nombre, apellidos = split_full_name(full_name)
    email = str(data.get("email", "")).strip().lower()
    telefono = str(data.get("telefono", "")).strip()
    nombre_usuario = str(data.get("nombre_usuario", "")).strip()
    

    if not nombre_usuario:
        return validation_error("El nombre de usuario es obligatorio")

    if not email:
        return validation_error("El email es obligatorio")

    if not nombre:
        return validation_error("El nombre completo es obligatorio")

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute("SELECT pk_usuario FROM Usuario WHERE pk_usuario = %s", (user_id,))
        if not cursor.fetchone():
            return validation_error("Usuario no encontrado", 404)

        cursor.execute(
            "SELECT pk_usuario FROM Usuario WHERE email = %s AND pk_usuario <> %s",
            (email, user_id),
        )
        if cursor.fetchone():
            return validation_error("Este email ya esta registrado")

        cursor.execute(
            """
            UPDATE Usuario
            SET nombre_usuario = %s, email = %s
            WHERE pk_usuario = %s
            """,
            (nombre_usuario, email, user_id),
        )

        cursor.execute(
            "SELECT pk_perfil FROM Perfil_Usuario WHERE fk_usuario = %s",
            (user_id,),
        )
        profile = cursor.fetchone()

        if profile:
            cursor.execute(
                """
                UPDATE Perfil_Usuario
                SET telefono = %s, nombre = %s, apellidos = %s
                WHERE fk_usuario = %s
                """,
                (telefono or None, nombre, apellidos, user_id),
            )
        else:
            cursor.execute(
                """
                INSERT INTO Perfil_Usuario (fk_usuario, telefono, nombre, apellidos)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, telefono or None, nombre, apellidos),
            )

        conn.commit()
        return jsonify(
            {
                "message": "Perfil actualizado correctamente",
                "profile": {
                    "id": user_id,
                    "nombre_usuario": nombre_usuario,
                    "email": email,
                    "telefono": telefono,
                    "Nombre": nombre,
                    "Apellidos": apellidos,
                    "fullName": f"{nombre} {apellidos}".strip(),
                },
            }
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo actualizar el perfil: {error}", 500)
    finally:
        conn.close()


@app.post("/api/foto_perfil/<int:user_id>")
def subir_perfil(user_id):
    archivo = request.files.get("foto") or request.files.get("foto_perfil")
    if not archivo or archivo.filename == "":
        return validation_error("Debes seleccionar una imagen")

    filename_secure = secure_filename(archivo.filename)
    if not is_allowed_image(filename_secure):
        return validation_error("Formato de imagen no permitido. Usa png, jpg, jpeg o webp.")

    # Leer bytes y validar tamaño
    foto_bytes = archivo.read()
    if not foto_bytes:
        return validation_error("Archivo vacío")
    if len(foto_bytes) > MAX_IMAGE_SIZE_BYTES:
        return validation_error("La imagen excede el tamaño máximo permitido (5 MB).", 413)

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute("SELECT pk_usuario FROM Usuario WHERE pk_usuario = %s", (user_id,))
        if not cursor.fetchone():
            return validation_error("Usuario no encontrado", 404)

        # Intentar guardar copia en disco (opcional, para compatibilidad)
        try:
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            extension = filename_secure.rsplit(".", 1)[1].lower() if "." in filename_secure else "jpg"
            disk_filename = f"perfil_{user_id}.{extension}"
            disk_path = os.path.join(UPLOAD_FOLDER, disk_filename)
            with open(disk_path, "wb") as f:
                f.write(foto_bytes)
        except Exception:
            disk_path = None

        # Guardar bytes en BD (columna foto_perfil debe ser BLOB)
        cursor.execute(
            """
            UPDATE Perfil_Usuario
            SET foto_perfil = %s
            WHERE fk_usuario = %s
            """,
            (foto_bytes, user_id),
        )
        conn.commit()

        return jsonify(
            {
                "message": "Foto de perfil actualizada correctamente",
                "foto_url": f"/api/foto_perfil/{user_id}"
            }
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo actualizar la foto de perfil: {error}", 500)
    finally:
        conn.close()

@app.post("/api/mascotas")
def create_mascota():
    data = request.get_json(silent=True) or {}
    required_fields = ["Nombre", "Especie", "Raza", "fk_cliente"]
    missing_fields = [field for field in required_fields if data.get(field) in (None, "")]
    if missing_fields:
        return validation_error(
            f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            INSERT INTO Mascotas (nombre, especie, raza, fecha_nacimiento, fk_cliente)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data["Nombre"].strip(),
                data["Especie"].strip(),
                data["Raza"].strip(),
                data.get("Fecha_Nacimiento", ""),
                int(data["fk_cliente"]),
            ),
        )
        mascota_id = cursor.lastrowid
        conn.commit()

        return (
            jsonify(
                {
                    "id": mascota_id,
                    "Nombre": data["Nombre"].strip(),
                    "Especie": data["Especie"].strip(),
                    "Raza": data["Raza"].strip(),
                    "Fecha_Nacimiento": data.get("Fecha_Nacimiento", ""),
                    "fk_cliente": int(data["fk_cliente"]),
                }
            ),
            201,
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo registrar la mascota: {error}", 500)
    finally:
        conn.close()


@app.post("/api/cartillas")
def create_cartilla():
    data = request.get_json(silent=True) or {}
    required_fields = [
        "fk_mascota",
        "fecha_atencion",
        "peso",
        "diagnostico",
        "receta_medicamento",
        "fk_veterinanio",
        "fk_desparacitacio_vacuna",
    ]
    missing_fields = [field for field in required_fields if data.get(field) in (None, "")]
    if missing_fields:
        return validation_error(
            f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            INSERT INTO cartillas_vacunacion (
                fecha_atencion, peso, diagnostico, receta_medicamento,
                fk_mascota, fk_veterinario, fk_desparacitacio_vacuna
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data["fecha_atencion"],
                float(data["peso"]),
                data["diagnostico"],
                data["receta_medicamento"],
                int(data["fk_mascota"]),
                int(data["fk_veterinanio"]),
                int(data["fk_desparacitacio_vacuna"]),
            ),
        )
        cartilla_id = cursor.lastrowid
        conn.commit()

        return (
            jsonify(
                {
                    "id": cartilla_id,
                    "fecha_atencion": data["fecha_atencion"],
                    "peso": float(data["peso"]),
                    "diagnostico": data["diagnostico"],
                    "receta_medicamento": data["receta_medicamento"],
                    "fk_mascota": int(data["fk_mascota"]),
                    "fk_veterinanio": int(data["fk_veterinanio"]),
                    "fk_desparacitacio_vacuna": int(data["fk_desparacitacio_vacuna"]),
                }
            ),
            201,
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo crear la cartilla: {error}", 500)
    finally:
        conn.close()


@app.put("/api/cartillas/<int:cartilla_id>")
def update_cartilla(cartilla_id):
    data = request.get_json(silent=True) or {}

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            UPDATE cartillas_vacunacion
            SET fecha_atencion = %s,
                peso = %s,
                diagnostico = %s,
                receta_medicamento = %s,
                fk_mascota = %s,
                fk_veterinario = %s,
                fk_desparacitacio_vacuna = %s
            WHERE id = %s
            """,
            (
                data["fecha_atencion"],
                float(data["peso"]),
                data["diagnostico"],
                data["receta_medicamento"],
                int(data["fk_mascota"]),
                int(data["fk_veterinanio"]),
                int(data["fk_desparacitacio_vacuna"]),
                cartilla_id,
            ),
        )

        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Cartilla no encontrada", 404)

        conn.commit()
        return jsonify(
            {
                "id": cartilla_id,
                "fecha_atencion": data["fecha_atencion"],
                "peso": float(data["peso"]),
                "diagnostico": data["diagnostico"],
                "receta_medicamento": data["receta_medicamento"],
                "fk_mascota": int(data["fk_mascota"]),
                "fk_veterinanio": int(data["fk_veterinanio"]),
                "fk_desparacitacio_vacuna": int(data["fk_desparacitacio_vacuna"]),
            }
        )
    except KeyError as error:
        conn.rollback()
        return validation_error(f"Falta el campo obligatorio: {error.args[0]}")
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo actualizar la cartilla: {error}", 500)
    finally:
        conn.close()


@app.post("/api/citas")
def create_cita():
    data = request.get_json(silent=True) or {}
    required_fields = [
        "fecha_hora",
        "motivo_consulta",
        "fk_cliente",
        "fk_veterinario",
        "fk_mascota",
    ]
    missing_fields = [field for field in required_fields if data.get(field) in (None, "")]
    if missing_fields:
        return validation_error(
            f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            INSERT INTO Citas (fecha_hora, estado, motivo_consulta, fk_cliente, fk_veterinario, fk_mascota)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data["fecha_hora"],
                data.get("estado", "Pendiente"),
                data["motivo_consulta"],
                int(data["fk_cliente"]),
                int(data["fk_veterinario"]),
                int(data["fk_mascota"]),
            ),
        )
        cita_id = cursor.lastrowid
        conn.commit()
        return jsonify({"id": cita_id, "message": "Cita creada correctamente"}), 201
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo crear la cita: {error}", 500)
    finally:
        conn.close()


@app.delete("/api/citas/<int:cita_id>")
def delete_cita(cita_id):
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute("DELETE FROM Citas WHERE pk_cita = %s", (cita_id,))
        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Cita no encontrada", 404)
        conn.commit()
        return jsonify({"message": "Cita cancelada correctamente"})
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo cancelar la cita: {error}", 500)
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", "5000")),
        debug=os.getenv("FLASK_ENV", "development") == "development",
    )
