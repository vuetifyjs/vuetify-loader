import { URLSearchParams } from 'url'
import { writeFile } from 'fs/promises'

import path from 'upath'
import mkdirp from 'mkdirp'

import {
  resolveVuetifyBase,
  isObject,
  cacheDir,
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

  apply (compiler: Compiler) {
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
          loader: require.resolve('./scriptLoader'),
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

    if (this.options.styles === 'none') {
      compiler.options.module.rules.push({
        enforce: 'pre',
        test: /\.css$/,
        include: /node_modules[/\\]vuetify[/\\]/,
        issuer: /node_modules[/\\]vuetify[/\\]/,
        loader: 'null-loader',
      })
    } else if (this.options.styles === 'sass') {
      hookResolve(file => file.replace(/\.css$/, '.sass'))
    } else if (isObject(this.options.styles)) {
      const configFile = path.isAbsolute(this.options.styles.configFile)
        ? this.options.styles.configFile
        : path.join(
          compiler.options.context || process.cwd(),
          this.options.styles.configFile,
        )

      hookResolve(async request => {
        const target = request.replace(/\.css$/, '.sass')
        const file = path.relative(vuetifyBase, target)
        const cacheFile = path.join(cacheDir, file)

        await mkdirp(path.dirname(cacheFile))
        await writeFile(cacheFile, `@use "${normalizePath(configFile)}"\n@use "${normalizePath(target)}"`)

        return cacheFile
      })
    }
  }
}
