const Module = require('module')
const originalLoader = Module._load
const { readdirSync } = require('fs')
const { dirname } = require('path')

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  if (request.endsWith('.sass')) return
  else return originalLoader(request, parent)
}

const components = Object.keys(require('vuetify/es5/components'))
const directives = Object.keys(require('vuetify/es5/directives'))

const dir = dirname(require.resolve('vuetify/es5/components'))
const re = new RegExp(
  readdirSync(dir).filter(f => f.startsWith('V')).join('|')
);

const getNamespace = tag => {
  if(/VContainer|VContent|VFlex|VLayout|VSpacer/.test(tag)) {
    return '/VGrid'
  }
  let m = tag.match(re)
  if(m) {
    if(m[0] == 'Vuetify') m[0] = 'vuetify' // Get rid of warnings
    return `/${m[0]}`
  }
  return ''
}

components.splice(components.indexOf('default'), 1)

directives.splice(directives.indexOf('ClickOutside'), 1)
directives.splice(directives.indexOf('default'), 1)

Module._load = originalLoader

module.exports = {
  components,
  directives,
  getNamespace
}
