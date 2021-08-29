import { Compiler, RuleSetUseItem } from 'webpack'

let vueLoaderPath: string
try {
  vueLoaderPath = require.resolve('vue-loader')
} catch (err) {}

export function isVueLoader (use: RuleSetUseItem) {
  return typeof use === 'object' && (
    use.ident === 'vue-loader-options' ||
    use.loader === 'vue-loader' ||
    (vueLoaderPath && use.loader === vueLoaderPath)
  )
}

export function getVueRules (compiler: Compiler) {
  const rules = compiler.options.module.rules

  // Naive approach without RuleSet or RuleSetCompiler
  return rules.map((rule, index) => (
    (typeof rule === 'object' &&
      Array.isArray(rule?.use) &&
      rule.use.find(isVueLoader))
      ? { rule: { ...rule }, index }
      : null
  )).filter(v => v != null) as { rule: any, index: number }[]
}
