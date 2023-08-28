import { utimes } from 'fs/promises'
import * as path from 'upath'
import _debug from 'debug'
import { normalizePath as normalizeVitePath } from 'vite'
import { cacheDir, writeStyles, resolveVuetifyBase, normalizePath } from '@vuetify/loader-shared'

import type { Plugin, ViteDevServer } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import type { PluginContext } from 'rollup'

const debug = _debug('vuetify:styles')

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

// FOR SOME REASON: /�plugin-vuetify:/home/jesse/Documents/personal/nuxt/vuetify/lib/styles/main.sass?direct                                                                                                      16:53:03
const PLUGIN_VIRTUAL_PREFIX = "virtual:"
const PLUGIN_VIRTUAL_NAME = "plugin-vuetify"

const styleImportRegexp = /(@use |meta\.load-css\()['"](vuetify(?:\/lib)?(?:\/styles(?:\/main(?:\.sass)?)?)?)['"]/

class ModuleManager {
  options: Options
  server?: ViteDevServer
  context?: PluginContext
  resolve?: (v: boolean) => void
  promise?: Promise<boolean> | null
  needsTouch: boolean = false
  blockingModules = new Set<string>()
  pendingModules: string[] = []
  timeout?: NodeJS.Timeout
  files = new Set<string>()
  tempFiles = new Map<string, string>()
  configFile: string = ''

  constructor(options: Options) {
    this.options = options
  }

  setConfigFile(config: any) {
    if (typeof this.options.styles === 'object') {
      if (path.isAbsolute(this.options.styles.configFile)) {
        this.configFile = this.options.styles.configFile
      } else {
        this.configFile = path.join(config.root || process.cwd(), this.options.styles.configFile)
      }
    }
  }


  async getPendingModules () {
    if (!this.server) {
      await new Promise(resolve => setTimeout(resolve, 0))
      const modules = Array.from(this.context!.getModuleIds())
        .filter(id => {
          return !this.blockingModules.has(id) && // Ignore the current file
            !/\w\.(s[ac]|c)ss/.test(id) // Ignore stylesheets
        })
        .map(id => this.context!.getModuleInfo(id)!)
        .filter(module => module.code == null) // Ignore already loaded modules

      this.pendingModules = modules.map(module => module.id)
      if (!this.pendingModules.length) return 0

      const promises = modules.map(module => this.context!.load(module))
      await Promise.race(promises)

      return promises.length
    } else {
      const modules = Array.from(this.server.moduleGraph.urlToModuleMap.entries())
        .filter(([k, v]) => (
          v.transformResult == null && // Ignore already loaded modules
          !k.startsWith('/@id/') &&
          !/\w\.(s[ac]|c)ss/.test(k) && // Ignore stylesheets
          !this.blockingModules.has(v.id!) && // Ignore the current file
          !/\/node_modules\/\.vite\/deps\/(?!vuetify[._])/.test(k) // Ignore dependencies
        ))

        this.pendingModules = modules.map(([, v]) => v.id!)
      if (!this.pendingModules.length) return 0

      const promises = modules.map(([k, v]) => this.server!.transformRequest(k).then(() => v))
      await Promise.race(promises)

      return promises.length
    }
  }

  async  awaitBlocking () {
    let pending
    do {
      clearTimeout(this.timeout!)
      this.timeout = setTimeout(() => {
        console.error('vuetify:styles fallback timeout hit', {
          blockingModules: Array.from(this.blockingModules.values()),
          pendingModules: this.pendingModules,
          pendingRequests: this.server?._pendingRequests.keys()
        })
        this.resolve!(false)
      }, this.options!.stylesTimeout)

      pending = await Promise.any<boolean | number | null>([
        this.promise!,
        this.getPendingModules()
      ])
      debug(pending, 'pending modules', this.pendingModules)
    } while (pending)

    this.resolve!(false)
  }


  async awaitResolve (id?: string) {
    if (id) {
      this.blockingModules.add(id)
    }

    if (!this.promise) {
      this.promise = new Promise((_resolve) => this.resolve = _resolve)

      this.awaitBlocking()
      await this.promise
      clearTimeout(this.timeout!)
      this.blockingModules.clear()

      debug('writing styles')
      await writeStyles(this.files)

      if (this.server && this.needsTouch) {
        const cacheFile = normalizeVitePath(cacheDir('styles.scss'))
        this.server.moduleGraph.getModulesByFile(cacheFile)?.forEach(module => {
          module.importers.forEach(module => {
            if (module.file) {
              const now = new Date()
              debug(`touching ${module.file}`)
              utimes(module.file, now, now)
            }
          })
        })
        this.needsTouch = false
      }
      this.promise = null
    }

    return this.promise
  }
}

export function stylesPlugin (options: Options): Plugin {
  const vuetifyBase = resolveVuetifyBase()
  const moduleManager = new ModuleManager(options)


  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    configureServer (_server) {
      moduleManager.server = _server
    },
    buildStart () {
      if (!moduleManager.server) {
        moduleManager.context = this
      }
    },
    configResolved (config) {
      moduleManager.setConfigFile(config)
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
        } 
        
        if (options.styles === 'sass') {
          const target = source.replace(/\.css$/, '.sass')
          return this.resolve(target, importer, { skipSelf: true, custom })
        } 
        
        if (options.styles === 'expose') {
          moduleManager.awaitResolve()

          const resolution = await this.resolve(
            source.replace(/\.css$/, '.sass'),
            importer,
            { skipSelf: true, custom }
          )

          if (resolution) {
            if (!moduleManager.files.has(resolution.id)) {
              moduleManager.needsTouch = true
              moduleManager.files.add(resolution.id)
            }

            return `${PLUGIN_VIRTUAL_PREFIX}__void__`
          }

          return null
        } 
        
        if (typeof moduleManager.options.styles === 'object') {
          const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

          if (!resolution) return null

          const target = resolution.id
            .replace(/\.css$/, '.sass')

          const contents = `@use "${normalizePath(moduleManager.configFile)}"\n@use "${normalizePath(target)}"`

          moduleManager.tempFiles.set(target, contents)

          return `${PLUGIN_VIRTUAL_PREFIX}${PLUGIN_VIRTUAL_NAME}:${target}`
        }
      } 
      
      if (source.startsWith(`/${PLUGIN_VIRTUAL_NAME}:`)) {
        return PLUGIN_VIRTUAL_PREFIX + source.slice(1)
      } 
      
      if (source.startsWith(`/@id/__x00__${PLUGIN_VIRTUAL_NAME}:`)) {
        return PLUGIN_VIRTUAL_PREFIX + source.slice(12)
      }

      return null
    },
    async transform (code, id) {
      if (
        moduleManager.options.styles === 'expose' &&
        ['.scss', '.sass'].some(v => id.endsWith(v)) &&
        styleImportRegexp.test(code)
      ) {
        debug(`awaiting ${id}`)
        await moduleManager.awaitResolve(id)
        debug(`returning ${id}`)

        return {
          code: code.replace(styleImportRegexp, '$1".cache/vuetify/styles.scss"'),
          map: null,
        }
      }
    },
    load (id) {
      // When Vite is configured with `optimizeDeps.exclude: ['vuetify']`, the
      // received id contains a version hash (e.g. \0__void__?v=893fa859).
      if (new RegExp(`^${PLUGIN_VIRTUAL_PREFIX}__void__(\\?.*)?$`).test(id)) {
        return ''
      }

      if (id.startsWith(`${PLUGIN_VIRTUAL_PREFIX}${PLUGIN_VIRTUAL_NAME}`)) {
        const file = new RegExp(`^${PLUGIN_VIRTUAL_PREFIX}${PLUGIN_VIRTUAL_NAME}:(.*?)(\\?.*)?$`).exec(id)![1];

        return moduleManager.tempFiles.get(file)
      }

      return null
    },
  }
}
