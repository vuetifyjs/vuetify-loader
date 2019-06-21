const { components, getNamespace } = require('./generator')

module.exports = function match (_, { kebabTag, camelTag: tag }) {
  if (!kebabTag.startsWith('v-')) return

  if (components.includes(tag)) {
    return [tag, `import { ${tag} } from 'vuetify/lib/components${getNamespace(tag)}';`]
  }
}
