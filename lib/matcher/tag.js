const components = require('./generator').components

module.exports = function match (_, { kebabTag, camelTag: tag }) {
  if (!kebabTag.startsWith('v-')) return

  if (components.includes(tag)) return [tag, `import { ${tag} } from 'vuetify/lib'`]
}
