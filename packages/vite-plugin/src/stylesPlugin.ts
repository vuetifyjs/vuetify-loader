import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'

import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
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
        if (path.isAbsolute(options.styles.configFile)) {
          configFile = options.styles.configFile
        } else {
          configFile = path.join(config.root || process.cwd(), options.styles.configFile)
        }
      }
    },
    async resolveId (source, importer, { custom }) {
      if (
        source === 'vuetify/styles' || (
          importer &&
          source.endsWith('.css') &&
          isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
        )
      ) {
        if (options.styles === 'none') {
          return '\0__void__'
        } else if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        } else if (isObject(options.styles)) {
          const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

          if (!resolution) return null

          const target = resolution.id.replace(/\.css$/, '.sass')
          const file = path.relative(path.join(vuetifyBase, 'lib'), target)
          const contents = `@use "${normalizePath(configFile)}"\n@use "${normalizePath(target)}"`

          tempFiles.set(file, contents)

          return `\0plugin-vuetify:${file}`
        }
      } else if (source.startsWith('/plugin-vuetify:')) {
        return '\0' + source.slice(1)
      } else if (source.startsWith('/@id/__x00__plugin-vuetify:')) {
        return '\0' + source.slice(12)
      }

      return null
    },
    load (id) {
      // When Vite is configured with `optimizeDeps.exclude: ['vuetify']`, the
      // received id contains a version hash (e.g. \0__void__?v=893fa859).
      if (/^\0__void__(\?.*)?$/.test(id)) {
        return ''
      }

      if (id.startsWith('\0plugin-vuetify')) {
        const file = /^\0plugin-vuetify:(.*?)(\?.*)?$/.exec(id)![1]

        return tempFiles.get(file)
      }

      return null
    },
  }
}
