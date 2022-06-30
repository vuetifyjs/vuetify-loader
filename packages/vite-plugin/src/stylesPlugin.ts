import { utimes } from 'fs/promises'
import * as path from 'upath'
import _debug from 'debug'
import { cacheDir, writeStyles } from '@vuetify/loader-shared'

import type { PluginOption, ViteDevServer } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import type { PluginContext } from 'rollup'

const debug = _debug('vuetify:styles')

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function getVuetifyBaseDir () {
  // If this plugin is `npm link` under another project (e.g. for development
  // purpose), then multiple Vuetify modules exist. So make sure to pick the
  // one under the current working directory (i.e. where `npm run` is executed).
  return path.dirname(
    require.resolve("vuetify/package.json", {
      paths: [process.cwd()],
    })
  )
}

const styleImportRegexp = /(@use |meta\.load-css\()['"](vuetify(?:\/lib)?\/styles(?:\/main(?:\.sass)?)?)['"]/

export function stylesPlugin (options: Options): PluginOption {
  const vuetifyBase = getVuetifyBaseDir()
  const files = new Set<string>()

  let server: ViteDevServer
  let context: PluginContext
  let resolve: (v: boolean) => void
  let promise: Promise<boolean> | null
  let needsTouch = false
  const blockingModules = new Set<string>()

  let pendingModules: string[]
  async function getPendingModules () {
    if (!server) {
      await new Promise(resolve => setTimeout(resolve, 0))
      const modules = Array.from(context.getModuleIds())
        .filter(id => !blockingModules.has(id)) // Ignore the current file
        .map(id => context.getModuleInfo(id)!)
        .filter(module => module.code == null) // Ignore already loaded modules

      pendingModules = modules.map(module => module.id)

      return (await Promise.all(
        modules.map(module => context.load(module))
      )).map(module => module.id)
    } else {
      const modules = Array.from(server.moduleGraph.urlToModuleMap.entries())
        .filter(([k, v]) => (
          v.transformResult == null &&
          !k.startsWith('/@id/') &&
          !blockingModules.has(v.id!)
        ))

      pendingModules = modules.map(([k, v]) => v.id!)

      return (await Promise.all(
        modules.map(([k, v]) => server.transformRequest(k).then(() => v))
      )).map(module => module.id!)
    }
  }

  let timeout: NodeJS.Timeout
  async function awaitBlocking () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      console.error('vuetify:styles fallback timeout hit', {
        blockingModules: Array.from(blockingModules.values()),
        pendingModules,
      })
      resolve(false)
    }, options.stylesTimeout)

    let pending
    do {
      pending = await Promise.any<boolean | number | null>([
        promise,
        getPendingModules().then(v => v.length)
      ])
      debug(pending, 'pending modules', pendingModules)
    } while (pending)

    resolve(false)
  }

  async function awaitResolve (id?: string) {
    if (id) {
      blockingModules.add(id)
    }

    if (!promise) {
      promise = new Promise((_resolve) => resolve = _resolve)

      awaitBlocking()
      await promise
      clearTimeout(timeout)
      blockingModules.clear()

      debug('writing styles')
      await writeStyles(files)

      if (server && needsTouch) {
        server.moduleGraph.getModulesByFile(cacheDir('styles.scss'))?.forEach(module => {
          module.importers.forEach(module => {
            if (module.file) {
              debug(`touching ${module.file}`)
              utimes(module.file, Date.now(), Date.now())
            }
          })
        })
        needsTouch = false
      }
      promise = null
    }

    return promise
  }

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    configureServer (_server) {
      server = _server
    },
    buildStart () {
      if (!server) {
        context = this
      }
    },
    async resolveId (source, importer, custom) {
      if (
        importer &&
        source.endsWith('.css') &&
        isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
      ) {
        if (options.styles === 'none') {
          return '\0__void__'
        } else if (options.styles === 'sass') {
          return source.replace(/\.css$/, '.sass')
        } else if (options.styles === 'expose') {
          awaitResolve()

          const resolution = await this.resolve(
            source.replace(/\.css$/, '.sass'),
            importer,
            { skipSelf: true, custom }
          )

          if (resolution) {
            if (!files.has(resolution.id)) {
              needsTouch = true
              files.add(resolution.id)
            }

            return '\0__void__'
          }
        }
      }

      return null
    },
    async transform (code, id) {
      if (
        options.styles === 'expose' &&
        ['.scss', '.sass'].some(v => id.endsWith(v)) &&
        styleImportRegexp.test(code)
      ) {
        debug(`awaiting ${id}`)
        await awaitResolve(id)
        debug(`returning ${id}`)

        return code.replace(styleImportRegexp, '$1".cache/vuetify/styles.scss"')
      }
    },
    load (id) {
      if (id === '__void__' || id === '\0__void__') {
        return ''
      }

      return null
    },
  }
}
