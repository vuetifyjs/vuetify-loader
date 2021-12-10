import vue from '@vitejs/plugin-vue'
import vuetify from '@vuetify/vite-plugin'
import path from 'path'

export default {
  root: path.resolve(__dirname, 'src'),
  plugins: [
    vue(),
    vuetify({ styles: 'expose' }),
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
    }
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.vite.html'
    }
  }
}
