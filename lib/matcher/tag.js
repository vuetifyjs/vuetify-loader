const { map } = require('./generator')

module.exports = function match (_, { kebabTag, camelTag: tag }) {
  if (!kebabTag.startsWith('v-')) return

  if (tag in map) {
    return [tag, `import { ${tag} } from 'vuetify/lib/components/${map[tag]}';`]
  }
}
