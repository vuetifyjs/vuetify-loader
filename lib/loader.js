const loaderUtils = require('loader-utils')
const compiler = require('vue-template-compiler')
const vuetifyMatcher = require('./matcher')
const { camelize, capitalize, hyphenate } = require('./util')

module.exports = function (content, sourceMap) {
  this.cacheable()

  const options = {
    match: [],
    ...loaderUtils.getOptions(this)
  }

  if (!Array.isArray(options.match)) options.match = [options.match]

  options.match.push(vuetifyMatcher)

  if (!this.resourceQuery) {
    this.addDependency(this.resourcePath)

    const tags = new Set()
    const file = this.fs.readFileSync(this.resourcePath).toString('utf8')
    const component = compiler.parseComponent(file)
    component.template && compiler.compile(component.template.content, {
      modules: [{
        postTransformNode: node => { tags.add(node.tag) }
      }]
    })

    const imports = []
    const components = []
    tags.forEach(tag => {
      for (const matcher of options.match) {
        const match = matcher(tag, {
          kebabTag: hyphenate(tag),
          camelTag: capitalize(camelize(tag)),
          path: this.resourcePath.substring(this.rootContext.length + 1),
          component
        })
        if (match) {
          components.push(match[0])
          imports.push(match[1])
          break
        }
      }
    })

    if (imports.length) {
      content += '\n\n/* vuetify-loader */\n'
      imports.forEach(i => {
        content += i + '\n'
      })
      content += `component.options.components = Object.assign({\n  ${components.join(',\n  ')}\n}, component.options.components)`
    }
  }

  this.callback(null, content, sourceMap)
}
