import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'
import Inspect from 'vite-plugin-inspect'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  root: path.resolve(__dirname, 'src'),
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'settings.scss',
      },
    }),
    {
      name: 'configure-server',
      configureServer(server) {
        return () => {
          server.middlewares.use('/', (req, res, next) => {
            if (req.url === '/index.html') req.url = '/index.vite.html'
            return next()
          })
        }
      }
    },
    // Inspect(),
  ],
  build: {
    sourcemap: true,
    minify: false,
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { build: 'src/index.vite.html', serve: 'index.vite.html' }[command],
    }
  },
  resolve: {
    alias: {
      '@': __dirname
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        // additionalData: `@forward '@/src/_variables'\n`,
      }
    }
  },
  optimizeDeps: {
    exclude: ['vuetify']
  }
}))
