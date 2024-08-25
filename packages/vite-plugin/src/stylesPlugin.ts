import path from 'upath'
import { resolveVuetifyBase, normalizePath, isObject } from '@vuetify/loader-shared'
import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()
  let configFile: string | undefined
  let tempDir: string | undefined
  const noneFiles = new Set<string>()
  const isNone = options.styles === 'none'
  let fileImport = false

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    async configResolved (config) {
      if (isObject(options.styles)) {
        tempDir = path.resolve(config.cacheDir, 'vuetify-styles')
        fileImport = options.styles.useViteFileImport === true
        configFile = path.isAbsolute(options.styles.configFile)
          ? path.resolve(options.styles.configFile)
          : path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
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
        if (isNone) {
          noneFiles.add(target)
          return target
        }

        const tempFile = path.resolve(
          tempDir,
          path.relative(path.join(vuetifyBase, 'lib'), target),
        )
        await mkdir(path.dirname(tempFile), { recursive: true })
        await writeFile(
          tempFile,
          `@use "${configFile}"\n@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"`,
          'utf-8',
        )
        return tempFile
      }

      return undefined
    },
    load (id) {
      return isNone && noneFiles.has(id) ? '' : undefined
    },
  }
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
