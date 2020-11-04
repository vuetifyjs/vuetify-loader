const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')

const ruleSetCompiler = new RuleSetCompiler([
  new BasicMatcherRulePlugin('test', 'resource'),
  new BasicMatcherRulePlugin('include', 'resource'),
  new BasicMatcherRulePlugin('exclude', 'resource', true),
  new BasicMatcherRulePlugin('resource'),
  new BasicMatcherRulePlugin('conditions'),
  new BasicMatcherRulePlugin('resourceQuery'),
  new BasicMatcherRulePlugin('realResource'),
  new BasicMatcherRulePlugin('issuer'),
  new BasicMatcherRulePlugin('compiler'),
  new BasicEffectRulePlugin('type'),
  new BasicEffectRulePlugin('sideEffects'),
  new BasicEffectRulePlugin('parser'),
  new BasicEffectRulePlugin('resolve'),
  new UseEffectRulePlugin()
])

const progressiveLoaderModule = require('../progressive-loader/module')
let vueLoaderPath
try {
  vueLoaderPath = require.resolve('vue-loader')
} catch (err) { }

function isVueLoader(use) {
  return use.ident === 'vue-loader-options' ||
    use.loader === 'vue-loader' ||
    (vueLoaderPath && use.loader === vueLoaderPath)
}

class VuetifyLoaderPlugin {
  constructor(options) {
    this.options = options || {}
  }

  apply(compiler) {
    // use webpack's RuleSet utility to normalize user rules
    const { rules } = compiler.options.module;
    let vueRules;
    for (const rawRule of rules) {
      // skip rules with 'enforce'. eg. rule for eslint-loader
      if (rawRule.enforce) {
        continue
      }
      // skip the `include` check when locating the vue rule
      const clonedRawRule = Object.assign({}, rawRule)
      delete clonedRawRule.include

      const ruleSet = ruleSetCompiler.compile([{
        rules: [clonedRawRule]
      }])
      vueRules = ruleSet.exec({
        resource: 'foo.vue'
      })
      if (vueRules.length > 0) {
        break;
      }
    }

    if (!vueRules.length) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
        `Make sure there is at least one root-level rule that uses vue-loader.`
      )
    }

    // find the rules that apply to vue files
    vueRules = rules.filter(rule => rule.use && rule.use.find(isVueLoader))
    vueRules.forEach(this.updateRule.bind(this))
    compiler.options.module.rules = rules;
  }

  updateRule(rule) {
    if (this.options.progressiveImages) {
      const vueLoaderOptions = rule.use.find(isVueLoader).options
      vueLoaderOptions.compilerOptions = vueLoaderOptions.compilerOptions || {}
      vueLoaderOptions.compilerOptions.modules = vueLoaderOptions.compilerOptions.modules || []
      vueLoaderOptions.compilerOptions.modules.push(progressiveLoaderModule)

      const imageRuleIndex = this.rules.findIndex(rule => {
        return rule.resource &&
          !rule.resourceQuery &&
          ['.png', '.jpg', '.jpeg', '.gif'].some(ext => rule.resource(ext))
      })
      let imageRule = this.rules[imageRuleIndex]

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

    rule.oneOf = [
      {
        resourceQuery: '?',
        use: rule.use
      },
      {
        use: [
          {
            loader: require.resolve('./loader'),
            options: {
              match: this.options.match || [],
              attrsMatch: this.options.attrsMatch || []
            }
          },
          ...rule.use
        ]
      },
    ]
    delete rule.use
  }
}

module.exports = VuetifyLoaderPlugin
