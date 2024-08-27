import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'
import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()
  let configFile: string | undefined
  const noneFiles = new Set<string>()
  let isNone = false
  let sassVariables = false
  let fileImport = false
  const PREFIX = 'vuetify-styles/'
  const SSR_PREFIX = '/@vuetify-styles/'

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    configResolved (config) {
      isNone = options.styles === 'none'
      if (isObject(options.styles)) {
        sassVariables = true
        fileImport = options.styles.useViteFileImport === true
        configFile = path.isAbsolute(options.styles.configFile)
          ? path.resolve(options.styles.configFile)
          : path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
        configFile = fileImport
          ? pathToFileURL(configFile).href
          : normalizePath(configFile)
      }
    },
    async resolveId (source, importer, { custom, ssr }) {
      if (source.startsWith(PREFIX) || source.startsWith(SSR_PREFIX)) {
        return source
      }

      if (
        source === 'vuetify/styles' || (
          importer &&
          source.endsWith('.css') &&
          isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
        )
      ) {
        if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        }

        const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

        if (!resolution) {
          return undefined
        }

        const target = resolution.id.replace(/\.css$/, '.sass')
        if (isNone) {
          noneFiles.add(target)
          return target
        }

        return `${ssr ? SSR_PREFIX : PREFIX}${path.relative(vuetifyBase, target)}`
      }

      return undefined
    },
    load (id) {
      if (sassVariables) {
        const target = id.startsWith(PREFIX)
            ? path.resolve(vuetifyBase, id.slice(PREFIX.length))
            : id.startsWith(SSR_PREFIX)
                ? path.resolve(vuetifyBase, id.slice(SSR_PREFIX.length))
                : undefined

            if (target) {
              return {
                code: `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`,
                map: {
                  mappings: '',
                },
              }
            }
      }
      return isNone && noneFiles.has(id) ? '' : undefined
    },
  }
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
