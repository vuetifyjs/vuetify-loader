import * as path from 'upath'
import { URLSearchParams } from 'url'
import { resolveVuetifyBase, writeStyles } from '@vuetify/loader-shared'

import type { Compiler, NormalModule, Module } from 'webpack'
import type { Options } from '@vuetify/loader-shared'

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export class VuetifyPlugin {
  options: Required<Options>

  constructor (options: Options) {
    this.options = {
      autoImport: true,
      styles: true,
      stylesTimeout: 10000,
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
        use: { loader: require.resolve('./scriptLoader') },
      })
    }

    const vuetifyBase = resolveVuetifyBase()

    if (
      this.options.styles === 'none' ||
      this.options.styles === 'expose'
    ) {
      compiler.options.module.rules.push({
        enforce: 'pre',
        test: /\.css$/,
        include: /node_modules[/\\]vuetify[/\\]/,
        issuer: /node_modules[/\\]vuetify[/\\]/,
        loader: 'null-loader',
      })
    } else if (this.options.styles === 'sass') {
      compiler.hooks.normalModuleFactory.tap('vuetify-loader', factory => {
        factory.hooks.beforeResolve.tap('vuetify-loader', resolveData => {
          if (
            resolveData.request.endsWith('.css') &&
            isSubdir(vuetifyBase, resolveData.context)
          ) {
            const match = resolveData.request.match(/.*!(.+\.css)$/)
            if (match) {
              resolveData.request = match[1].replace(/\.css$/, '.sass')
            } else {
              resolveData.request = resolveData.request.replace(/\.css$/, '.sass')
            }
          }
        })
      })
    }

    if (this.options.styles === 'expose') {
      const files = new Set<string>()
      let resolve: (v: boolean) => void
      let promise: Promise<boolean> | null
      let timeout: NodeJS.Timeout

      const blockingModules = new Set<string>()
      const pendingModules = new Map<string, Module>()
      compiler.hooks.compilation.tap('vuetify-loader', (compilation) => {
        compilation.hooks.buildModule.tap('vuetify-loader', (module) => {
          pendingModules.set((module as NormalModule).request, module)
        })
        compilation.hooks.succeedModule.tap('vuetify-loader', (module) => {
          pendingModules.delete((module as NormalModule).request)
          if (
            resolve &&
            !Array.from(pendingModules.keys()).filter(k => !blockingModules.has(k)).length
          ) {
            resolve(false)
          }
        })
      })

      const logger = compiler.getInfrastructureLogger('vuetify-loader')
      const awaitResolve = async (id?: string) => {
        if (id) {
          blockingModules.add(id)
        }

        if (!promise) {
          promise = new Promise((_resolve) => resolve = _resolve)

          clearTimeout(timeout)
          timeout = setTimeout(() => {
            logger.error('styles fallback timeout hit', {
              blockingModules: Array.from(blockingModules.values()),
              pendingModules: Array.from(pendingModules.values(), module => (module as NormalModule).resource),
            })
            resolve(false)
          }, this.options.stylesTimeout)

          if (!Array.from(pendingModules.keys()).filter(k => !blockingModules.has(k)).length) {
            resolve(false)
          }

          const start = files.size
          await promise
          clearTimeout(timeout)
          blockingModules.clear()

          if (files.size > start) {
            await writeStyles(files)
          }
          promise = null
        }

        return promise
      }

      compiler.options.module.rules.push({
        enforce: 'pre',
        test: /\.s[ac]ss$/,
        loader: require.resolve('./styleLoader'),
        options: { awaitResolve },
      })

      compiler.options.resolve.plugins = compiler.options.resolve.plugins || []
      compiler.options.resolve.plugins.push({
        apply (resolver) {
          resolver
            .getHook('resolve')
            .tapAsync('vuetify-loader', async (request, context, callback) => {
              if (!(
                request.path &&
                request.request?.endsWith('.css') &&
                isSubdir(vuetifyBase, request.path)
              )) {
                return callback()
              }

              resolver.resolve(
                {},
                request.path,
                request.request.replace(/\.css$/, '.sass'),
                context,
                (err, resolution) => {
                  if (resolution && !files.has(resolution)) {
                    awaitResolve()
                    files.add(resolution)
                  }
                  return callback()
                }
              )
            })
        }
      })
    }
  }
}
