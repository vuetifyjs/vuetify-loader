const Module = require('module')
const decache = require('decache')
const originalLoader = Module._load
const { readdirSync, statSync } = require('fs')
const { dirname, join, relative } = require('path')

let groupStyleDependencies = new Set()
const vuetifyRootPath = join(require.resolve('vuetify/es5/components'), '../../..')

Module._load = function _load (request, parent) {
  if (request.endsWith('.styl')) return
  if (request.endsWith('.scss')) return
  if (request.endsWith('.sass')) {
    groupStyleDependencies.add(relative(vuetifyRootPath, join(dirname(parent.filename), request)))
  }
  else return originalLoader(request, parent)
}

const directives = Object.keys(require('vuetify/es5/directives'))
  .filter(val => val !== 'default')

const dir = dirname(require.resolve('vuetify/es5/components'))

const components = new Map()
const styles = new Map()
readdirSync(dir).forEach(group => {
  if (!statSync(join(dir, group)).isDirectory()) return

  groupStyleDependencies = new Set()
  const component = require(`vuetify/es5/components/${group}`).default
  if (component.hasOwnProperty('$_vuetify_subcomponents')) {
    Object.keys(component.$_vuetify_subcomponents)
      .forEach(name => {
        components.set(name, group)
        styles.set(name, groupStyleDependencies)
      })
  } else {
    components.set(group, group)
    styles.set(group, groupStyleDependencies)
  }
  // This is required so that groups picks up dependencies they have to other groups.
  // For example VTabs depends on the style from VSlideGroup (VSlideGroup.sass).
  // As VSlideGroup will be loaded before (alphabetically), `Module._load` wouldn't be called for it when processing VTabs (as it would be already in the require cache).
  // By busting the require cache for each groups we unsure that when loading VTabs we do call `Module._load` for `VSlideGroup.sass` and it gets added to the dependencies.
  decache(`vuetify/es5/components/${group}`)
})

// This makes sure Vuetify main styles will be injected.
// Using VApp as it's must be present for Vuetify to work, and it must only be there once.
styles.get('VApp').add('src/styles/main.sass')

Module._load = originalLoader

module.exports = {
  directives,
  components,
  styles
}
