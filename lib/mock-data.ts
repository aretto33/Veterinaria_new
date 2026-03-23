import { 
  Servicios, 
  Mascotas, 
  Cartilla_Vacunacion, 
  Usuario, 
  Veterinario, 
  Cliente,
  Citas,
  Vacuna_desparacitacion,
  Perfil_Usuario,
  Rol
} from './types'

// Roles del sistema
export const roles: Rol[] = [
  { id_rol: 1, nombre: 'Cliente', descripcion: 'Usuario cliente del sistema' },
  { id_rol: 2, nombre: 'Veterinario', descripcion: 'Profesional veterinario' }
]

// Servicios según diagrama UML
export const servicios: Servicios[] = [
  {
    id_servicio: 1,
    nombre: 'Consulta General',
    precio: 35.00,
    descripción: 'Evaluación completa del estado de salud de tu mascota'
  },
  {
    id_servicio: 2,
    nombre: 'Vacunación',
    precio: 25.00,
    descripción: 'Aplicación de vacunas según calendario veterinario'
  },
  {
    id_servicio: 3,
    nombre: 'Cirugía Menor',
    precio: 150.00,
    descripción: 'Procedimientos quirúrgicos de baja complejidad'
  },
  {
    id_servicio: 4,
    nombre: 'Desparasitación',
    precio: 20.00,
    descripción: 'Tratamiento antiparasitario interno y externo'
  },
  {
    id_servicio: 5,
    nombre: 'Limpieza Dental',
    precio: 80.00,
    descripción: 'Profilaxis dental profesional con ultrasonido'
  },
  {
    id_servicio: 6,
    nombre: 'Radiografía',
    precio: 45.00,
    descripción: 'Diagnóstico por imagen digital de alta resolución'
  }
]

// Mascotas según diagrama UML
export const mascotas: Mascotas[] = [
  {
    id: 1,
    Nombre: 'Luna',
    Especie: 'Canino',
    Raza: 'Golden Retriever',
    fk_cliente: 1,
    Fecha_Nacimiento: '2021-03-15'
  },
  {
    id: 2,
    Nombre: 'Michi',
    Especie: 'Felino',
    Raza: 'Siamés',
    fk_cliente: 1,
    Fecha_Nacimiento: '2022-07-20'
  },
  {
    id: 3,
    Nombre: 'Rocky',
    Especie: 'Canino',
    Raza: 'Bulldog Francés',
    fk_cliente: 1,
    Fecha_Nacimiento: '2020-11-08'
  }
]

// Cartilla_Vacunación según diagrama UML
export const cartillas: Cartilla_Vacunacion[] = [
  {
    id: 1,
    fk_mascota: 1,
    fecha_atencion: '2024-01-15',
    peso: 28.5,
    diagnostico: 'Estado de salud óptimo. Se recomienda mantener dieta actual.',
    receta_medicamento: 'Vitaminas B12 - 1 tableta diaria por 30 días',
    fk_veterinanio: 1,
    fk_desparacitacio_vacuna: 1
  },
  {
    id: 2,
    fk_mascota: 2,
    fecha_atencion: '2024-02-20',
    peso: 4.2,
    diagnostico: 'Leve infección respiratoria. En proceso de recuperación.',
    receta_medicamento: 'Amoxicilina 250mg - 1 dosis cada 12 horas por 7 días',
    fk_veterinanio: 1,
    fk_desparacitacio_vacuna: 2
  },
  {
    id: 3,
    fk_mascota: 3,
    fecha_atencion: '2024-03-01',
    peso: 12.8,
    diagnostico: 'Control rutinario. Vacunación antirrábica aplicada.',
    receta_medicamento: 'Ninguno',
    fk_veterinanio: 1,
    fk_desparacitacio_vacuna: 3
  }
]

// Vacuna_desparacitación según diagrama UML
export const vacunas: Vacuna_desparacitacion[] = [
  {
    id_tratamiento: 1,
    tipo: 'Vacuna',
    nombre_producto: 'Puppy DP',
    fecha_aplicacion: '2024-01-15'
  },
  {
    id_tratamiento: 2,
    tipo: 'Desparasitación',
    nombre_producto: 'Drontal Plus',
    fecha_aplicacion: '2024-02-20'
  },
  {
    id_tratamiento: 3,
    tipo: 'Vacuna',
    nombre_producto: 'Antirrábica',
    fecha_aplicacion: '2024-03-01'
  }
]

