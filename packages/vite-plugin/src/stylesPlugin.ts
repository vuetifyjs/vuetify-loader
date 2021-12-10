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

const styleImportRegexp = /@use ['"]vuetify(\/lib)?\/styles(\/main(\.sass)?)?['"]/

export function stylesPlugin (options: Options): PluginOption {
  const vuetifyBase = path.dirname(require.resolve('vuetify/package.json'))
  const files = new Set<string>()

  let server: ViteDevServer
  let context: PluginContext
  let resolve: (v: boolean) => void
  let promise: Promise<boolean> | null
  let needsTouch = false
  const blockingModules = new Set<string>()

  async function getPendingModules () {
    if (!server) {
      await new Promise(resolve => setTimeout(resolve, 50))
      return (await Promise.all(
        Array.from(context.getModuleIds())
          .filter(id => !blockingModules.has(id)) // Ignore the current file
          .map(id => context.getModuleInfo(id)!)
          .filter(module => module.code == null) // Ignore already loaded modules
          .map(module => context.load(module))
      )).filter(module => module.code == null)
        .map(module => module.id)
    } else {
      return (await Promise.all(
        Array.from(server._pendingRequests, ([k, v]) => {
          const module = server.moduleGraph.urlToModuleMap.get(k)
          return module?.id && !blockingModules.has(module.id)
            ? v.then(() => module.id)
            : null
        }).filter(v => v != null)
      )) as string[]
    }
  }

  let pendingModules: string[]
  let timeout: NodeJS.Timeout
  async function awaitBlocking () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      console.error('vuetify:styles fallback timeout hit', {
        blockingModules: Array.from(blockingModules.values()),
        pendingModules: server ? Array.from(server._pendingRequests.keys()) : pendingModules,
      })
      resolve(false)
    }, options.stylesTimeout)

    let pending
    do {
      pending = await Promise.any([
        promise,
        getPendingModules().then(v => {
          pendingModules = v
          return !!v.length
        })
      ])
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
          return '__void__'
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

            return '__void__'
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

        return code.replace(styleImportRegexp, '@use ".cache/vuetify/styles.scss"')
      }
    },
    load (id) {
      if (id === '__void__') {
        return ''
      }

      return null
    },
  }
}
