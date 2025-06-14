# 🖥️ Navicom Informática

**Navicom Informática** es una plataforma de e-commerce enfocada en la venta de productos informáticos reacondicionados. Desarrollada como Trabajo de Fin de Grado, esta aplicación permite explorar, comprar y gestionar productos con una interfaz intuitiva tanto para usuarios como para administradores.

---

## 📚 Descripción

Navicom ofrece una experiencia completa de compra online, con funcionalidades avanzadas como carrito persistente, pasarela de pago integrada, y un panel de administración para gestionar productos y usuarios. Está diseñada para adaptarse a usuarios tanto autenticados como invitados.

---

## 🧭 Contenido

1. [📘 Descripción](#-descripción)
2. [🚀 Funcionalidades Principales](#-funcionalidades-principales)
3. [🔧 Instalación](#-instalación)
4. [⚙️ Uso](#️-uso)
5. [🧱 Arquitectura General](#-arquitectura-general)
6. [☁️ Despliegue en AWS](#-despliegue-en-aws)
7. [👨‍💻 Autores](#-autores)
8. [📄 Licencia](#-licencia)

---

## 🚀 Funcionalidades Principales

- 🧾 Registro e inicio de sesión con JWT.
- 🔎 Búsqueda inteligente de productos.
- 🛒 Carrito de compra persistente (con y sin sesión iniciada).
- 💳 Integración con Stripe para pagos seguros.
- 📦 Detalle de producto con gestión de stock.
- 📬 Envío automático de correos de bienvenida y confirmación de pedido.
- 🛠️ Vista de administrador para:
  - Gestión de productos (crear, editar, eliminar).
  - Gestión de usuarios (asignación de rol administrador).

---

## 🔧 Instalación


### 📦 Requisitos

| Requisito     | Versión         |
|---------------|-----------------|
| Node.js       | 16+             |
| .NET SDK      | 8.0+            |
| PostgreSQL    | –               |
| Cuenta AWS    | –               |

---

## ⚙️ Uso

Para comenzar a utilizar **Navicom Informática**:

1. Clona el repositorio y sigue los pasos de instalación.
2. Accede a la aplicación desde tu navegador:
   - **Local:** `http://localhost:3000`
   - **Desplegado:** _[Próximamente]_.
3. Crea una cuenta o inicia sesión.
4. Explora el catálogo, añade productos al carrito y realiza tu compra.
5. Si eres administrador, accede al panel para gestionar productos y usuarios.

> 🎥 Próximamente: [Ver presentación en YouTube](#)

---

## 🧱 Arquitectura General

La aplicación sigue una arquitectura cliente-servidor con separación de responsabilidades:

### 🔙 Backend (.NET + PostgreSQL)
- **API RESTful** con C# y ASP.NET Core.
- **Autenticación JWT**.
- **ORM:** Entity Framework.
- **Base de datos:** PostgreSQL.

### 🎨 Frontend (React)
- **React** con componentes personalizados en HTML y CSS.
- **Consumo de API** mediante fetch/Axios.
- **Manejo de estado:** mediante hooks nativos.

---

## ☁️ Despliegue en AWS

El proyecto está desplegado en AWS mediante instancias EC2:

1. EC2 Linux para backend y frontend.
2. Backend como servicio con .NET y PostgreSQL.
3. Frontend servido estáticamente desde Apache/Nginx.
4. Uso de GitHub Actions para despliegue continuo.

> La estructura y detalles del despliegue se incluirán una vez confirmados.

---

## 👨‍💻 Autores

- [Giovanni Giove](https://github.com/TheRealGGIOVI)
- [José Miguel Toro](https://github.com/Josemi61)

---

## 📄 Licencia

Este proyecto está protegido por derechos de autor. No se permite su uso, copia, modificación ni distribución sin autorización expresa de los autores.

---

© 2025 [Giovanni Giove](https://github.com/TheRealGGIOVI), [José Miguel Toro](https://github.com/Josemi61). Todos los derechos reservados.
