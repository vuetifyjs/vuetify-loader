import path from 'upath'
import { existsSync } from 'node:fs'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'

import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

const PLUGIN_VIRTUAL_PREFIX = "virtual:"
const PLUGIN_VIRTUAL_NAME = "plugin-vuetify"
const VIRTUAL_MODULE_ID = `${PLUGIN_VIRTUAL_PREFIX}${PLUGIN_VIRTUAL_NAME}`

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()

  let configFile: string
  const tempFiles = new Map<string, string>()
  const mappings = new Map<string, string>()

  function resolveCss(target: string) {
    let mapping = mappings.get(target)
    if (!mapping) {
      try {
        mapping = target.replace(/\.css$/, '.sass')
        if (!existsSync(mapping)) {
          mapping = target.replace(/\.css$/, '.scss')
        }
      }
      catch {
        mapping = target.replace(/\.css$/, '.scss')
      }
      mappings.set(target, mapping)
    }

    return mapping!
  }

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
          return `${PLUGIN_VIRTUAL_PREFIX}__void__`
        } else if (options.styles === 'sass') {
          return this.resolve(resolveCss(source), importer, { skipSelf: true, custom })
        } else if (isObject(options.styles)) {
          const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

          if (!resolution) return null

          const target = resolveCss(resolution.id)
          const file = path.relative(path.join(vuetifyBase, 'lib'), target)
          const suffix = target.match(/\.scss/) ? ';\n' : '\n'
          const contents = `@use "${normalizePath(configFile)}"${suffix}@use "${normalizePath(target)}"${suffix}`

          tempFiles.set(file, contents)

          return `${VIRTUAL_MODULE_ID}:${file}`
        }
      } else if (source.startsWith(`/${PLUGIN_VIRTUAL_NAME}:`)) {
        return PLUGIN_VIRTUAL_PREFIX + source.slice(1)
      } else if (source.startsWith(`/@id/__x00__${PLUGIN_VIRTUAL_NAME}:`)) {
        return PLUGIN_VIRTUAL_PREFIX + source.slice(12)
      } else if (source.startsWith(`/${VIRTUAL_MODULE_ID}:`)) {
        return source.slice(1)
      }

      return null
    },
    load (id) {
      // When Vite is configured with `optimizeDeps.exclude: ['vuetify']`, the
      // received id contains a version hash (e.g. \0__void__?v=893fa859).
      if (new RegExp(`^${PLUGIN_VIRTUAL_PREFIX}__void__(\\?.*)?$`).test(id)) {
        return ''
      }

      if (id.startsWith(`${VIRTUAL_MODULE_ID}`)) {
        const file = new RegExp(`^${VIRTUAL_MODULE_ID}:(.*?)(\\?.*)?$`).exec(id)![1]

        return tempFiles.get(file)
      }

      return null
    },
  }
}
