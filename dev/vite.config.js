import vue from '@vitejs/plugin-vue'
import vuetify from 'vuetify-loader/vite'

export default {
  plugins: [
    vue(),
    vuetify(),
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
}
