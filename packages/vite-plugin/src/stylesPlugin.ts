import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'
import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()

  let configFile: string | undefined
  const tempFiles = new Map<string, string>()
  const isNone = options.styles === 'none'
  const sassVariables = isNone ? false : isObject(options.styles)
  let fileImport = false

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    configResolved (config) {
      if (isObject(options.styles)) {
        fileImport = options.styles.useViteFileImport === true
        if (path.isAbsolute(options.styles.configFile)) {
          configFile = path.resolve(options.styles.configFile)
        } else {
          configFile = path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
        }
        configFile = fileImport
          ? pathToFileURL(configFile).href
          : normalizePath(configFile)
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
        if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        }

        const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

        if (!resolution) {
          return undefined
        }

        const target = resolution.id.replace(/\.css$/, '.sass')
        tempFiles.set(target, isNone
            ? ''
            : `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`
        )

        return target
      }

      return undefined
    },
    load (id) {
      return isNone || sassVariables ? tempFiles.get(id) : undefined
    },
  }
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
