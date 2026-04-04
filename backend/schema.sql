CREATE USER 'admin'@'%' IDENTIFIED BY 'admin482';
GRANT ALL PRIVILEGES ON MediVet.* TO 'admin'@'%';
FLUSH PRIVILEGES;

CREATE DATABASE MediVet;
Use MediVet;

CREATE TABLE Rol (
    pk_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion VARCHAR(150)
);

CREATE TABLE Permisos (
    pk_permiso INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE Rol_Permisos (
    fk_rol INT,
    fk_permiso INT,
    PRIMARY KEY (fk_rol, fk_permiso),
    FOREIGN KEY (fk_rol) REFERENCES Rol(pk_rol),
    FOREIGN KEY (fk_permiso) REFERENCES Permisos(pk_permiso)
);

CREATE TABLE Usuario (
    pk_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50),
    email VARCHAR(100),
    contraseña_hash VARCHAR(100),
    fk_rol INT,
    FOREIGN KEY (fk_rol) REFERENCES Rol(pk_rol)
);


CREATE TABLE Perfil_Usuario (
    pk_perfil INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,
    telefono INT,
    nombre VARCHAR(50),
    apellidos VARCHAR(80),
    FOREIGN KEY (fk_usuario) REFERENCES Usuario(pk_usuario)
);

CREATE TABLE Cliente (
    pk_cliente INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,
    FOREIGN KEY (fk_usuario) REFERENCES Usuario(pk_usuario)
);

CREATE TABLE Veterinario (
    pk_veterinario INT AUTO_INCREMENT PRIMARY KEY,
    cedula_prof INT,
    direcc_consultorio VARCHAR(150),
    especialidad VARCHAR(100),
    fk_usuario INT,
    FOREIGN KEY (fk_usuario) REFERENCES Usuario(pk_usuario)
);

CREATE TABLE Mascotas (
    pk_mascota INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    especie VARCHAR(50),
    raza VARCHAR(50),
    fecha_nacimiento DATE,
    fk_cliente INT,
    FOREIGN KEY (fk_cliente) REFERENCES Cliente(pk_cliente)
);

CREATE TABLE Servicios (
    pk_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(200),
    precio FLOAT
);

CREATE TABLE Citas (
    pk_cita INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME,
    estado VARCHAR(50) DEFAULT 'Tabasco',
    motivo_consulta VARCHAR(150),
    fk_cliente INT,
    fk_veterinario INT,
    fk_mascota INT,
    FOREIGN KEY (fk_cliente) REFERENCES Cliente(pk_cliente),
    FOREIGN KEY (fk_veterinario) REFERENCES Veterinario(pk_veterinario),
    FOREIGN KEY (fk_mascota) REFERENCES Mascotas(pk_mascota)
);

CREATE TABLE Medicamentos (
    pk_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(200)
);

CREATE TABLE Tratamientos (
    pk_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
    fecha_aplicacion DATE,
    fk_medicamento INT,
    fk_servicio_veterinario INT,
    FOREIGN KEY (fk_medicamento) REFERENCES Medicamentos(pk_medicamento),
    FOREIGN KEY (fk_servicio) REFERENCES Servicios(pk_servicio)
);

CREATE TABLE Cartilla_Vacunacion (
    pk_cartilla INT AUTO_INCREMENT PRIMARY KEY,
    fecha_atencion DATE,
    peso FLOAT,
    diagnostico TEXT,
    receta_medicamento VARCHAR(200),
    fk_mascota INT,
    fk_veterinario INT,
    fk_tratamiento INT,
    FOREIGN KEY (fk_mascota) REFERENCES Mascotas(pk_mascota),
    FOREIGN KEY (fk_veterinario) REFERENCES Veterinario(pk_veterinario),
    FOREIGN KEY (fk_tratamiento) REFERENCES Tratamientos(pk_tratamiento)
);

INSERT INTO Rol (nombre, descripcion) VALUES
('Cliente', 'Usuario cliente del sistema'),
('Veterinario', 'Profesional veterinario'),
('Administrador', 'Administrador del sistema');

-- ===== CREDENCIAL FIJA ADMINISTRADOR =====
-- Email: admin@medivet.com
-- Contraseña: Admin@2024
-- ==========================================
INSERT INTO Usuario (nombre_usuario, email, contraseña_hash, fk_rol)
VALUES ('admin', 'admin@medivet.com', 'scrypt:32768:8:1$67hQHxZyJNshDzqf$6ed6b570942f411980eb4f0d32c9415f33df0af1bcc0d40dbaeb333896316b23351f5be55a9c628fb3971e692d951c280c03b47d642958ace7ca935143bd3618', 3);

INSERT INTO Perfil_Usuario (fk_usuario, telefono, nombre, apellidos)
VALUES (1, 3005551234, 'Administrador', 'Sistema');

-- Usuario de prueba Cliente
INSERT INTO Usuario (nombre_usuario, email, contraseña_hash, fk_rol)
VALUES ('juan', 'juan@mail.com', '123456', 1);

INSERT INTO Perfil_Usuario (fk_usuario, telefono, nombre, apellidos)
VALUES (2, 3015551234, 'Juan', 'Pérez');


CREATE TABLE Veterinario_Servicio (
    pk_veterinario_servicio INT AUTO_INCREMENT PRIMARY KEY,
    fk_veterinario INT NOT NULL,
    fk_servicio INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (fk_veterinario) REFERENCES Veterinario(pk_veterinario),
    FOREIGN KEY (fk_servicio) REFERENCES Servicios(pk_servicio)
);
CREATE TABLE Agenda_Veterinario (
    pk_agenda INT AUTO_INCREMENT PRIMARY KEY,
    fk_veterinario INT NOT NULL,
    dia VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fk_veterinario) REFERENCES Veterinario(pk_veterinario)
);

-- 1. Primero verifica que existan veterinarios
SELECT * FROM Veterinario;

-- 2. Después verifica que existan servicios
SELECT * FROM Servicios;

-- 3. Luego inserta relación veterinario-servicio
INSERT INTO Veterinario_Servicio (fk_veterinario, fk_servicio, precio) 
VALUES 
  (1, 1, 150000),  -- Veterinario 1 ofrece Servicio 1 por $150k
  (1, 2, 120000),
  (2, 1, 160000);  -- Veterinario 2 ofrece Servicio 1 por $160k

-- 4. Verifica el resultado
SELECT vs.*, v.especialidad, p.nombre, p.apellidos 
FROM Veterinario_Servicio vs
INNER JOIN Veterinario v ON v.pk_veterinario = vs.fk_veterinario
INNER JOIN Perfil_Usuario p ON p.fk_usuario = v.fk_usuario;
