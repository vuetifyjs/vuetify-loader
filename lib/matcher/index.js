const componentMap = require('./generator')

module.exports = function match (_, { kebabTag, camelTag: tag }) {
  if (!kebabTag.startsWith('v-')) return

  const component = componentMap.find(val => val.component === tag)
  if (component) return [tag, `import { ${tag} } from 'vuetify/lib/components/${component.group}'`]
}
