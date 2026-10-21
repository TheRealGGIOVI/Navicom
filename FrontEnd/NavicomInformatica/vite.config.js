import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-generator',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const htmlContent = fs.readFileSync(indexPath, 'utf-8')

      // Generar 404.html como fallback universal
      fs.writeFileSync(path.join(distDir, '404.html'), htmlContent)

      // Rutas conocidas para generar archivos HTML estáticos
      const routes = [
        'success',
        'cancel',
        'catalogo',
        'Carrito',
        'carrito',
        'Perfil',
        'perfil',
        'InicioSesion',
        'iniciosesion',
        'sobre-nosotros',
        'Contacto',
        'contacto',
        'admin-panel',
        'producto'
      ]

      for (const route of routes) {
        // Crear dist/<route>.html
        fs.writeFileSync(path.join(distDir, `${route}.html`), htmlContent)

        // Crear dist/<route>/index.html
        const routeDir = path.join(distDir, route)
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true })
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  envPrefix: ['VITE_', 'Stripe__'],
  esbuild: {
    pure: ['console.log'],
  },
})
