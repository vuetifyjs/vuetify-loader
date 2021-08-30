import { parseTemplate } from './parseTemplate'
import importMap from 'vuetify/dist/json/importMap.json'

/** key: module ID, value: resolved components */
const componentsMap = new Map<string, Set<string>>()
const directivesMap = new Map<string, Set<string>>()

export function getImports (source: string, id: string) {
  const { components, directives } = parseTemplate(source)
  const resolvedComponents = componentsMap.get(id) || (componentsMap.set(id, new Set()), componentsMap.get(id)!)
  const resolvedDirectives = directivesMap.get(id) || (directivesMap.set(id, new Set()), directivesMap.get(id)!)
  const imports = new Map<string, string[]>()

  const componentsStart = resolvedComponents.size
  const directivesStart = resolvedDirectives.size

  if (components.size || directives.size) {
    addImport(imports, 'installAssets', '@vuetify/loader-shared/runtime')
    components.forEach(name => {
      if (name in importMap.components) {
        resolvedComponents.add(name)
      }
    })
    directives.forEach(name => {
      if (importMap.directives.includes(name)) {
        resolvedDirectives.add(name)
      }
    })
  }

  resolvedComponents.forEach(name => {
    addImport(imports, name, 'vuetify/lib/' + (importMap.components as any)[name].from)
  })
  resolvedDirectives.forEach(name => {
    addImport(imports, name, 'vuetify/lib/directives/index.mjs')
  })

  const hasNewImports =
    resolvedComponents.size > componentsStart ||
    resolvedDirectives.size > directivesStart

  return {
    imports,
    hasNewImports,
    components: Array.from(resolvedComponents),
    directives: Array.from(resolvedDirectives),
  }
}

function addImport (imports: Map<string, string[]>, name: string, from: string) {
  if (!imports.has(from)) {
    imports.set(from, [])
  }
  imports.get(from)!.push(name)
}
