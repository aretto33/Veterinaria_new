import {
  cartillas as mockCartillas,
  clientes as mockClientes,
  perfiles as mockPerfiles,
  servicios as mockServicios,
  usuarios as mockUsuarios,
  veterinarios as mockVeterinarios,
  mascotas as mockMascotas,
} from '@/lib/mock-data'
import {
  Cartilla_Vacunacion,
  Cliente,
  Mascotas,
  Perfil_Usuario,
  Servicios,
  Usuario,
  Veterinario,
} from '@/lib/types'

declare global {
  var __medivetStore:
    | {
        servicios: Servicios[]
        mascotas: Mascotas[]
        cartillas: Cartilla_Vacunacion[]
        usuarios: Usuario[]
        perfiles: Perfil_Usuario[]
        clientes: Cliente[]
        veterinarios: Veterinario[]
      }
    | undefined
}

export interface RegisterUserInput {
  role_id: number
  nombre_usuario: string
  email: string
  contraseña: string
  telefono: string
  Nombre: string
  Apellidos: string
  cedula_prof?: string
  direcc_consultorio?: string
  Especialidad?: string
}

export interface CreateMascotaInput {
  Nombre: string
  Especie: string
  Raza: string
  Fecha_Nacimiento?: string
  fk_cliente: number
}

export interface CreateCartillaInput {
  fk_mascota: number
  fecha_atencion: string
  peso: number
  diagnostico: string
  receta_medicamento: string
  fk_veterinanio: number
  fk_desparacitacio_vacuna: number
}

export interface BootstrapData {
  servicios: Servicios[]
  mascotas: Mascotas[]
  cartillas: Cartilla_Vacunacion[]
  nombresUsuarios: Record<number, string>
}

export interface LoginResult {
  user: Usuario
  fullName: string
}

interface DataProvider {
  getBootstrapData(): Promise<BootstrapData>
  login(email: string, contraseña: string): Promise<LoginResult | null>
  registerUser(input: RegisterUserInput): Promise<void>
  createMascota(input: CreateMascotaInput): Promise<Mascotas>
  createCartilla(input: CreateCartillaInput): Promise<Cartilla_Vacunacion>
  updateCartilla(id: number, input: CreateCartillaInput): Promise<Cartilla_Vacunacion>
}

function createInitialStore() {
  return {
    servicios: structuredClone(mockServicios),
    mascotas: structuredClone(mockMascotas),
    cartillas: structuredClone(mockCartillas),
    usuarios: structuredClone(mockUsuarios),
    perfiles: structuredClone(mockPerfiles),
    clientes: structuredClone(mockClientes),
    veterinarios: structuredClone(mockVeterinarios),
  }
}

function getStore() {
  if (!globalThis.__medivetStore) {
    globalThis.__medivetStore = createInitialStore()
  }

  return globalThis.__medivetStore
}

function getNombreCompleto(perfiles: Perfil_Usuario[], userId: number) {
  const perfil = perfiles.find((item) => item.fk_Usuario === userId)
  return perfil ? `${perfil.Nombre} ${perfil.Apellidos}` : 'Usuario'
}

class MockDataProvider implements DataProvider {
  async getBootstrapData() {
    const store = getStore()

    return {
      servicios: store.servicios,
      mascotas: store.mascotas,
      cartillas: store.cartillas,
      nombresUsuarios: Object.fromEntries(
        store.usuarios.map((user) => [user.id, getNombreCompleto(store.perfiles, user.id)])
      ),
    }
  }

  async login(email: string, contraseña: string) {
    const store = getStore()
    const user = store.usuarios.find(
      (item) => item.email === email && item.contraseña === contraseña
    )

    if (!user) {
      return null
    }

    return {
      user,
      fullName: getNombreCompleto(store.perfiles, user.id),
    }
  }

  async registerUser(input: RegisterUserInput) {
    const store = getStore()

    if (store.usuarios.some((user) => user.email === input.email)) {
      throw new Error('Este email ya está registrado')
    }

    const newUserId = store.usuarios.length + 1
    const newUser: Usuario = {
      id: newUserId,
      nombre_usuario: input.nombre_usuario,
      email: input.email,
      contraseña: input.contraseña,
      role_id: input.role_id,
    }

    const newPerfil: Perfil_Usuario = {
      d_perfil: store.perfiles.length + 1,
      fk_Usuario: newUserId,
      telefono: parseInt(input.telefono, 10) || 0,
      Nombre: input.Nombre,
      Apellidos: input.Apellidos,
    }

    store.usuarios.push(newUser)
    store.perfiles.push(newPerfil)

    if (input.role_id === 2) {
      const newVeterinario: Veterinario = {
        ...newUser,
        id_Veterinario: store.veterinarios.length + 1,
        cedula_prof: parseInt(input.cedula_prof || '0', 10) || 0,
        direcc_consultorio: input.direcc_consultorio || '',
        Especialidad: input.Especialidad || '',
      }

      store.veterinarios.push(newVeterinario)
      return
    }

    const newCliente: Cliente = {
      ...newUser,
      id_Cliente: store.clientes.length + 1,
      fk_cita: 0,
    }

    store.clientes.push(newCliente)
  }

  async createMascota(input: CreateMascotaInput) {
    const store = getStore()
    const newMascota: Mascotas = {
      id: store.mascotas.length + 1,
      Nombre: input.Nombre,
      Especie: input.Especie,
      Raza: input.Raza,
      Fecha_Nacimiento: input.Fecha_Nacimiento || '',
      fk_cliente: input.fk_cliente,
    }

    store.mascotas.push(newMascota)
    return newMascota
  }

  async createCartilla(input: CreateCartillaInput) {
    const store = getStore()
    const newCartilla: Cartilla_Vacunacion = {
      id: store.cartillas.length + 1,
      ...input,
    }

    store.cartillas.push(newCartilla)
    return newCartilla
  }

  async updateCartilla(id: number, input: CreateCartillaInput) {
    const store = getStore()
    const index = store.cartillas.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Cartilla no encontrada')
    }

    const updatedCartilla: Cartilla_Vacunacion = {
      id,
      ...input,
    }

    store.cartillas[index] = updatedCartilla
    return updatedCartilla
  }
}

export function getDataProvider(): DataProvider {
  switch (process.env.DATA_PROVIDER) {
    case 'mock':
    default:
      return new MockDataProvider()
  }
}
