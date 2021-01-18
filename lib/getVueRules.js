
const webpack = require('webpack')

let vueLoaderPath
try {
  vueLoaderPath = require.resolve('vue-loader')
} catch (err) {}

module.exports = {
  isVueLoader (use) {
    return use.ident === 'vue-loader-options' ||
      use.loader === 'vue-loader' ||
      (vueLoaderPath && use.loader === vueLoaderPath)
  },
  getVueRules (compiler) {
    const rules = compiler.options.module.rules

    // Naive approach without RuleSet or RuleSetCompiler
    rules.map((rule, i) => rule.use && rule.use.find(exports.isVueLoader) ? i : null).filter(v => v != null)

    // find the rules that apply to vue files
    return rules.filter(rule => rule.use && rule.use.find(exports.isVueLoader))
  }
}
