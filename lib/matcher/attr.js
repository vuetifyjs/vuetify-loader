const directives = require('./generator').directives

module.exports = function match (_, { kebabAttr, camelAttr: attr }) {
  if (!kebabAttr.startsWith('v-')) return

  const directive = attr.charAt(1).toLowerCase() + attr.substr(2)
  if (directives.includes(directive)) return [directive, `import { ${directive} } from 'vuetify/lib/directives'`]
}
