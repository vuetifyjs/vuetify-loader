import type { PluginOption } from 'vite'
import process from 'node:process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolveVuetifyBase } from './utils'
import { isAbsolute, relative as relativePath } from 'pathe'
import path from 'upath'
import { version as VITE_VERSION } from 'vite'

export interface VuetifyStylesOptions {
  /**
   * What CSS SASS/SCSS API should the plugin register?
   * - `false` - don't register any SASS/SCSS API
   * - `modern` - register SASS/SCSS 'modern' API => when using `sass`
   * - `modern-compiler` - register SASS/SCSS 'modern-compiler' API => when using `sass-embedded`
   *
   * When using `modern` API, the plugin will enable `preprocessorMaxWorkers` in Vite CSS config.
   *
   * @default 'modern-compiler'
   */
  registerApi?: 'modern' | 'modern-compiler' | false
  /**
   * Mode to use for styles:
   * - `none`: remove all style imports
   * - `source`: import sass/scss from source (old `sass` option)
   * - `configFile`: customising variables
   */
  mode?: true | 'none' | 'source' | {
    configFile: string,
  }
}

export function VuetifyStylesVitePlugin(options: VuetifyStylesOptions = {}) {
  let configFile: string | undefined
  // let cacheDir: string | undefined
  const vuetifyBase = resolveVuetifyBase()
  const noneFiles = new Set<string>()
  let isNone = false
  let sassVariables = false
  let fileImport = false
  const PREFIX = 'vuetify-styles/'
  const SSR_PREFIX = `/@${PREFIX}`
  const resolveCss = resolveCssFactory()
  const api = options.registerApi ?? 'modern-compiler'

  const [major, minor, patch] = VITE_VERSION.split('.')
      .map((v: string) => v.includes('-') ? v.split('-')[0] : v)
      .map(v => Number.parseInt(v))

  return <PluginOption>{
    name: 'unplugin-vuetify:styles',
    enforce: 'pre',
    config(config) {
      if (!api)
        return null

      if (api === 'modern-compiler') {
        return {
          css: {
            preprocessorOptions: {
              sass: { api },
              scss: { api },
            },
          },
        }
      }

      if (config.css && !('preprocessorMaxWorkers' in config.css)) {
        return {
          css: {
            preprocessorOptions: {
              sass: { api },
              scss: { api },
            },
          },
        }
      }

      return {
        css: {
          preprocessorOptions: {
            sass: { api },
            scss: { api },
          },
          preprocessorMaxWorkers: true,
        },
      }
    },
    configResolved(config) {
      if (config.plugins.findIndex(plugin => plugin.name === 'vuetify:styles') > -1)
        throw new Error('The "vite-plugin-vuetify" styles plugin is incompatible with this plugin. Please remove "vite-plugin-vuetify" or set the styles to \'none\' in your Vite configuration file.')

      if (isObject(options.mode)) {
        sassVariables = true
        // use file import when vite version > 5.4.2
        // check https://github.com/vitejs/vite/pull/17909
        fileImport = major > 5 || (major === 5 && minor > 4) || (major === 5 && minor === 4 && patch > 2)
        if (path.isAbsolute(options.mode.configFile))
          configFile = path.resolve(options.mode.configFile)
        else
          configFile = path.resolve(path.join(config.root || process.cwd(), options.mode.configFile))

        configFile = fileImport
            ? pathToFileURL(configFile).href
            : normalizePath(configFile)
      }
      else {
        isNone = options.mode === 'none'
      }
    },
    async resolveId(source, importer, { custom, ssr }) {
      if (source.startsWith(PREFIX) || source.startsWith(SSR_PREFIX)) {
        if (source.match(/\.s[ca]ss$/))
          return source

        const idx = source.indexOf('?')
        return idx > -1 ? source.slice(0, idx) : source
      }

      if (
          source === 'vuetify/styles' || (
              importer
              && source.endsWith('.css')
              && isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
          )
      ) {
        if (options.mode === 'source')
          return this.resolve(await resolveCss(source), importer, { skipSelf: true, custom })

        const resolution = await this.resolve(source, importer, { skipSelf: true, custom })
        if (!resolution)
          return undefined

        const target = await resolveCss(resolution.id)
        if (isNone) {
          noneFiles.add(target)
          return target
        }

        return `${ssr ? SSR_PREFIX : PREFIX}${path.relative(vuetifyBase, target)}`
      }

      return undefined
    },
    load(id) {
      if (sassVariables) {
        const target = id.startsWith(PREFIX)
            ? path.resolve(vuetifyBase, id.slice(PREFIX.length))
            : id.startsWith(SSR_PREFIX)
                ? path.resolve(vuetifyBase, id.slice(SSR_PREFIX.length))
                : undefined

        if (target) {
          const suffix = target.match(/\.scss/) ? ';\n' : '\n'
          return {
            code: `@use "${configFile}"${suffix}@use "${fileImport ? pathToFileURL(target).href : normalizePath(target)}"${suffix}`,
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

function resolveCssFactory() {
  const mappings = new Map<string, string>()
  return async (source: string) => {
    let mapping = mappings.get(source)
    if (!mapping) {
      try {
        mapping = source.replace(/\.css$/, '.sass')
        await fsp.access(mapping, fs.constants.R_OK)
      }
      catch (err) {
        if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
          throw err
        mapping = source.replace(/\.css$/, '.scss')
      }
      mappings.set(source, mapping)
    }
    return mapping
  }
}

function isObject (value: any): value is object {
  return value !== null && typeof value === 'object'
}

// Add leading slash to absolute paths on windows
function normalizePath (p: string) {
  p = path.normalize(p)
  return /^[a-z]:\//i.test(p) ? '/' + p : p
}

function isSubdir(root: string, test: string) {
  const relative = relativePath(root, test)
  return relative && !relative.startsWith('..') && !isAbsolute(relative)
}
