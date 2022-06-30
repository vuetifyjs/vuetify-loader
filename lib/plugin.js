const url = require('url')
const path = require('path')
const progressiveLoaderModule = require('../progressive-loader/module')
const { isVueLoader, getVueRules } = require('./getVueRules')

class VuetifyLoaderPlugin {
  constructor (options) {
    this.options = options || {}
  }

  apply (compiler) {
    const vueRules = getVueRules(compiler)

    if (!vueRules.length) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
        `Make sure there is at least one root-level rule that uses vue-loader and VuetifyLoaderPlugin is applied after VueLoaderPlugin.`
      )
    }

    compiler.options.module.rules.unshift({
      test: /\.vue$/,
      // include: name => name.endsWith('.vue'),
      // resourceQuery: (query) => {
      //   if (!query) return false
      //   const qs = new URLSearchParams(query)
      //   return qs.has('vue') && qs.get('type') === 'template'
      // },
      use: {
        loader: require.resolve('./loader'),
        options: {
          match: this.options.match || [],
          attrsMatch: this.options.attrsMatch || [],
          registerStylesSSR: this.options.registerStylesSSR || false
        }
      },
    })

    vueRules.forEach(this.updateVueRule.bind(this))

    if (this.options.progressiveImages) {
      const options = typeof this.options.progressiveImages === 'boolean'
        ? undefined
        : this.options.progressiveImages
      const resourceQuery = options && options.resourceQuery || 'vuetify-preload'

      compiler.hooks.compilation.tap('VuetifyLoaderPlugin', compilation => {
        compilation.hooks.buildModule.tap('VuetifyLoaderPlugin', module => {
          if (!module.resource) return
          const resource = url.parse(module.resource)
          if (
            resource.query === resourceQuery &&
            ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(path.extname(resource.pathname))
          ) {
            if (/^asset\/?/.test(module.type)) {
              compilation.errors.push(new Error(
                'vuetify-loader: progressiveImages does not work with asset modules, use file-loader or url-loader\n' +
                `"${module.rawRequest}" will be loaded normally\n` +
                'See https://webpack.js.org/guides/asset-modules/'
              ))
            } else {
              module.loaders.unshift({
                loader: require.resolve('vuetify-loader/progressive-loader'),
                options
              })
            }
          }
        })
      })
    }
  }

  updateVueRule ({ rule }) {
    if (this.options.progressiveImages) {
      const vueLoaderOptions = rule.use.find(isVueLoader).options
      vueLoaderOptions.compilerOptions = vueLoaderOptions.compilerOptions || {}
      vueLoaderOptions.compilerOptions.modules = vueLoaderOptions.compilerOptions.modules || []
      vueLoaderOptions.compilerOptions.modules.push(progressiveLoaderModule)
    }
  }
}

module.exports = VuetifyLoaderPlugin
