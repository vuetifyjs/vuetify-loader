const RuleSet = require('webpack/lib/RuleSet')
const progressiveLoaderModule = require('../progressive-loader/module')

class VuetifyLoaderPlugin {
  constructor (options) {
    this.options = options || {}
  }

  apply (compiler) {
    // use webpack's RuleSet utility to normalize user rules
    const rawRules = compiler.options.module.rules
    const { rules } = new RuleSet(rawRules)

    // find the rule that applies to vue files
    const vueRuleIndex = rules.findIndex(rule => rule.use && rule.use.find(u => u.ident === 'vue-loader-options'))
    const vueRule = rules[vueRuleIndex]

    if (!vueRule) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
        `Make sure there is at least one root-level rule that uses vue-loader.`
      )
    }

    vueRule.use.unshift({
      loader: require.resolve('./loader'),
      options: {
        match: this.options.match || [],
        attrsMatch: this.options.attrsMatch || []
      }
    })

    if (this.options.progressiveImages) {
      const vueLoaderOptions = vueRule.use.find(use => use.ident === 'vue-loader-options').options
      vueLoaderOptions.compilerOptions = vueLoaderOptions.compilerOptions || {}
      vueLoaderOptions.compilerOptions.modules = vueLoaderOptions.compilerOptions.modules || []
      vueLoaderOptions.compilerOptions.modules.push(progressiveLoaderModule)

      const imageRuleIndex = rules.findIndex(rule => {
        return rule.resource &&
          !rule.resourceQuery &&
          ['.png', '.jpg', '.jpeg', '.gif'].some(ext => rule.resource(ext))
      })
      let imageRule = rules[imageRuleIndex]

      const options = typeof this.options.progressiveImages === 'boolean'
        ? undefined
        : this.options.progressiveImages

      if (!imageRule) {
        imageRule = {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)(\?.*)?$/,
          oneOf: [
            {
              test: /\.(png|jpe?g|gif)$/,
              resourceQuery: options ? options.resourceQuery : /vuetify-preload/,
              use: [
                {
                  loader: 'vuetify-loader/progressive-loader',
                  options
                },
                {
                  loader: 'url-loader',
                  options: { limit: 8000 }
                }
              ]
            },
            {
              loader: 'url-loader',
              options: { limit: 8000 }
            }
          ]
        }
        rules.push(imageRule)
      } else {
        if (Array.isArray(imageRule.use)) {
          imageRule.oneOf = [
            {
              test: /\.(png|jpe?g|gif)$/,
              resourceQuery: options ? options.resourceQuery : /vuetify-preload/,
              use: [
                {
                  loader: 'vuetify-loader/progressive-loader',
                  options
                },
                ...imageRule.use
              ]
            },
            ...imageRule.use
          ]
        } else if (imageRule.loader) {
          imageRule.oneOf = [
            {
              test: /\.(png|jpe?g|gif)$/,
              resourceQuery: options ? options.resourceQuery : /vuetify-preload/,
              use: [
                {
                  loader: 'vuetify-loader/progressive-loader',
                  options
                },
                {
                  loader: imageRule.loader,
                  options: imageRule.options
                }
              ]
            },
            {
              loader: imageRule.loader,
              options: imageRule.options
            }
          ]
        }
        delete imageRule.use
        delete imageRule.loader
        delete imageRule.options
      }
    }

    compiler.options.module.rules = rules
  }
}

module.exports = VuetifyLoaderPlugin
