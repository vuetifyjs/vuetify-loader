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
    rules.map((rule, i) => rule.use && rule.use.find && rule.use.find(isVueLoader) ? i : null).filter(v => v != null)

    // find the rules that apply to vue files
    return rules.filter(rule => rule.use && rule.use.find && rule.use.find(isVueLoader))
  }
}
