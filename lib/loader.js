const path = require('path')
const loaderUtils = require('loader-utils')
const compiler = require('vue-template-compiler')
const vuetifyMatcher = require('./matcher')
const { camelize, capitalize, hyphenate } = require('./util')
const installComponentsPath = require.resolve('./runtime/installComponents')

module.exports = async function (content, sourceMap) {
  this.async()
  this.cacheable()

  const options = {
    match: [],
    ...loaderUtils.getOptions(this)
  }

  if (!Array.isArray(options.match)) options.match = [options.match]

  options.match.push(vuetifyMatcher)

  if (!this.resourceQuery) {
    const readFile = path => new Promise((resolve, reject) => {
      this.fs.readFile(path, function (err, data) {
        if (err) reject(err)
        else resolve(data)
      })
    })

    this.addDependency(this.resourcePath)

    const tags = new Set()
    const file = (await readFile(this.resourcePath)).toString('utf8')
    const component = compiler.parseComponent(file)
    if (component.template) {
      if (component.template.src) {
        const externalFile = path.resolve(path.dirname(this.resourcePath), component.template.src);
        const externalContent = (await readFile(externalFile)).toString('utf8')
        component.template.content = externalContent
      }
      if (component.template.lang === 'pug') {
        const pug = require('pug')
        component.template.content = pug.compile(component.template.content)()
      }
      compiler.compile(component.template.content, {
        modules: [{
          postTransformNode: node => { tags.add(node.tag) }
        }]
      })
    }

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
      newContent += `import installComponents from ${loaderUtils.stringifyRequest(this, '!' + installComponentsPath)}\n`
      imports.forEach(i => {
        newContent += i[1] + '\n'
      })
      const components = imports.map(i => i[0])
      newContent += 'installComponents(component, {\n'
      components.forEach(c => {
        newContent += `  ${c},\n`
      })
      newContent += '})\n'

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