// Usuarios base según diagrama UML
export const usuarios: Usuario[] = [
  {
    id: 1,
    nombre_usuario: 'juan_perez',
    email: 'cliente@digicom.com',
    contraseña: 'cliente123',
    role_id: 1 // Cliente
  },
  {
    id: 2,
    nombre_usuario: 'dra_garcia',
    email: 'veterinario@digicom.com',
    contraseña: 'vet123',
    role_id: 2 // Veterinario
  }
]

// Perfiles de usuario según diagrama UML
export const perfiles: Perfil_Usuario[] = [
  {
    d_perfil: 1,
    fk_Usuario: 1,
    telefono: 5551234567,
    Nombre: 'Juan',
    Apellidos: 'Pérez González'
  },
  {
    d_perfil: 2,
    fk_Usuario: 2,
    telefono: 5559876543,
    Nombre: 'María',
    Apellidos: 'García López'
  }
]

// Cliente específico según diagrama UML
export const clientes: Cliente[] = [
  {
    id: 1,
    id_Cliente: 1,
    fk_cita: 1,
    nombre_usuario: 'juan_perez',
    email: 'cliente@digicom.com',
    contraseña: 'cliente123',
    role_id: 1
  }
]

// Veterinario específico según diagrama UML
export const veterinarios: Veterinario[] = [
  {
    id: 2,
    id_Veterinario: 1,
    cedula_prof: 12345678,
    direcc_consultorio: 'Av. Principal #123, Consultorio 4',
    Especialidad: 'Medicina General',
    nombre_usuario: 'dra_garcia',
    email: 'veterinario@digicom.com',
    contraseña: 'vet123',
    role_id: 2
  },
  {
    id: 3,
    id_Veterinario: 2,
    cedula_prof: 87654321,
    direcc_consultorio: 'Calle Salud #456, Piso 2',
    Especialidad: 'Cirugía',
    nombre_usuario: 'dr_martinez',
    email: 'dr.martinez@digicom.com',
    contraseña: 'vet123',
    role_id: 2
  },
  {
    id: 4,
    id_Veterinario: 3,
    cedula_prof: 11223344,
    direcc_consultorio: 'Plaza Veterinaria #789, Local 5',
    Especialidad: 'Dermatología',
    nombre_usuario: 'dra_lopez',
    email: 'dra.lopez@digicom.com',
    contraseña: 'vet123',
    role_id: 2
  },
  {
    id: 5,
    id_Veterinario: 4,
    cedula_prof: 55667788,
    direcc_consultorio: 'Centro Médico Veterinario, Consultorio 12',
    Especialidad: 'Cardiología',
    nombre_usuario: 'dr_sanchez',
    email: 'dr.sanchez@digicom.com',
    contraseña: 'vet123',
    role_id: 2
  }
]

// Perfiles de veterinarios
export const perfilesVeterinarios: Perfil_Usuario[] = [
  {
    d_perfil: 2,
    fk_Usuario: 2,
    telefono: 5559876543,
    Nombre: 'María',
    Apellidos: 'García López'
  },
  {
    d_perfil: 3,
    fk_Usuario: 3,
    telefono: 5551112233,
    Nombre: 'Carlos',
    Apellidos: 'Martínez Ruiz'
  },
  {
    d_perfil: 4,
    fk_Usuario: 4,
    telefono: 5554445566,
    Nombre: 'Ana',
    Apellidos: 'López Hernández'
  },
  {
    d_perfil: 5,
    fk_Usuario: 5,
    telefono: 5557778899,
    Nombre: 'Roberto',
    Apellidos: 'Sánchez Díaz'
  }
]

// Agenda de veterinarios (dias disponibles)
export interface AgendaVeterinario {
  fk_veterinario: number
  dia: string
  horarios: string[]
  disponible: boolean
}

