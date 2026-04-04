# 🔐 Credenciales de Acceso MediVet

## Administrador

| Campo | Valor |
|-------|-------|
| **Email** | `admin@medivet.com` |
| **Contraseña** | `Admin@2024` |
| **Rol** | Administrador |

---

## Usuarios de Prueba

### Cliente
| Campo | Valor |
|-------|-------|
| **Email** | `juan@mail.com` |
| **Contraseña** | `123456` |
| **Rol** | Cliente |

---

## ✨ Permisos del Administrador

- ✅ Ver veterinarios y servicios
- ✅ Crear nuevos servicios veterinario
- ✅ Editar servicios veterinario
- ✅ Eliminar servicios veterinario
- ✅ Acceso total al sistema

---

## 📝 Notas

- La contraseña del admin está hasheada con `scrypt` en la BD
- Las credenciales están configuradas en `backend/schema.sql`
- Para cambiar la contraseña, regenera el hash con:
  ```bash
  python3 -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('nueva_contraseña'))"
  ```
