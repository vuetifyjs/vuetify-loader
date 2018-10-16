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
    tags.forEach(tag => {
      for (const matcher of options.match) {
        const match = matcher(tag, {
          kebabTag: hyphenate(tag),
          camelTag: capitalize(camelize(tag)),
          path: this.resourcePath.substring(this.rootContext.length + 1),
          component
        })
        if (match) {
          imports.push(match)
          break
        }
      }
    })

    imports.sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))

    if (imports.length) {
      let newContent = '/* vuetify-loader */\n'
      imports.forEach(i => {
        newContent += i[1] + '\n'
      })
      const components = imports.map(i => i[0])
      newContent += 'component.options.components = component.options.components || {}\n'
      components.forEach(c => {
        newContent += `component.options.components['${c}'] = component.options.components['${c}'] || ${c}\n`
      })

      // Insert our modification before the HMR code
      const hotReload = content.indexOf('/* hot reload */')
      if (hotReload > -1) {
        content = content.slice(0, hotReload) + newContent + '\n\n' + content.slice(hotReload)
      } else {
        content += '\n\n' + newContent
      }
    }
  }

  this.callback(null, content, sourceMap)
}
