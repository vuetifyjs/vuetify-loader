const RuleSet = require('webpack/lib/RuleSet')

class VuetifyLoaderPlugin {
  constructor (options) {
    this.options = options
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
      options: this.options
    })

    compiler.options.module.rules = rules
  }
}

module.exports = VuetifyLoaderPlugin
