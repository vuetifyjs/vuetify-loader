import { extname } from 'path'
import type { Plugin } from 'vite'
import { generateImports, Options } from '@vuetify/loader-shared'
import { URLSearchParams } from 'url'

function parseId (id: string) {
  const [pathname, query] = id.split('?')

  return {
    query: query ? Object.fromEntries(new URLSearchParams(query)) : null,
    path: pathname ?? id
  }
}

export function importPlugin (options: Options): Plugin {
  return {
    name: 'vuetify:import',
    configResolved (config) {
      if (config.plugins.findIndex(plugin => plugin.name === 'vuetify:import') < config.plugins.findIndex(plugin => plugin.name === 'vite:vue')) {
        throw new Error('Vuetify plugin must be loaded after the vue plugin')
      }
    },
    async transform (code, id) {
      const { query, path } = parseId(id)

      if (
        ((!query || !('vue' in query)) && extname(path) === '.vue' && !/^import { render as _sfc_render } from ".*"$/m.test(code)) ||
        (query && 'vue' in query && (query.type === 'template' || (query.type === 'script' && query.setup === 'true')))
      ) {
        const { code: imports, source } = generateImports(code, options)
        return {
          code: source + imports,
          map: null,
        }
      }

      return null
    }
  }
}
