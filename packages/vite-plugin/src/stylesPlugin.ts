import { isAbsolute, join, relative as relativePath } from 'pathe'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'

import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'

function isSubdir (root: string, test: string) {
  const relative = relativePath(root, test)
  return relative && !relative.startsWith('..') && !isAbsolute(relative)
}

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()

  let configFile: string
  const tempFiles = new Map<string, string>()

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    configResolved (config) {
      if (isObject(options.styles)) {
        if (isAbsolute(options.styles.configFile)) {
          configFile = options.styles.configFile
        } else {
          configFile = join(config.root || process.cwd(), options.styles.configFile)
        }
      }
    },
    async resolveId (source, importer, { custom, ssr }) {
      if (
        source === 'vuetify/styles' || (
          importer &&
          source.endsWith('.css') &&
          isSubdir(vuetifyBase, isAbsolute(source) ? source : importer)
        )
      ) {
        if (options.styles === 'none') {
          return '/@plugin-vuetify/lib/__void__'
        } else if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        } else if (isObject(options.styles)) {
          const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

          if (!resolution) return null

          const target = resolution.id.replace(/\.css$/, '.sass')
          const file = relativePath(join(vuetifyBase, 'lib'), target)
          const contents = `@use "${normalizePath(configFile)}"\n@use "${normalizePath(target)}"`

          tempFiles.set(file, contents)

          return ssr
              ? `/@plugin-vuetify/lib/${file}`
              : `/@fs/plugin-vuetify/lib/${file}`
        }
      }
    },
    load (id) {
      // When Vite is configured with `optimizeDeps.exclude: ['vuetify']`, the
      // received id contains a version hash (e.g. \0__void__?v=893fa859).
      if (/^\/@plugin-vuetify\/lib\/__void__(\?.*)?$/.test(id))
        return ''

      if (id.startsWith('/@plugin-vuetify/lib/')) {
        const file = /^\/@plugin-vuetify\/lib\/(.*?)(\?.*)?$/.exec(id)![1]
        return tempFiles.get(file)
      }

      if (id.startsWith('/@fs/plugin-vuetify/lib/')) {
        const file = /^\/@fs\/plugin-vuetify\/lib\/(.*?)(\?.*)?$/.exec(id)![1]
        return tempFiles.get(file)
      }

      if (id.includes('plugin-vuetify/lib'))
        return ''
    },
  }
}
