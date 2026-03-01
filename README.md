# Helpdesk SaaS

Aplicación web moderna de gestión de soporte técnico construida con React y Node.js.

Este proyecto simula una plataforma real de atención al cliente donde los usuarios pueden crear tickets, los agentes gestionarlos y los administradores mantener una base de conocimiento.

---

## 🚀 Stack Tecnológico

### Frontend
- React
- React Router
- Context API (gestión de autenticación)
- Axios
- CSS

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Autenticación con JWT
- Control de acceso basado en roles

---

## ✨ Funcionalidades

### 🔐 Autenticación y Roles
- Autenticación mediante JWT
- Sistema de permisos según rol:
  - CUSTOMER
  - AGENT
  - ADMIN

---

### 🎫 Sistema de Tickets

- Creación de tickets (CUSTOMER)
- Asignación de tickets (AGENT / ADMIN)
- Cambio de estado del ticket
- Conversación tipo hilo mediante mensajes
- Estados de carga y skeletons para mejor experiencia de usuario
- Filtros por estado y asignación

---

### 📚 Base de Conocimiento (Knowledge Base)

- Listado público de artículos
- Búsqueda por texto y filtrado por categoría
- Flujo de borrador / publicado / archivado para staff
- Crear, editar y archivar artículos
- Rutas basadas en slug
- Diseño optimizado para lectura

---

## 🧠 Aspectos Técnicos Destacables

- Separación clara de responsabilidades (API / páginas / auth / estilos)
- Uso de AbortController para evitar actualizaciones de estado tras desmontaje
- Manejo defensivo de estados asíncronos
- Renderizado condicional según rol
- Estructura de carpetas escalable
- Diseño responsive consistente en todas las páginas

---

## 🔒 Roles y Permisos

| Acción               | CUSTOMER | AGENT | ADMIN |
|----------------------|----------|-------|-------|
| Crear ticket               | ✅ |  ❌  | ❌ |
| Responder ticket           | ✅ |  ✅  | ✅ |
| Asignarse ticket           | ❌ |  ✅  | ❌ |
| Asignar a cualquier agente | ❌ |  ❌  | ✅ |
| Crear artículo KB          | ❌ |  ✅  | ✅ |
| Editar artículo KB         | ❌ |  ✅  | ✅ |
| Archivar artículo KB       | ❌ |  ✅  | ✅ |

---

## 🧩 Qué demuestra este proyecto

- Arquitectura CRUD aplicada a un caso real
- Integración limpia con API REST
- Gestión avanzada de estados asíncronos
- Control de permisos en frontend y backend
- Atención al detalle en experiencia de usuario
- Base sólida para escalar a un SaaS real

---

## 📌 Posibles mejoras futuras

- Paginación en tickets y artículos
- Editor enriquecido (WYSIWYG) para artículos
- Notificaciones en tiempo real
- Sistema multi-tenant
- Sistema de notificaciones internas

---

## 👩‍💻 Autora

Loreto Garde Navarro  
Desarrolladora Web Full Stack