import { createRequire } from 'node:module'
import { parseTemplate, TemplateMatch } from './parseTemplate'
import { isObject } from '../'
import type { Options } from '../'

const require = createRequire(import.meta.url)

const importMap = require('vuetify/dist/json/importMap.json') as typeof import('vuetify/dist/json/importMap.json')
const importMapLabs = require('vuetify/dist/json/importMap-labs.json') as typeof import('vuetify/dist/json/importMap-labs.json')

export function getImports (source: string, options: Options) {
  const { components, directives } = parseTemplate(source)
  const resolvedComponents: TemplateMatch[] = []
  const resolvedDirectives: TemplateMatch[] = []
  const imports = new Map<string, string[]>()
  const ignore = (isObject(options.autoImport) && options.autoImport.ignore) || null
  const includeLabs = isObject(options.autoImport) && options.autoImport.labs
  const map = includeLabs
    ? {
      components: { ...importMap.components, ...importMapLabs.components },
      directives: importMap.directives,
    }
    : importMap

  if (components.size || directives.size) {
    components.forEach(component => {
      if (ignore?.includes(component.name as any)) return
      if (component.name in importMap.components) {
        resolvedComponents.push(component)
      } else if (includeLabs && component.name in importMapLabs.components) {
        resolvedComponents.push(component)
      }
    })
    directives.forEach(directive => {
      if (importMap.directives.includes(directive.name) && !ignore?.includes(directive.name as any)) {
        resolvedDirectives.push(directive)
      }
    })
  }

  resolvedComponents.forEach(component => {
    const from = (map.components as any)[component.name].from
    // Vuetify 3.7.11+ resolves to subpath exports instead of a file in /lib
    const lib = from.endsWith('.mjs') ? 'lib/' : ''
    addImport(imports, component.name, component.symbol, 'vuetify/' + lib + from)
  })
  resolvedDirectives.forEach(directive => {
    addImport(imports, directive.name, directive.symbol, 'vuetify/directives')
  })

  return {
    imports,
    components: resolvedComponents,
    directives: resolvedDirectives,
  }
}

function addImport (imports: Map<string, string[]>, name: string, as: string, from: string) {
  if (!imports.has(from)) {
    imports.set(from, [])
  }
  imports.get(from)!.push(`${name} as ${as}`)
}
