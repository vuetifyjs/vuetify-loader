import { Compiler } from 'webpack'
import { getVueRules } from './getVueRules'

export class VuetifyLoaderPlugin {
  options: any

  constructor (options: any) {
    this.options = options || {}
  }

  apply (compiler: Compiler) {
    const vueRules = getVueRules(compiler)

    if (!vueRules.length) {
      throw new Error(
        `[VuetifyLoaderPlugin Error] No matching rule for vue-loader found.\n` +
        `Make sure there is at least one root-level rule that uses vue-loader and VuetifyLoaderPlugin is applied after VueLoaderPlugin.`
      )
    }

    vueRules.forEach(rule => this.updateVueRule.bind(this, rule))

    const rules = [...compiler.options.module.rules]
    vueRules.forEach(({ rule, index }) => {
      rules[index] = rule
    })
    compiler.options.module.rules = rules
  }

  updateVueRule ({ rule }: { rule: any }) {
    rule.oneOf = [
      {
        resourceQuery: '?',
        use: rule.use
      },
      {
        use: [
          { loader: require.resolve('./loader') },
          ...rule.use
        ]
      },
    ]
    delete rule.use
  }
}
