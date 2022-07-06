const loaderUtils = require('loader-utils')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')

const vuetifyMatcher = require('./matcher/tag')
const vuetifyAttrsMatcher = require('./matcher/attr')
const { camelize, capitalize, hyphenate } = require('./util')

function getMatches (type, items, matches) {
  const imports = []

  items.forEach(item => {
    for (const matcher of matches) {
      const match = matcher(item, {
        [`kebab${type}`]: hyphenate(item),
        [`camel${type}`]: capitalize(camelize(item)),
        path: this.resourcePath.substring(this.rootContext.length + 1),
      })
      if (match) {
        imports.push(match)
        break
      }
    }
  })

  imports.sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
  return imports
}

function injectStylesSSR (imports) {
  const styles = imports.map(componentImport => (componentImport[2] || [])).reduce((acc, styles) => {
    styles && styles.forEach(style => acc.add(style))
    return acc
  }, new Set())

  if (styles.size) {
    return `
render._vuetifyStyles = function (component) {
  if (process.env.VUE_ENV === 'server') {
    const options = typeof component.exports === 'function'
      ? component.exports.extendOptions
      : component.options
    const existing = options.beforeCreate
    const hook = function () {
${[...styles].map((style) => `      require('vuetify/${style}').__inject__(this.$ssrContext)`).join('\n')}
    }
    options.beforeCreate = existing
      ? [].concat(existing, hook)
      : [hook]
  }
}`
  }
  return ''
}

module.exports = async function (content, sourceMap) {
  this.async()
  this.cacheable()

  const options = {
    match: [],
    attrsMatch: [],
    registerStylesSSR: false,
    ...loaderUtils.getOptions(this)
  }

  if (!Array.isArray(options.match)) options.match = [options.match]
  if (!Array.isArray(options.attrsMatch)) options.attrsMatch = [options.attrsMatch]

  options.match.push(vuetifyMatcher)
  options.attrsMatch.push(vuetifyAttrsMatcher)


  this.addDependency(this.resourcePath)

  const matches = {
    components: [],
    directives: [],
  }

  const ast = acorn.parse(content, { sourceType: 'module', ecmaVersion: 'latest' })
  acornWalk.simple(ast, {
    CallExpression (node) {
      if (node.callee.name === '_c') {
        if (node.arguments[0].type === 'Literal') {
          matches.components.push([node.arguments[0].value, node.arguments[0].start, node.arguments[0].end])
        }
        if (node.arguments.length >= 2 && node.arguments[1].type === 'ObjectExpression') {
          const props = node.arguments[1].properties
          props.forEach(prop => {
            if (prop.key.type === 'Identifier' && prop.key.name === 'directives' && prop.value.type === 'ArrayExpression') {
              prop.value.elements.forEach(directive => {
                if (directive.type === 'ObjectExpression') {
                  directive.properties.forEach(prop => {
                    if (prop.key.type === 'Identifier' && prop.key.name === 'name') {
                      matches.directives.push([prop.value.value, prop.start, prop.end])
                    }
                  })
                }
              })
            }
          })
        }
      }
    }
  })

  const components = getMatches.call(this, 'Tag', dedupe(matches.components), options.match)
  const directives = getMatches.call(this, 'Attr', dedupe(matches.directives), options.attrsMatch)

  const allMatches = [...matches.components.map(v => ({
    type: 'component',
    name: capitalize(camelize(v[0])),
    start: v[1],
    end: v[2],
  })), ...matches.directives.map(v => ({
    type: 'directive',
    name: capitalize(camelize(v[0])),
    start: v[1],
    end: v[2],
  }))].sort((a, b) => a.start - b.start)

  for (let i = allMatches.length - 1; i >= 0; i--) {
    const tag = allMatches[i]
    if (tag.type === 'component') {
      if (!components.some(c => c[0] === tag.name)) continue
      content = content.slice(0, tag.start) + tag.name + content.slice(tag.end)
    } else {
      if (!directives.some(c => c[0] === tag.name)) continue
      const indent = content.slice(0, tag.start).match(/\s*$/)[0]
      content = content.slice(0, tag.start) +
        'def: ' + tag.name + ',' +
        indent + content.slice(tag.start)
    }
  }

  const imports = [...components, ...directives]
  if (imports.length) {
    content = imports.map(v => v[1]).join('\n') + '\n\n' + content
  }

  if (options.registerStylesSSR) {
    content += injectStylesSSR(imports)
  }

  this.callback(null, content, sourceMap)
}

function dedupe (matches) {
  return [...new Set(matches.map(i => capitalize(camelize(i[0]))))]
}
