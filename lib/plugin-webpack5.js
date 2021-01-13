const qs = require('querystring');
const progressiveLoaderModule = require('../progressive-loader/module')
let vueLoaderPath
try {
  vueLoaderPath = require.resolve('vue-loader')
} catch (err) {}
const NS = 'vuetify-loader'
const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const DescriptionDataMatcherRulePlugin = require('webpack/lib/rules/DescriptionDataMatcherRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')

const ruleSetCompiler = new RuleSetCompiler([
  new BasicMatcherRulePlugin('test', 'resource'),
  new BasicMatcherRulePlugin('mimetype'),
  new BasicMatcherRulePlugin('dependency'),
  new BasicMatcherRulePlugin('include', 'resource'),
  new BasicMatcherRulePlugin('exclude', 'resource', true),
  new BasicMatcherRulePlugin('conditions'),
  new BasicMatcherRulePlugin('resource'),
  new BasicMatcherRulePlugin('resourceQuery'),
  new BasicMatcherRulePlugin('resourceFragment'),
  new BasicMatcherRulePlugin('realResource'),
  new BasicMatcherRulePlugin('issuer'),
  new BasicMatcherRulePlugin('compiler'),
  new DescriptionDataMatcherRulePlugin(),
  new BasicEffectRulePlugin('type'),
  new BasicEffectRulePlugin('sideEffects'),
  new BasicEffectRulePlugin('parser'),
  new BasicEffectRulePlugin('resolve'),
  new BasicEffectRulePlugin('generator'),
  new UseEffectRulePlugin()
]);

function isVueLoader (use) {
  return use.ident === 'vue-loader-options' ||
    use.loader === 'vue-loader' ||
    (vueLoaderPath && use.loader === vueLoaderPath)
}

class VuetifyLoaderPlugin {
  constructor (options) {
    this.options = options || {}
  }

  apply (compiler) {
    const rules = compiler.options.module.rules
    let rawVueRules
    let vueRules = []

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

      if (!vueRules.length) {
        vueRules = ruleSet.exec({
          resource: 'foo.vue.html'
        })
      }
      if (vueRules.length > 0) {
        if (rawRule.oneOf) {
          throw new Error(
            `[VueLoaderPlugin Error] vue-loader 15 currently does not support vue rules with oneOf.`
          )
        }
        rawVueRules = rawRule
        break
      }
    }
    if (!vueRules.length) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching rule for .vue files found.\n` +
        `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }

    // get the normlized "use" for vue files
    const vueUse = vueRules.filter(rule => rule.type === 'use').map(rule => rule.value)

    // get vue-loader options
    const vueLoaderUseIndex = vueUse.findIndex(u => {
      return /^vue-loader|(\/|\\|@)vue-loader/.test(u.loader)
    })

    if (vueLoaderUseIndex < 0) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching use for vue-loader is found.\n` +
        `Make sure the rule matching .vue files include vue-loader in its use.`
      )
    }

    // make sure vue-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??vue-loader-options
    const vueLoaderUse = vueUse[vueLoaderUseIndex]
    vueLoaderUse.ident = 'vue-loader-options'
    vueLoaderUse.options = vueLoaderUse.options || {}

    // for each user rule (expect the vue rule), create a cloned rule
    // that targets the corresponding language blocks in *.vue files.
    const refs = new Map()
    const clonedRules = rules
      .filter(r => r !== rawVueRules)
      .map((rawRule) => cloneRule(rawRule, refs))

    // fix conflict with config.loader and config.options when using config.use
    delete rawVueRules.loader
    delete rawVueRules.options
    rawVueRules.use = vueUse

    const vuetifyRules = rules
      .filter(rule => rule.use && rule.use.find(isVueLoader));

    if (!vuetifyRules.length) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
        `Make sure there is at least one root-level rule that uses vue-loader.`
      )
    }

    vuetifyRules.forEach(this.updateRule.bind(this))

    // replace original rules
    compiler.options.module.rules = [
      ...clonedRules,
      ...rules
    ]
  }

  updateRule (rule) {
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
              attrsMatch: this.options.attrsMatch || [],
              registerStylesSSR: this.options.registerStylesSSR || false
            }
          },
          ...rule.use
        ]
      },
    ]
    delete rule.use
  }
}

let uid = 0;

function cloneRule (rawRule, refs) {
  const rules = ruleSetCompiler.compileRules(`clonedRuleSet-${++uid}`, [{
    rules: [rawRule]
  }], refs)
  let currentResource

  const conditions = rules[0].rules
    .map(rule => rule.conditions)
    // shallow flat
    .reduce((prev, next) => prev.concat(next), [])

  // do not process rule with enforce
  if (!rawRule.enforce) {
    const ruleUse = rules[0].rules
      .map(rule => rule.effects
        .filter(effect => effect.type === 'use')
        .map(effect => effect.value)
      )
      // shallow flat
      .reduce((prev, next) => prev.concat(next), [])

    // fix conflict with config.loader and config.options when using config.use
    delete rawRule.loader
    delete rawRule.options
    rawRule.use = ruleUse
  }

  const res = Object.assign({}, rawRule, {
    resource: resources => {
      currentResource = resources
      return true
    },
    resourceQuery: query => {
      if (!query) { return false }
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null) {
        return false
      }
      if (!conditions) {
        return false
      }
      const fakeResourcePath = `${currentResource}.${parsed.lang}`
      for (const condition of conditions) {
        // add support for resourceQuery
        const request = condition.property === 'resourceQuery' ? query : fakeResourcePath
        if (condition && !condition.fn(request)) {
          return false
        }
      }
      return true
    }
  })

  delete res.test

  if (rawRule.rules) {
    res.rules = rawRule.rules.map(rule => cloneRule(rule, refs))
  }

  if (rawRule.oneOf) {
    res.oneOf = rawRule.oneOf.map(rule => cloneRule(rule, refs))
  }

  return res
}

VuetifyLoaderPlugin.NS = NS;

module.exports = VuetifyLoaderPlugin
