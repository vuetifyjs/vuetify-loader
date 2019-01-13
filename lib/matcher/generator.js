const Module = require('module')
const originalLoader = Module._load

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  if (request.endsWith('.sass')) return
  else return originalLoader(request, parent)
}

const { hyphenate } = require('../util')
const components = require('vuetify/es5/components')
const directives = require('vuetify/es5/directives')

Module._load = originalLoader

module.exports = {
  components: Object.keys(components),
  directives: Object.keys(directives)
}
