import { URLSearchParams } from 'url'
import fs from 'fs/promises'

import path from 'upath'
import mkdirp from 'mkdirp'

import {
  resolveVuetifyBase,
  isObject,
  transformAssetUrls,
  normalizePath,
} from '@vuetify/loader-shared'

import type { Compiler } from 'webpack'
import type { Options } from '@vuetify/loader-shared'

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export class VuetifyPlugin {
  static transformAssetUrls = transformAssetUrls

  options: Required<Options>

  constructor (options: Options) {
    this.options = {
      autoImport: true,
      styles: true,
      ...options,
    }
  }

  async apply (compiler: Compiler) {
    if (this.options.autoImport) {
      compiler.options.module.rules.unshift({
        resourceQuery: query => {
          if (!query) return false
          const qs = new URLSearchParams(query)
          return qs.has('vue') && (
            qs.get('type') === 'template' ||
            (qs.get('type') === 'script' && qs.has('setup'))
          )
        },
        use: {
          loader: 'webpack-plugin-vuetify/scriptLoader',
          options: this.options
        },
      })
    }

    const vueLoader = compiler.options.module.rules.find(rule => {
      return rule && typeof rule !== 'string' && rule.loader && path.toUnix(rule.loader).endsWith('vue-loader/dist/templateLoader.js')
    })
    const vueOptions = typeof vueLoader === 'object' && vueLoader?.options
    if (vueOptions && typeof vueOptions === 'object') {
      vueOptions.transformAssetUrls ??= transformAssetUrls
    }

    const vuetifyBase = resolveVuetifyBase()

    function hookResolve (transform: (file: string) => string | Promise<string>) {
      compiler.resolverFactory.hooks.resolver.for('normal').tap('vuetify-loader', resolver => {
        resolver.getHook('beforeResult').tapAsync('vuetify-loader', async (request, context, callback) => {
          if (
            request.path &&
            request.path.endsWith('.css') &&
            isSubdir(vuetifyBase, request.path)
          ) {
            request.path = await transform(request.path)
          }

          callback(null, request)
        })
      })
    }

    const stylesCache = new Map<string, string>()
    async function resolveCSS (target: string) {
      let result = stylesCache.get(target)
      if (!result) {
        try {
          result = target.replace(/\.css$/, '.sass')
          await fs.access(result, fs.constants.R_OK)
        } catch (err) {
          if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT')) throw err
          result = target.replace(/\.css$/, '.scss')
        }
        stylesCache.set(target, result)
      }
      return result
    }

    if (this.options.styles === 'none') {
      compiler.options.module.rules.push({
        enforce: 'pre',
        test: /\.css$/,
        include: /node_modules[/\\]vuetify[/\\]/,
        issuer: /node_modules[/\\]vuetify[/\\]/,
        loader: 'null-loader',
      })
    } else if (this.options.styles === 'sass') {
      hookResolve(resolveCSS)
    } else if (isObject(this.options.styles)) {
      const findCacheDir = (await import('find-cache-dir')).default
      const cacheDir = findCacheDir({
        name: 'vuetify',
        create: true,
      })!
      const configFile = path.isAbsolute(this.options.styles.configFile)
        ? this.options.styles.configFile
        : path.join(
          compiler.options.context || process.cwd(),
          this.options.styles.configFile,
        )

      hookResolve(async request => {
        const target = await resolveCSS(request)
        const file = path.relative(vuetifyBase, target)
        const cacheFile = path.join(cacheDir, file)
        const suffix = target.match(/\.scss/) ? ';\n' : '\n'
        const contents = `@use "${normalizePath(configFile)}"${suffix}@use "${normalizePath(target)}"${suffix}`

        await mkdirp(path.dirname(cacheFile))
        await fs.writeFile(cacheFile, contents)

        return cacheFile
      })
    }
  }
}
