const Module = require('module')
const originalLoader = Module._load

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  if (request.endsWith('.sass')) return
  else return originalLoader(request, parent)
}

const components = Object.keys(require('vuetify/es5/components'))
const directives = Object.keys(require('vuetify/es5/directives'))

components.splice(components.indexOf('default'), 1)

directives.splice(directives.indexOf('clickOutside'), 1)
directives.splice(directives.indexOf('default'), 1)

Module._load = originalLoader

module.exports = {
  components,
  directives
}
