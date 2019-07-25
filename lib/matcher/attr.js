const { directives } = require('./generator')

module.exports = function match (_, { kebabAttr, camelAttr: attr }) {
  if (!kebabAttr.startsWith('v-')) return

  const name = attr.slice(1)
  const directory = kebabAttr.slice(2)
  if (directives.includes(name)) return [name, `import ${name} from 'vuetify/lib/directives/${directory}'`]
}
