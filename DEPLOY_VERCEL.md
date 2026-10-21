# Desplegar Navicom en Vercel (frontend + API en un solo proyecto)

`vercel.json` (en la raíz) define dos *Services* en el mismo dominio:
- `web`  → `FrontEnd/NavicomInformatica` (React + Vite)
- `api`  → `BackEnd/NavicomInformatica` (ASP.NET Core 8, contenedor `Dockerfile.vercel`)

Todo lo que empieza por `/api/` va a la API; el resto, al frontend (con fallback a `index.html`
para React Router). Como comparten dominio, el frontend usa rutas relativas (`/api/...`).

## 1. Base de datos
Los datos antiguos estaban en un PostgreSQL de AWS (34.194.236.173) que ya no existe. Crea uno nuevo:
Vercel → Storage / Marketplace → Neon (o Railway/Supabase). La integración inyecta `DATABASE_URL`.

## 2. Variables de entorno (Vercel → Project → Settings → Environment Variables)
| Variable | Valor |
|---|---|
| `DATABASE_URL` | la inyecta la integración de Postgres (formato `postgres://...`) |
| `JWT_KEY` | cadena larga aleatoria (mín. 32 caracteres). Obligatoria |
| `Stripe__SecretKey` | clave secreta de Stripe (`sk_test_...`, privada de tu cuenta de Stripe) |
| `Stripe__Domain` | `https://tu-dominio.vercel.app` (sin barra final) |
| `VITE_STRIPE_PK` | clave publicable de Stripe (`pk_test_...`, pública en frontend) |
| `Email__PassWord` | contraseña de aplicación de Gmail (NUEVA) |
| `SEED_ADMIN_PASSWORD` | contraseña de los dos admins iniciales |
| `DB_INIT` | `true` SOLO en el primer despliegue (crea tablas y datos) |

Tras el primer despliegue correcto, elimina `DB_INIT` y redespliega.
Equivalentes locales: `dotnet user-secrets` o variables de entorno con los mismos nombres.

## 3. Seguridad (importante)
El `appsettings.json` antiguo, con la clave secreta de Stripe, la contraseña de Gmail y la
cadena de conexión, estuvo en un repositorio público. Quitarlas del archivo NO las borra del
historial de Git. Hay que **rotarlas**: crear nueva clave secreta de Stripe, nueva contraseña de
aplicación de Gmail y no reutilizar la contraseña de la base de datos antigua.
Los usuarios admin sembrados tenían contraseñas públicas en el código: usa `SEED_ADMIN_PASSWORD`.

## 4. Limitaciones conocidas en Vercel
- Las imágenes que ya están en `wwwroot/images` (en el repo) se sirven bien. Las imágenes que se suban
  desde el panel de admin se guardan en disco del contenedor y se pierden (sin almacenamiento persistente).
  Solución futura: Vercel Blob.
- Arranque en frío: la primera petición tras un rato sin tráfico tarda más.
- El envío de correos usa SMTP de Gmail (puerto 587): compruébalo en producción.
- Stripe necesita URLs absolutas públicas para las imágenes: no uses la protección de despliegue en producción.
- Swagger queda sin ruta pública (`/swagger` iría al frontend).
