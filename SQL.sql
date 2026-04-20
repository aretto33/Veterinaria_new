-- MediVet.Medicamentos definition

CREATE TABLE `Medicamentos` (
  `pk_medicamento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`pk_medicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Permisos definition

CREATE TABLE `Permisos` (
  `pk_permiso` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`pk_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Rol definition

CREATE TABLE `Rol` (
  `pk_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`pk_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Servicios definition

CREATE TABLE `Servicios` (
  `pk_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`pk_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Tratamientos definition

CREATE TABLE `Tratamientos` (
  `pk_tratamiento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`pk_tratamiento`),
  KEY `fk_medicamento` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Rol_Permisos definition

CREATE TABLE `Rol_Permisos` (
  `fk_rol` int(11) NOT NULL,
  `fk_permiso` int(11) NOT NULL,
  PRIMARY KEY (`fk_rol`,`fk_permiso`),
  KEY `fk_permiso` (`fk_permiso`),
  CONSTRAINT `Rol_Permisos_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `Rol` (`pk_rol`),
  CONSTRAINT `Rol_Permisos_ibfk_2` FOREIGN KEY (`fk_permiso`) REFERENCES `Permisos` (`pk_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Usuario definition

CREATE TABLE `Usuario` (
  `pk_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contraseña_hash` varchar(255) DEFAULT NULL,
  `fk_rol` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_usuario`),
  KEY `fk_rol` (`fk_rol`),
  CONSTRAINT `Usuario_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `Rol` (`pk_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Veterinario definition

CREATE TABLE `Veterinario` (
  `pk_veterinario` int(11) NOT NULL AUTO_INCREMENT,
  `cedula_prof` int(11) DEFAULT NULL,
  `direcc_consultorio` varchar(150) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `fk_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_veterinario`),
  KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `Veterinario_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `Usuario` (`pk_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Veterinario_Servicio definition

CREATE TABLE `Veterinario_Servicio` (
  `pk_veterinario_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `fk_veterinario` int(11) DEFAULT NULL,
  `fk_servicio` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`pk_veterinario_servicio`),
  UNIQUE KEY `fk_veterinario` (`fk_veterinario`,`fk_servicio`),
  KEY `fk_servicio` (`fk_servicio`),
  CONSTRAINT `Veterinario_Servicio_ibfk_1` FOREIGN KEY (`fk_veterinario`) REFERENCES `Veterinario` (`pk_veterinario`),
  CONSTRAINT `Veterinario_Servicio_ibfk_2` FOREIGN KEY (`fk_servicio`) REFERENCES `Servicios` (`pk_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Agenda_Veterinario definition

CREATE TABLE `Agenda_Veterinario` (
  `pk_agenda` int(11) NOT NULL AUTO_INCREMENT,
  `fk_veterinario` int(11) DEFAULT NULL,
  `dia` varchar(20) DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`pk_agenda`),
  KEY `fk_veterinario` (`fk_veterinario`),
  CONSTRAINT `Agenda_Veterinario_ibfk_1` FOREIGN KEY (`fk_veterinario`) REFERENCES `Veterinario` (`pk_veterinario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Cliente definition

CREATE TABLE `Cliente` (
  `pk_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `fk_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_cliente`),
  KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `Cliente_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `Usuario` (`pk_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Mascotas definition

CREATE TABLE `Mascotas` (
  `pk_mascota` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `especie` varchar(50) DEFAULT NULL,
  `raza` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fk_cliente` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_mascota`),
  KEY `fk_cliente` (`fk_cliente`),
  CONSTRAINT `Mascotas_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `Cliente` (`pk_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Perfil_Usuario definition

CREATE TABLE `Perfil_Usuario` (
  `pk_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `fk_usuario` int(11) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellidos` varchar(80) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pk_perfil`),
  KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `Perfil_Usuario_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `Usuario` (`pk_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Cartilla_Vacunacion definition

CREATE TABLE `Cartilla_Vacunacion` (
  `pk_cartilla` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_atencion` date DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `receta_medicamento` varchar(200) DEFAULT NULL,
  `fk_mascota` int(11) DEFAULT NULL,
  `fk_veterinario` int(11) DEFAULT NULL,
  `fk_tratamiento` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_cartilla`),
  KEY `fk_mascota` (`fk_mascota`),
  KEY `fk_veterinario` (`fk_veterinario`),
  KEY `fk_tratamiento` (`fk_tratamiento`),
  CONSTRAINT `Cartilla_Vacunacion_ibfk_1` FOREIGN KEY (`fk_mascota`) REFERENCES `Mascotas` (`pk_mascota`),
  CONSTRAINT `Cartilla_Vacunacion_ibfk_2` FOREIGN KEY (`fk_veterinario`) REFERENCES `Veterinario` (`pk_veterinario`),
  CONSTRAINT `Cartilla_Vacunacion_ibfk_3` FOREIGN KEY (`fk_tratamiento`) REFERENCES `Tratamientos` (`pk_tratamiento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- MediVet.Citas definition

CREATE TABLE `Citas` (
  `pk_cita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `motivo_consulta` varchar(150) DEFAULT NULL,
  `fk_cliente` int(11) DEFAULT NULL,
  `fk_veterinario` int(11) DEFAULT NULL,
  `fk_mascota` int(11) DEFAULT NULL,
  `fk_servicio` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_cita`),
  KEY `fk_cliente` (`fk_cliente`),
  KEY `fk_veterinario` (`fk_veterinario`),
  KEY `fk_mascota` (`fk_mascota`),
  KEY `fk_citas_servicio` (`fk_servicio`),
  CONSTRAINT `Citas_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `Cliente` (`pk_cliente`),
  CONSTRAINT `Citas_ibfk_2` FOREIGN KEY (`fk_veterinario`) REFERENCES `Veterinario` (`pk_veterinario`),
  CONSTRAINT `Citas_ibfk_3` FOREIGN KEY (`fk_mascota`) REFERENCES `Mascotas` (`pk_mascota`),
  CONSTRAINT `fk_citas_servicio` FOREIGN KEY (`fk_servicio`) REFERENCES `Servicios` (`pk_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;