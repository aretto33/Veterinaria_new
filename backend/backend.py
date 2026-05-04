import os
import mariadb
from dotenv import load_dotenv
from flask import Blueprint, Flask, jsonify, request, send_from_directory, Response, session
from PIL import Image, UnidentifiedImageError
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from fpdf import FPDF

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-this-secret")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads", "perfiles")
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def get_allowed_origins():
    configured_origins = os.getenv("CORS_ORIGIN", "").strip()
    if configured_origins:
        return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]

    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


#Cross-Origin Resource Sharing (CORS)
CORS(
    app,
    resources={r"/api/*": {"origins": get_allowed_origins()}},
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


def normalize_cita_estado(estado, default="Agendada"):
    value = str(estado or "").strip().lower()
    if not value:
        return default

    mapping = {
        "agendada": "Agendada",
        "pendiente": "Agendada",
        "aceptada": "Aceptada",
        "confirmada": "Aceptada",
        "finalizada": "Finalizada",
        "completada": "Finalizada",
        "cancelada": "Cancelada",
    }
    return mapping.get(value, default)


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

#-------------------------

bp = Blueprint('pdf', __name__)

@bp.route("/pdf_historial")
def pdf_historial():
    mascota_id = request.args.get("pk_mascota", type=int)
    if not mascota_id:
        mascota_id = request.args.get("id_mascota", type=int)
    if not mascota_id:
        return validation_error("Debes proporcionar pk_mascota o id_mascota")
    
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("Error en la conexion de la base de datos", 500)

    try:
        cursor.execute(
            """
            SELECT pk_mascota, nombre, especie, raza, fecha_nacimiento
            FROM Mascotas
            WHERE pk_mascota = %s
            """,
            (mascota_id,),
        )
        mascota = cursor.fetchone()
        if not mascota:
            return validation_error(f"Mascota no encontrada para pk_mascota={mascota_id}", 404)

        cursor.execute(
            """
            SELECT c.fecha_atencion, c.peso, c.diagnostico, c.receta_medicamento,
                   t.nombre, t.descripcion
            FROM Cartilla_Vacunacion c
            LEFT JOIN Tratamientos t ON c.fk_tratamiento = t.pk_tratamiento
            WHERE c.fk_mascota = %s
            ORDER BY c.fecha_atencion DESC, c.pk_cartilla DESC
            """,
            (mascota_id,),
        )
        registros = cursor.fetchall()

        return generar_pdf_historial(mascota, registros)
    except mariadb.Error as error:
        return validation_error(f"No se pudo generar el historial: {error}", 500)
    finally:
        conn.close()


def format_pdf_value(value, fallback="Sin dato"):
    if value in (None, ""):
        return fallback

    if hasattr(value, "strftime"):
        return value.strftime("%d/%m/%Y")

    return str(value)


def generar_pdf_historial(mascota, registros):
    mascota_id, nombre, especie, raza, fecha_nacimiento = mascota
    filename_base = "".join(char if char.isalnum() else "_" for char in str(nombre or f"mascota_{mascota_id}")).strip("_")
    if not filename_base:
        filename_base = f"mascota_{mascota_id}"

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_title(f"Historial clinico - {nombre}")

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Historial Clinico", ln=1)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Mascota: {format_pdf_value(nombre)}", ln=1)
    pdf.cell(0, 8, f"Especie: {format_pdf_value(especie)}", ln=1)
    pdf.cell(0, 8, f"Raza: {format_pdf_value(raza)}", ln=1)
    pdf.cell(
        0,
        8,
        f"Fecha de nacimiento: {format_pdf_value(fecha_nacimiento, 'Sin registro')}",
        ln=1,
    )
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Registros Clinicos", ln=1)

    if not registros:
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 8, "Esta mascota aun no tiene registros clinicos guardados.")
    else:
        for index, registro in enumerate(registros, start=1):
            fecha_atencion, peso, diagnostico, receta, tratamiento_nombre, tratamiento_descripcion = registro

            if pdf.get_y() > 230:
                pdf.add_page()

            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(
                0,
                8,
                f"Registro {index} - {format_pdf_value(fecha_atencion, 'Sin fecha')}",
                ln=1,
            )

            detalles = [
                ("Peso", f"{peso} kg" if peso not in (None, "") else "Sin dato"),
                ("Tratamiento", format_pdf_value(tratamiento_nombre, "No especificado")),
                ("Descripcion del tratamiento", format_pdf_value(tratamiento_descripcion, "Sin descripcion")),
                ("Diagnostico", format_pdf_value(diagnostico, "Sin diagnostico")),
                ("Receta / indicaciones", format_pdf_value(receta, "Sin indicaciones")),
            ]

            for etiqueta, valor in detalles:
                pdf.set_font("Helvetica", "B", 10)
                pdf.cell(52, 7, f"{etiqueta}:")
                pdf.set_font("Helvetica", "", 10)
                pdf.multi_cell(0, 7, valor)

            pdf.ln(2)

    pdf_bytes = pdf.output(dest="S")
    if isinstance(pdf_bytes, str):
        pdf_bytes = pdf_bytes.encode("latin-1")

    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="historial_clinico_{filename_base}.pdf"'
        },
    )


