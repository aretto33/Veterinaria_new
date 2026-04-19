/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: MediVet
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `MediVet`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `MediVet` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `MediVet`;

--
-- Table structure for table `Agenda_Veterinario`
--

DROP TABLE IF EXISTS `Agenda_Veterinario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Agenda_Veterinario`
--

LOCK TABLES `Agenda_Veterinario` WRITE;
/*!40000 ALTER TABLE `Agenda_Veterinario` DISABLE KEYS */;
INSERT INTO `Agenda_Veterinario` VALUES
(1,1,'Lunes-Viernes','09:00:00','13:00:00',NULL);
/*!40000 ALTER TABLE `Agenda_Veterinario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cartilla_Vacunacion`
--

DROP TABLE IF EXISTS `Cartilla_Vacunacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cartilla_Vacunacion`
--

LOCK TABLES `Cartilla_Vacunacion` WRITE;
/*!40000 ALTER TABLE `Cartilla_Vacunacion` DISABLE KEYS */;
INSERT INTO `Cartilla_Vacunacion` VALUES
(2,'2026-04-18',6,'Falta de calcio','Agua',1,1,1),
(3,'2026-04-02',5,'Problemas intestinales','Mucha agua',2,1,1);
/*!40000 ALTER TABLE `Cartilla_Vacunacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Citas`
--

DROP TABLE IF EXISTS `Citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Citas` (
  `pk_cita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `motivo_consulta` varchar(150) DEFAULT NULL,
  `fk_cliente` int(11) DEFAULT NULL,
  `fk_veterinario` int(11) DEFAULT NULL,
  `fk_mascota` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_cita`),
  KEY `fk_cliente` (`fk_cliente`),
  KEY `fk_veterinario` (`fk_veterinario`),
  KEY `fk_mascota` (`fk_mascota`),
  CONSTRAINT `Citas_ibfk_1` FOREIGN KEY (`fk_cliente`) REFERENCES `Cliente` (`pk_cliente`),
  CONSTRAINT `Citas_ibfk_2` FOREIGN KEY (`fk_veterinario`) REFERENCES `Veterinario` (`pk_veterinario`),
  CONSTRAINT `Citas_ibfk_3` FOREIGN KEY (`fk_mascota`) REFERENCES `Mascotas` (`pk_mascota`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Citas`
--

LOCK TABLES `Citas` WRITE;
/*!40000 ALTER TABLE `Citas` DISABLE KEYS */;
/*!40000 ALTER TABLE `Citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cliente`
--

DROP TABLE IF EXISTS `Cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cliente` (
  `pk_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `fk_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`pk_cliente`),
  KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `Cliente_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `Usuario` (`pk_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cliente`
--

LOCK TABLES `Cliente` WRITE;
/*!40000 ALTER TABLE `Cliente` DISABLE KEYS */;
INSERT INTO `Cliente` VALUES
(1,6);
/*!40000 ALTER TABLE `Cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Mascotas`
--

DROP TABLE IF EXISTS `Mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mascotas`
--

LOCK TABLES `Mascotas` WRITE;
/*!40000 ALTER TABLE `Mascotas` DISABLE KEYS */;
INSERT INTO `Mascotas` VALUES
(1,'Terry','Felino','Otro','2024-12-22',1),
(2,'Argos','Canino','Pastor Aleman','2020-07-15',1);
/*!40000 ALTER TABLE `Mascotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Medicamentos`
--

DROP TABLE IF EXISTS `Medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medicamentos` (
  `pk_medicamento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`pk_medicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medicamentos`
--

LOCK TABLES `Medicamentos` WRITE;
/*!40000 ALTER TABLE `Medicamentos` DISABLE KEYS */;
INSERT INTO `Medicamentos` VALUES
(1,'Paracetamol','Dolor y fiebre'),
(2,'Amoxicilina','Antibiótico'),
(3,'Vacuna Rabia','Prevención rabia');
/*!40000 ALTER TABLE `Medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Perfil_Usuario`
--

DROP TABLE IF EXISTS `Perfil_Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Perfil_Usuario`
--

LOCK TABLES `Perfil_Usuario` WRITE;
/*!40000 ALTER TABLE `Perfil_Usuario` DISABLE KEYS */;
INSERT INTO `Perfil_Usuario` VALUES
(1,6,'9361020844','Arlette','Guzmán de la Cruz',NULL),
(2,7,'999102102','Giselle','Guzmán de la Cruz',NULL);
/*!40000 ALTER TABLE `Perfil_Usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Permisos`
--

DROP TABLE IF EXISTS `Permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Permisos` (
  `pk_permiso` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`pk_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Permisos`
--

LOCK TABLES `Permisos` WRITE;
/*!40000 ALTER TABLE `Permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `Permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rol`
--

DROP TABLE IF EXISTS `Rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rol` (
  `pk_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`pk_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rol`
--

LOCK TABLES `Rol` WRITE;
/*!40000 ALTER TABLE `Rol` DISABLE KEYS */;
INSERT INTO `Rol` VALUES
(1,'Cliente','Usuario cliente del sistema'),
(2,'Veterinario','Profesional Veterinario'),
(3,'Administrador','Creador de credeciales');
/*!40000 ALTER TABLE `Rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rol_Permisos`
--

DROP TABLE IF EXISTS `Rol_Permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rol_Permisos` (
  `fk_rol` int(11) NOT NULL,
  `fk_permiso` int(11) NOT NULL,
  PRIMARY KEY (`fk_rol`,`fk_permiso`),
  KEY `fk_permiso` (`fk_permiso`),
  CONSTRAINT `Rol_Permisos_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `Rol` (`pk_rol`),
  CONSTRAINT `Rol_Permisos_ibfk_2` FOREIGN KEY (`fk_permiso`) REFERENCES `Permisos` (`pk_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rol_Permisos`
--

LOCK TABLES `Rol_Permisos` WRITE;
/*!40000 ALTER TABLE `Rol_Permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `Rol_Permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Servicios`
--

DROP TABLE IF EXISTS `Servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Servicios` (
  `pk_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`pk_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Servicios`
--

LOCK TABLES `Servicios` WRITE;
/*!40000 ALTER TABLE `Servicios` DISABLE KEYS */;
INSERT INTO `Servicios` VALUES
(1,'Vacunacion','Vacunas más importantes para tus macotas'),
(2,'Desparacitación','Las escenciales para tu mascota'),
(3,'Odontología','Cuidado bucal de tus mascotas'),
(4,'Consulta general','Revisión básica');
/*!40000 ALTER TABLE `Servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tratamientos`
--

DROP TABLE IF EXISTS `Tratamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tratamientos` (
  `pk_tratamiento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`pk_tratamiento`),
  KEY `fk_medicamento` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tratamientos`
--

LOCK TABLES `Tratamientos` WRITE;
/*!40000 ALTER TABLE `Tratamientos` DISABLE KEYS */;
INSERT INTO `Tratamientos` VALUES
(1,'Vacuna','Aplicación de vacuna'),
(2,'Desparasitación','Eliminación de parásitos'),
(3,'Consulta general','Revisión médica'),
(4,'Cirugía','Procedimiento quirúrgico');
/*!40000 ALTER TABLE `Tratamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuario`
--

DROP TABLE IF EXISTS `Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuario`
--

LOCK TABLES `Usuario` WRITE;
/*!40000 ALTER TABLE `Usuario` DISABLE KEYS */;
INSERT INTO `Usuario` VALUES
(6,NULL,'arlettedelacruz5@gmail.com','scrypt:32768:8:1$FqtGAm3O59V4rH4V$9e38c6f63b6963f7d9ffadd181f1e31f32fa755e44102c28657da1244cef2fe11a07f262816580b4af2d2a455263771e20a8048857f95d77098f5f77ff235b7f',1),
(7,NULL,'giselle@gmail.com','scrypt:32768:8:1$ip46PHdNQMqzkN7M$1ffc071a8788d7e37794cf64892027f432f5d2621ad62bd99f9a4bc71974b521b7212f572c03b22683e75500b882189f85e047e69131dcc2bbcdc00a87b539ef',2),
(8,'admin','admin@medivet.com','scrypt:32768:8:1$67hQHxZyJNshDzqf$6ed6b570942f411980eb4f0d32c9415f33df0af1bcc0d40dbaeb333896316b23351f5be55a9c628fb3971e692d951c280c03b47d642958ace7ca935143bd3618',3);
/*!40000 ALTER TABLE `Usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Veterinario`
--

DROP TABLE IF EXISTS `Veterinario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Veterinario`
--

LOCK TABLES `Veterinario` WRITE;
/*!40000 ALTER TABLE `Veterinario` DISABLE KEYS */;
INSERT INTO `Veterinario` VALUES
(1,19283840,'Calle. Francisco I Madero #235, centro','Medicina General',7);
/*!40000 ALTER TABLE `Veterinario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Veterinario_Servicio`
--

DROP TABLE IF EXISTS `Veterinario_Servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Veterinario_Servicio`
--

LOCK TABLES `Veterinario_Servicio` WRITE;
/*!40000 ALTER TABLE `Veterinario_Servicio` DISABLE KEYS */;
INSERT INTO `Veterinario_Servicio` VALUES
(1,1,1,300.00),
(2,1,2,200.00),
(3,1,3,350.00),
(4,1,4,250.00);
/*!40000 ALTER TABLE `Veterinario_Servicio` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07 14:15:07
