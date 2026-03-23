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
    foto_perfil VARCHAR(255),
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

CREATE TABLE Vacuna_Desparacitacion (
    pk_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    nombre_producto VARCHAR(100),
    fecha_aplicacion DATE
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
    FOREIGN KEY (fk_tratamiento) REFERENCES Vacuna_Desparacitacion(pk_tratamiento)
);

INSERT INTO Rol (nombre, descripcion) VALUES
('Cliente', 'Usuario cliente del sistema'),
('Veterinario', 'Profesional veterinario');


SELECT pk_rol, nombre FROM Rol;

INSERT INTO Usuario (nombre_usuario, email, contraseña_hash, fk_rol)
VALUES ('juan', 'juan@mail.com', '123456', 1);


INSERT INTO `Servicios`()