app.register_blueprint(bp, url_prefix="/api")

#------------------

#---- Funcion de inicio 
@app.get("/api/bootstrap")
def bootstrap():
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            SELECT pk_servicio, nombre, descripcion
            FROM Servicios
            ORDER BY pk_servicio
            """
        )
        servicios = [
            {
                "id_servicio": row[0],
                "pk_servicio": row[0],
                "nombre": row[1],
                "descripción": row[2],
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
                "fk_veterinario": row[6],
                "fk_tratamiento": row[7],
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT pk_tratamiento, nombre, descripcion FROM Tratamientos
            """
        )
        tratamientos = [
            {
                "pk_tratamiento": row[0],
                "nombre": row[1],
                "descripcion": row[2],
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT vs.pk_veterinario_servicio, vs.fk_veterinario, vs.fk_servicio, vs.precio,
                   p.nombre, p.apellidos, v.especialidad, p.telefono, v.direcc_consultorio
            FROM Veterinario_Servicio vs
            INNER JOIN Veterinario v ON v.pk_veterinario = vs.fk_veterinario
            INNER JOIN Perfil_Usuario p ON p.fk_usuario = v.fk_usuario
            ORDER BY vs.fk_servicio, vs.fk_veterinario
            """
        )
        veterinario_servicios = [
            {
                "pk_veterinario_servicio": row[0],
                "fk_veterinario": row[1],
                "fk_servicio": row[2],
                "precio": float(row[3]) if row[3] is not None else 0,
                "veterinario_nombre": f"{row[4]} {row[5]}".strip(),
                "especialidad": row[6] or "",
                "telefono": str(row[7] or ""),
                "direccion": row[8] or "",
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
                   COALESCE(c.fk_cliente, m.fk_cliente) AS fk_cliente,
                   c.fk_veterinario, c.fk_mascota, c.fk_servicio,
                   COALESCE(m.nombre, CONCAT('Mascota #', c.fk_mascota)) AS mascota,
                   COALESCE(CONCAT(p.nombre, ' ', p.apellidos), CONCAT('Veterinario #', c.fk_veterinario)) AS veterinario,
                   COALESCE(v.direcc_consultorio, '') AS direccion,
                   COALESCE(MIN(s.nombre), 'Consulta') AS servicio
            FROM Citas c
LEFT JOIN Mascotas m ON m.pk_mascota = c.fk_mascota
LEFT JOIN Veterinario v ON v.pk_veterinario = c.fk_veterinario
LEFT JOIN Perfil_Usuario p ON p.fk_usuario = v.fk_usuario
LEFT JOIN Servicios s ON s.pk_servicio = c.fk_servicio
            GROUP BY
                c.pk_cita, c.fecha_hora, c.estado, c.motivo_consulta,
                COALESCE(c.fk_cliente, m.fk_cliente), c.fk_veterinario, c.fk_mascota,
                mascota, veterinario, direccion
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
                "fk_servicio": row[7],
                "mascota": row[8],
                "veterinario": row[9],
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

@app.put("/api/citas/<int:cita_id>/estatus")
def update_cita_status(cita_id):
    data = request.get_json(silent=True) or {}
    nuevo_estatus = normalize_cita_estado(data.get("estado"), default="")

    if not nuevo_estatus:
        return validation_error("El campo 'estado' es obligatorio")

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            "UPDATE Citas SET estado = %s WHERE pk_cita = %s",
            (nuevo_estatus, cita_id),
        )
        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Cita no encontrada", 404)

        conn.commit()
        return jsonify({"message": "Estatus actualizado correctamente", "id": cita_id, "estado": nuevo_estatus})
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"Error al actualizar el estatus: {error}", 500)
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
        fk_cliente = int(data["fk_cliente"])
        fecha_nacimiento = str(data.get("Fecha_Nacimiento", "")).strip() or None

        cursor.execute(
            "SELECT pk_cliente FROM Cliente WHERE pk_cliente = %s",
            (fk_cliente,),
        )
        if not cursor.fetchone():
            conn.rollback()
            return validation_error(f"El cliente con ID {fk_cliente} no existe", 400)

        cursor.execute(
            """
            INSERT INTO Mascotas (nombre, especie, raza, fecha_nacimiento, fk_cliente)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data["Nombre"].strip(),
                data["Especie"].strip(),
                data["Raza"].strip(),
                fecha_nacimiento,
                fk_cliente,
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
                    "Fecha_Nacimiento": fecha_nacimiento or "",
                    "fk_cliente": fk_cliente,
                }
            ),
            201,
        )
    except (TypeError, ValueError):
        conn.rollback()
        return validation_error("fk_cliente debe ser un numero valido", 400)
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
        "fk_tratamiento",
    ]
    missing_fields = [field for field in required_fields if data.get(field) in (None, "")]
    if "fk_tratamiento" in missing_fields and data.get("tratamiento") not in (None, ""):
        missing_fields.remove("fk_tratamiento")

    if missing_fields:
        return validation_error(
            f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        fk_veterinario = int(data.get("fk_veterinario") or data.get("fk_veterinanio") or 0)

        fk_tratamiento = None
        tratamiento_str = str(data.get("tratamiento", "")).strip()

        if tratamiento_str:
            if tratamiento_str.startswith("Tratamiento "):
                try:
                    candidate = int(tratamiento_str.replace("Tratamiento ", ""))
                    cursor.execute(
                        "SELECT pk_tratamiento FROM Tratamientos WHERE pk_tratamiento = %s",
                        (candidate,),
                    )
                    if cursor.fetchone():
                        fk_tratamiento = candidate
                except ValueError:
                    fk_tratamiento = None

            if not fk_tratamiento:
                cursor.execute(
                    "SELECT pk_tratamiento FROM Tratamientos WHERE nombre = %s",
                    (tratamiento_str,),
                )
                row = cursor.fetchone()
                if row:
                    fk_tratamiento = int(row[0])

        if not fk_tratamiento:
            raw_fk_tratamiento = data.get("fk_tratamiento")
            if raw_fk_tratamiento not in (None, ""):
                try:
                    candidate = int(raw_fk_tratamiento)
                    cursor.execute(
                        "SELECT pk_tratamiento FROM Tratamientos WHERE pk_tratamiento = %s",
                        (candidate,),
                    )
                    if cursor.fetchone():
                        fk_tratamiento = candidate
                except (ValueError, TypeError):
                    fk_tratamiento = None

        if not fk_tratamiento:
            cursor.execute(
                "SELECT pk_tratamiento FROM Tratamientos ORDER BY pk_tratamiento LIMIT 1"
            )
            row = cursor.fetchone()
            if row:
                fk_tratamiento = int(row[0])

        if not fk_tratamiento:
            return validation_error(
                "No hay tratamientos válidos disponibles para registrar la cartilla",
                400,
            )

        cursor.execute(
            """
            INSERT INTO Cartilla_Vacunacion (
                fecha_atencion, peso, diagnostico, receta_medicamento,
                fk_mascota, fk_veterinario, fk_tratamiento
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data["fecha_atencion"],
                float(data["peso"]),
                data["diagnostico"],
                data["receta_medicamento"],
                int(data["fk_mascota"]),
                fk_veterinario,
                fk_tratamiento,
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
                    "fk_veterinario": fk_veterinario,
                    "fk_tratamiento": fk_tratamiento,
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
        # validar campos necesarios para comprobar que la cartlla sí está en la BD
        cursor.execute(
            """
            SELECT fecha_atencion FROM Cartilla_Vacunacion
            WHERE pk_cartilla = %s
            """,
            (cartilla_id,),
        )
        existing_cartilla = cursor.fetchone()
        if not existing_cartilla:
            conn.rollback()
            return validation_error("Cartilla no existe",404)

        fk_veterinario = int(data.get("fk_veterinario", 0))
        fk_tratamiento = None
        tratamiento_str = str(data.get("tratamiento", "")).strip()

        if tratamiento_str:
            if tratamiento_str.startswith("Tratamiento "):
                try:
                    candidate = int(tratamiento_str.replace("Tratamiento ", ""))
                    cursor.execute(
                        "SELECT pk_tratamiento FROM Tratamientos WHERE pk_tratamiento = %s",
                        (candidate,),
                    )
                    if cursor.fetchone():
                        fk_tratamiento = candidate
                except ValueError:
                    fk_tratamiento = None

            if not fk_tratamiento:
                cursor.execute(
                    "SELECT pk_tratamiento FROM Tratamientos WHERE nombre = %s",
                    (tratamiento_str,),
                )
                row = cursor.fetchone()
                if row:
                    fk_tratamiento = int(row[0])

        if not fk_tratamiento:
            raw_fk_tratamiento = data.get("fk_tratamiento")
            if raw_fk_tratamiento not in (None, ""):
                try:
                    candidate = int(raw_fk_tratamiento)
                    cursor.execute(
                        "SELECT pk_tratamiento FROM Tratamientos WHERE pk_tratamiento = %s",
                        (candidate,),
                    )
                    if cursor.fetchone():
                        fk_tratamiento = candidate
                except (ValueError, TypeError):
                    fk_tratamiento = None

        if not fk_tratamiento:
            cursor.execute(
                "SELECT pk_tratamiento FROM Tratamientos ORDER BY pk_tratamiento LIMIT 1"
            )
            row = cursor.fetchone()
            if row:
                fk_tratamiento = int(row[0])

        if not fk_tratamiento:
            conn.rollback()
            return validation_error(
                "No hay tratamientos válidos disponibles para actualizar la cartilla",
                400,
            )

        cursor.execute(
            """
            UPDATE Cartilla_Vacunacion
            SET
                peso = %s,
                diagnostico = %s,
                receta_medicamento = %s,
                fk_mascota = %s,
                fk_veterinario = %s,
                fk_tratamiento = %s
            WHERE pk_cartilla = %s
            """,
            (
                float(data["peso"]),
                data["diagnostico"],
                data["receta_medicamento"],
                int(data["fk_mascota"]),
                fk_veterinario,
                fk_tratamiento,
                cartilla_id,
            ),
        )
        conn.commit()
        return jsonify(
            {
                "id": cartilla_id,
                "fecha_atencion":existing_cartilla[0] ,
                "peso": float(data["peso"]),
                "diagnostico": data["diagnostico"],
                "receta_medicamento": data["receta_medicamento"],
                "fk_mascota": int(data["fk_mascota"]),
                "fk_veterinario": fk_veterinario,
                "fk_tratamiento": fk_tratamiento,
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
        "fk_servicio",
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
            INSERT INTO Citas (fecha_hora, estado, motivo_consulta, fk_cliente, fk_veterinario, fk_mascota, fk_servicio)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data["fecha_hora"],
                normalize_cita_estado(data.get("estado")),
                data["motivo_consulta"],
                int(data["fk_cliente"]),
                int(data["fk_veterinario"]),
                int(data["fk_mascota"]),
                int(data["fk_servicio"]),

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


#-----------------------------------------------------------------------------
# SERVICIOS ENDPOINTS
#-----------------------------------------------------------------------------
@app.get("/api/servicios")
def get_servicios():
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
                "id_servicio": row[0],
                "nombre": row[1],
                "descripción": row[2] or "",
                "precio": float(row[3]) if row[3] is not None else 0,
            }
            for row in cursor.fetchall()
        ]
        return jsonify(servicios)
    except mariadb.Error as error:
        return validation_error(f"Error al obtener servicios: {error}", 500)
    finally:
        conn.close()


@app.post("/api/servicios")
def create_servicio():
    data = request.get_json(silent=True) or {}
    required_fields = ["nombre", "descripcion", "precio"]
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
            INSERT INTO Servicios (nombre, descripcion, precio)
            VALUES (%s, %s, %s)
            """,
            (data["nombre"], data["descripcion"], data["precio"]),
        )
        conn.commit()
        servicio_id = cursor.lastrowid
        return jsonify(
            {
                "id_servicio": servicio_id,
                "nombre": data["nombre"],
                "descripción": data["descripcion"],
                "precio": data["precio"],
            }
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo crear el servicio: {error}", 500)
    finally:
        conn.close()


@app.put("/api/servicios/<int:servicio_id>")
def update_servicio(servicio_id):
    data = request.get_json(silent=True) or {}
    required_fields = ["nombre", "descripcion", "precio"]
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
            UPDATE Servicios
            SET nombre = %s, descripcion = %s, precio = %s
            WHERE pk_servicio = %s
            """,
            (data["nombre"], data["descripcion"], data["precio"], servicio_id),
        )
        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Servicio no encontrado", 404)
        conn.commit()
        return jsonify(
            {
                "id_servicio": servicio_id,
                "nombre": data["nombre"],
                "descripción": data["descripcion"],
                "precio": data["precio"],
            }
        )
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo actualizar el servicio: {error}", 500)
    finally:
        conn.close()
    

@app.put("/api/veterinario_servicio/<int:veterinario_servicio_id>")
def update_veterinario_servicio(veterinario_servicio_id):
    data = request.get_json(silent=True) or {}

    if "precio" not in data or data["precio"] in (None, ""):    
        return validation_error("El campo 'precio' es obligatorio"
        )

    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute(
            """
            UPDATE Veterinario_Servicio
            SET precio = %s
            WHERE pk_veterinario_servicio = %s
            """,
            (data["precio"], veterinario_servicio_id),
        )
        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Servicio no encontrado", 404)
        conn.commit()
        return jsonify({
    "pk_veterinario_servicio": veterinario_servicio_id,
    "precio": data["precio"],
})
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo actualizar el servicio: {error}", 500)
    finally:
        conn.close()



@app.delete("/api/servicios/<int:servicio_id>")
def delete_servicio(servicio_id):
    conn, cursor = conectar_bd()
    if not conn:
        return validation_error("No se pudo conectar a la base de datos", 500)

    try:
        cursor.execute("DELETE FROM Servicios WHERE pk_servicio = %s", (servicio_id,))
        if cursor.rowcount == 0:
            conn.rollback()
            return validation_error("Servicio no encontrado", 404)
        conn.commit()
        return jsonify({"message": "Servicio eliminado correctamente"})
    except mariadb.Error as error:
        conn.rollback()
        return validation_error(f"No se pudo eliminar el servicio: {error}", 500)
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", "5000")),
        debug=os.getenv("FLASK_ENV", "development") == "development",
    )