export const agendasVeterinarios: AgendaVeterinario[] = [
  // Dra. García - Lunes a Viernes
  { fk_veterinario: 1, dia: 'Lunes', horarios: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Martes', horarios: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Miércoles', horarios: ['09:00', '10:00', '11:00', '12:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Jueves', horarios: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Viernes', horarios: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Sábado', horarios: ['10:00', '11:00', '12:00'], disponible: true },
  { fk_veterinario: 1, dia: 'Domingo', horarios: [], disponible: false },
  // Dr. Martínez
  { fk_veterinario: 2, dia: 'Lunes', horarios: ['10:00', '11:00', '12:00', '15:00', '16:00'], disponible: true },
  { fk_veterinario: 2, dia: 'Martes', horarios: [], disponible: false },
  { fk_veterinario: 2, dia: 'Miércoles', horarios: ['10:00', '11:00', '12:00', '15:00', '16:00'], disponible: true },
  { fk_veterinario: 2, dia: 'Jueves', horarios: [], disponible: false },
  { fk_veterinario: 2, dia: 'Viernes', horarios: ['10:00', '11:00', '12:00', '15:00', '16:00'], disponible: true },
  { fk_veterinario: 2, dia: 'Sábado', horarios: ['09:00', '10:00', '11:00'], disponible: true },
  { fk_veterinario: 2, dia: 'Domingo', horarios: [], disponible: false },
  // Dra. López
  { fk_veterinario: 3, dia: 'Lunes', horarios: ['08:00', '09:00', '10:00', '11:00'], disponible: true },
  { fk_veterinario: 3, dia: 'Martes', horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], disponible: true },
  { fk_veterinario: 3, dia: 'Miércoles', horarios: ['08:00', '09:00', '10:00', '11:00'], disponible: true },
  { fk_veterinario: 3, dia: 'Jueves', horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], disponible: true },
  { fk_veterinario: 3, dia: 'Viernes', horarios: ['08:00', '09:00', '10:00', '11:00'], disponible: true },
  { fk_veterinario: 3, dia: 'Sábado', horarios: [], disponible: false },
  { fk_veterinario: 3, dia: 'Domingo', horarios: [], disponible: false },
  // Dr. Sánchez
  { fk_veterinario: 4, dia: 'Lunes', horarios: ['14:00', '15:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Martes', horarios: ['14:00', '15:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Miércoles', horarios: ['14:00', '15:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Jueves', horarios: ['14:00', '15:00', '16:00', '17:00', '18:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Viernes', horarios: ['14:00', '15:00', '16:00', '17:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Sábado', horarios: ['10:00', '11:00', '12:00', '13:00'], disponible: true },
  { fk_veterinario: 4, dia: 'Domingo', horarios: [], disponible: false },
]

// Precios por servicio de cada veterinario
export interface PrecioServicioVeterinario {
  fk_veterinario: number
  fk_servicio: number
  precio: number
}

export const preciosVeterinarios: PrecioServicioVeterinario[] = [
  // Dra. García
  { fk_veterinario: 1, fk_servicio: 1, precio: 35.00 },
  { fk_veterinario: 1, fk_servicio: 2, precio: 25.00 },
  { fk_veterinario: 1, fk_servicio: 4, precio: 20.00 },
  // Dr. Martínez (Cirugía)
  { fk_veterinario: 2, fk_servicio: 1, precio: 40.00 },
  { fk_veterinario: 2, fk_servicio: 3, precio: 180.00 },
  { fk_veterinario: 2, fk_servicio: 6, precio: 50.00 },
  // Dra. López (Dermatología)
  { fk_veterinario: 3, fk_servicio: 1, precio: 45.00 },
  { fk_veterinario: 3, fk_servicio: 4, precio: 22.00 },
  { fk_veterinario: 3, fk_servicio: 5, precio: 90.00 },
  // Dr. Sánchez (Cardiología)
  { fk_veterinario: 4, fk_servicio: 1, precio: 50.00 },
  { fk_veterinario: 4, fk_servicio: 6, precio: 55.00 },
]

// Citas según diagrama UML
export const citas: Citas[] = [
  {
    id_cita: 1,
    Fecha_hora: '2024-03-15T10:00:00',
    Estado: 'Pendiente',
    Motivo_Consulta: 'Revisión general',
    fk_Cliente: 1,
    fk_veterinario: 1,
    fk_Mascota: 1
  },
  {
    id_cita: 2,
    Fecha_hora: '2024-03-16T14:30:00',
    Estado: 'Confirmada',
    Motivo_Consulta: 'Vacunación',
    fk_Cliente: 1,
    fk_veterinario: 1,
    fk_Mascota: 2
  }
]

// Helper para obtener nombre completo del perfil
export function getNombreCompleto(fk_Usuario: number): string {
  const perfil = perfiles.find(p => p.fk_Usuario === fk_Usuario)
  return perfil ? `${perfil.Nombre} ${perfil.Apellidos}` : 'Usuario'
}

// Helper para obtener mascota por id
export function getMascotaById(id: number): Mascotas | undefined {
  return mascotas.find(m => m.id === id)
}
 
