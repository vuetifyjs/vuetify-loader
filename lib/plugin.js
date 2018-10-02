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
    let vueRuleIndex = rules.findIndex(rule => rule.use.find(u => u.loader === 'vue-loader'))
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

function createMatcher (fakeFile) {
  return (rule, i) => {
    // #1201 we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')
    return (
      !rule.enforce &&
      normalized.resource &&
      normalized.resource(fakeFile)
    )
  }
}

module.exports = VuetifyLoaderPlugin
