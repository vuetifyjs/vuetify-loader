import { readFile, writeFile } from 'fs/promises'
import * as path from 'path'

import mkdirp from 'mkdirp'
import { PluginOption } from 'vite'

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export type stylesPluginOptions = true | 'none' | 'expose'

const styleImportRegexp = /@use ['"]vuetify\/lib\/styles['"]/

export function stylesPlugin (options: stylesPluginOptions = true): PluginOption {
  const vuetifyBase = path.dirname(require.resolve('vuetify/package.json'))
  const files = new Set<string>()

  let resolve: (v: any) => void
  let promise: Promise<any> | null
  let timeout: NodeJS.Timeout

  async function awaitResolve () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      resolve(true)
    }, 500)

    if (!promise) {
      promise = new Promise((_resolve) => resolve = _resolve)
      await promise
      await mkdirp(path.resolve(process.cwd(), 'node_modules/.cache/vuetify'))
      await writeFile(
        path.resolve(process.cwd(), 'node_modules/.cache/vuetify/styles.scss'),
        ['vuetify/lib/styles/main.sass', ...files.values()].map(v => `@forward '${v}';`).join('\n'),
        'utf8'
      )
      promise = null
    }

    return promise
  }

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    async resolveId (source, importer, custom) {
      if (
        importer &&
        ['.css', '.scss', '.sass'].some(v => source.endsWith(v)) &&
        isSubdir(vuetifyBase, importer)
      ) {
        if (options === 'none') {
          return '__void__'
        } else if (options === 'expose') {
          awaitResolve()

          const resolution = await this.resolve(
            source.replace(/.css$/, '.sass'),
            importer,
            { skipSelf: true, custom }
          )

          if (resolution) {
            files.add(resolution.id)

            return '__void__'
          }
        }
      }

      return null
    },
    async transform (code, id) {
      if (
        options === 'expose' &&
        id.endsWith('.scss') &&
        styleImportRegexp.test(code)
      ) {
        await awaitResolve()

        this.addWatchFile(path.resolve(process.cwd(), 'node_modules/.cache/vuetify/styles.scss'))

        return code.replace(styleImportRegexp, '@use ".cache/vuetify/styles.scss"')
      }
    },
    load (id) {
      if (id === '__void__') {
        return ''
      }

      return null
    }
  }
}
