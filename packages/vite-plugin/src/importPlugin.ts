import { extname } from 'path'
import { PluginOption } from 'vite'
import { generateImports } from '@vuetify/loader-shared'
import { parse as parseUrl, URLSearchParams } from 'url'

function parseId (id: string) {
  const { query, pathname } = parseUrl(id)

  return {
    query: query ? Object.fromEntries(new URLSearchParams(query)) : null,
    path: pathname!
  }
}

export function importPlugin (): PluginOption {
  return {
    name: 'vuetify:import',
    async transform (code, id) {
      const { query, path } = parseId(id)
      if (extname(path) === '.vue' && !query) {
        if (/^import { render as _sfc_render } from ".*"$/m.test(code)) {
          return null
        }

        const { code: imports, source } = generateImports(code)
        return source + imports
      } else if (query && 'vue' in query && query.type === 'template') {
        const { code: imports, source } = generateImports(code)
        return source + imports
      }

      return null
    }
  }
}
