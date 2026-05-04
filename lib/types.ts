// Tipos basados en el diagrama de clases UML proporcionado
// Son los tipos de datos en el programa, mas en espcífico en las labels.s
// Clase Padre: Usuario
export interface Usuario {
  id: number
  nombre_usuario?: string
  email: string
  contraseña?: string
  role_id: number // 1 = Cliente, 2 = Veterinario
  cliente_id?: number | null
  veterinario_id?: number | null
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
  Estado: string // Default 'Agendada' según diagrama
  Motivo_Consulta: string
  fk_Cliente: number
  fk_veterinario: number
  fk_Mascota: number
  fk_tratamiento: number 
}

export interface CitaAgendada {
  id: number
  servicio: string
  mascota: string
  veterinario: string
  fecha: string
  hora: string
  direccion: string
  motivo: string
  fk_cliente?: number
  fk_veterinario?: number
  estado: string
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
  fk_veterinario: number
  fk_veterinanio?: number // compatibilidad con payloads antiguos
  fk_tratamiento: number
  tratamiento: string
}

// Medicamentos
export interface Medicamentos {
  pk_medicamento: number
  nombre: string
  descripcion?: string
}

// Tratamientos
export interface Tratamientos {
  pk_tratamiento: number
  fecha_aplicacion: string // date
  fk_medicamento: number | null
  fk_servicio_veterinario: number | null
}

// Alias para compatibilidad con código existente
export interface Vacuna_desparacitacion extends Tratamientos {
  id_tratamiento?: number
  nombre?: string
}

export interface VeterinarioAgenda {
  fk_veterinario: number
  dia: string
  hora_inicio: string
  hora_fin: string
  disponible: boolean
}

export interface VeterinarioServicio {
  pk_veterinario_servicio: number
  fk_veterinario: number
  fk_servicio: number
  precio: number
  veterinario_nombre: string
  especialidad: string
  telefono: string
  direccion: string
}

// Tipos auxiliares para la UI
export type RoleId = 1 | 2 // 1 = Cliente, 2 = Veterinario

export interface UsuarioConPerfil extends Usuario {
  perfil?: Perfil_Usuario
}
