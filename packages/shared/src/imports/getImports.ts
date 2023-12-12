import { parseTemplate, TemplateMatch } from './parseTemplate'
import importMap from 'vuetify/dist/json/importMap.json' assert { type: 'json' }
import importMapLabs from 'vuetify/dist/json/importMap-labs.json' assert { type: 'json' }
import { isObject } from '../'
import type { Options } from '../'

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
    addImport(imports, component.name, component.symbol, 'vuetify/lib/' + (map.components as any)[component.name].from)
  })
  resolvedDirectives.forEach(directive => {
    addImport(imports, directive.name, directive.symbol, 'vuetify/lib/directives/index.mjs')
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
