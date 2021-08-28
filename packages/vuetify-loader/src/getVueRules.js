let vueLoaderPath
try {
  vueLoaderPath = require.resolve('vue-loader')
} catch (err) {}

function isVueLoader (use) {
  return use.ident === 'vue-loader-options' ||
    use.loader === 'vue-loader' ||
    (vueLoaderPath && use.loader === vueLoaderPath)
}

module.exports = {
  isVueLoader,
  getVueRules (compiler) {
    const rules = compiler.options.module.rules

    // Naive approach without RuleSet or RuleSetCompiler
    return rules.map((rule, index) => (
      rule.use && rule.use.find && rule.use.find(isVueLoader)
        ? { rule: { ...rule }, index }
        : null
    )).filter(v => v != null)
  }
}
