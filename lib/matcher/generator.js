const Module = require('module')
const originalLoader = Module._load

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  else return originalLoader(request, parent)
}

const { hyphenate } = require('../util')
const components = require('vuetify/es5/components')

Module._load = originalLoader

module.exports = Object.keys(components)
