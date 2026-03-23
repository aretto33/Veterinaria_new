// Tipos basados en el diagrama de clases UML proporcionado
// Son los tipos de datos en el programa, mas en espcífico en las labels.s
// Clase Padre: Usuario
export interface Usuario {
  id: number
  nombre_usuario: string
  email: string
  contraseña: string
  role_id: number // 1 = Cliente, 2 = Veterinario
}

// Perfil_Usuario
export interface Perfil_Usuario {
  d_perfil: number
  fk_Usuario: number
  telefono: number
  Nombre: string
  Apellidos: string
}

// Rol
export interface Rol {
  id_rol: number
  nombre: string
  descripcion: string
}

// Permisos
export interface Permisos {
  id_permisos: number
}

// Cliente (hereda de Usuario)
export interface Cliente extends Usuario {
  id_Cliente: number
  fk_cita: number
}

// Veterinario (hereda de Usuario)
export interface Veterinario extends Usuario {
  id_Veterinario: number
  cedula_prof: number
  direcc_consultorio: string
  Especialidad: string
}

// Citas
export interface Citas {
  id_cita: number
  Fecha_hora: string // datetime
  Estado: string // Default "Tabasco" según diagrama
  Motivo_Consulta: string
  fk_Cliente: number
  fk_veterinario: number
  fk_Mascota: number
}

// Mascotas
export interface Mascotas {
  id: number
  Nombre: string
  Especie: string
  Raza: string
  Fecha_Nacimiento: string // date
  fk_cliente: number
}

// Servicios
export interface Servicios {
  id_servicio: number
  nombre: string
  descripción: string
  precio: number // float
}

// Cartilla_Vacunación
export interface Cartilla_Vacunacion {
  id: number
  fecha_atencion: string // date
  peso: number // float
  diagnostico: string // text
  receta_medicamento: string
  fk_mascota: number
  fk_veterinanio: number
  fk_desparacitacio_vacuna: number
}

// Vacuna_desparacitación
export interface Vacuna_desparacitacion {
  id_tratamiento: number
  tipo: string
  nombre_producto: string
  fecha_aplicacion: string // date
}

// Tipos auxiliares para la UI
export type RoleId = 1 | 2 // 1 = Cliente, 2 = Veterinario

export interface UsuarioConPerfil extends Usuario {
  perfil?: Perfil_Usuario
}
