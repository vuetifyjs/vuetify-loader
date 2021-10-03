import * as path from 'upath'
import { writeStyles } from '@vuetify/loader-shared'
import { getVueRules } from './getVueRules'

import type { Compiler } from 'webpack'
import type { Options } from '@vuetify/loader-shared'
import type { Resolver, ResolveContext } from 'enhanced-resolve'

// Can't use require.resolve() for this, it doesn't work with resolve.symlinks
let vuetifyBase: string
async function getVuetifyBase (base: string, context: ResolveContext, resolver: Resolver) {
  if (!getVuetifyBase.promise) {
    let resolve: (v: any) => void
    getVuetifyBase.promise = new Promise((_resolve) => resolve = _resolve)
    resolver.resolve({}, base, 'vuetify/package.json', context, (err, vuetifyPath) => {
      if (vuetifyPath) {
        vuetifyBase = path.dirname(vuetifyPath as string)
      }
      resolve(true)
    })
  }
  return getVuetifyBase.promise
}
getVuetifyBase.promise = null as Promise<any> | null

export class VuetifyLoaderPlugin {
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
      const vueRules = getVueRules(compiler)

      if (!vueRules.length) {
        throw new Error(
          `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
          `Make sure there is at least one root-level rule that uses vue-loader and VuetifyLoaderPlugin is applied after VueLoaderPlugin.`
        )
      }

      const rules = [...compiler.options.module.rules]
      vueRules.forEach(({ rule, index }) => {
        rule.oneOf = [
          {
            resourceQuery: '?',
            use: rule.use
          },
          {
            use: [
              { loader: require.resolve('./scriptLoader') },
              ...rule.use
            ]
          },
        ]
        delete rule.use

        rules[index] = rule
      })
      compiler.options.module.rules = rules
    }

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
    }
    if (this.options.styles === 'expose') {
      function isSubdir (root: string, test: string) {
        const relative = path.relative(root, test)
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
      }

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
          let start = files.size
          await promise
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
              if (request.path && !vuetifyBase && request.request !== 'vuetify/package.json') {
                await getVuetifyBase(request.path, context, resolver)
              }

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
