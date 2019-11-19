const { directives } = require('./generator')

module.exports = function attrsMatch (_, { kebabAttr, camelAttr }) {
  if (!kebabAttr.startsWith('v-')) return

  const name = camelAttr.replace(/^V([^.:]+).*$/, '$1')
  const directory = kebabAttr.replace(/^v-([^.:]+).*$/, '$1')
  if (directives.includes(name)) return [name, `import ${name} from 'vuetify/lib/directives/${directory}'`]
}
