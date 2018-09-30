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
    let vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue`))
    if (vueRuleIndex < 0) {
      vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue.html`))
    }
    const vueRule = rules[vueRuleIndex]

    if (!vueRule) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for .vue files found.\n` +
        `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }

    vueRule.use.unshift({
      loader: require.resolve('./loader'),
      options: this.options
    })
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
