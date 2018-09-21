const Module = require('module')
const originalLoader = Module._load

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  else return originalLoader(request, parent)
}

const { hyphenate } = require('../util')
const components = require('vuetify/es5/components')

Module._load = originalLoader

const componentMap = {}

for (const name in components) {
  if (components[name].hasOwnProperty('$_vuetify_subcomponents')) {
    for (const childName in components[name].$_vuetify_subcomponents) {
      componentMap[childName] = { name: hyphenate(childName), component: childName, group: name }
    }
  } else {
    componentMap[name] = { name: hyphenate(name), component: name, group: name }
  }
}

module.exports = Object.values(componentMap)
