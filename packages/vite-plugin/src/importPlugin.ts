import { extname } from 'path'
import { Plugin, createFilter } from 'vite'
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
  let filter: (id: unknown) => boolean
  return {
    name: 'vuetify:import',
    configResolved (config) {
      const vuetifyIdx = config.plugins.findIndex(plugin => plugin.name === 'vuetify:import')
      const vueIdx = config.plugins.findIndex(plugin => plugin.name === 'vite:vue')
      if (vuetifyIdx < vueIdx) {
        throw new Error('Vuetify plugin must be loaded after the vue plugin')
      }
      const vueOptions = config.plugins[vueIdx].api.options
      filter = createFilter(vueOptions.include, vueOptions.exclude)
    },
    async transform (code, id) {
      const { query, path } = parseId(id)

      const isVueVirtual = query && 'vue' in query
      const isVueFile = !isVueVirtual &&
        filter(path) &&
        !/^import { render as _sfc_render } from ".*"$/m.test(code)
      const isVueTemplate = isVueVirtual && (
        query.type === 'template' ||
        (query.type === 'script' && query.setup === 'true')
      )

      if (isVueFile || isVueTemplate) {
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
