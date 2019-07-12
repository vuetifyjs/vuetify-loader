const Module = require('module')
const originalLoader = Module._load
const { readdirSync, lstatSync } = require('fs')
const { dirname } = require('path')

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  if (request.endsWith('.sass')) return
  else return originalLoader(request, parent)
}

const directives = Object.keys(require('vuetify/es5/directives'))

const dir = dirname(require.resolve('vuetify/es5/components'))
const items = readdirSync(dir)
const map = {}

for(let i = 0; i < items.length; i++) {
  let name = items[i]
  if(lstatSync(`${dir}/${name}`).isDirectory()) {
    let component = require(`vuetify/es5/components/${name}`).default
    if (component.hasOwnProperty('$_vuetify_subcomponents')) {
      for (const childName in component.$_vuetify_subcomponents) {
        map[childName] = name
      }
    } else {
      map[name] = name
    }
  }
}
directives.splice(directives.indexOf('ClickOutside'), 1)
directives.splice(directives.indexOf('default'), 1)

Module._load = originalLoader

module.exports = {
  directives,
  map
}
