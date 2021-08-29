import { parseTemplate } from './parseTemplate'
import importMap from 'vuetify/dist/json/importMap.json'

export function getImports (source: string) {
  const { components, directives } = parseTemplate(source)
  const resolvedComponents = [] as string[]
  const resolvedDirectives = [] as string[]
  const imports = new Map<string, string[]>()

  if (components.size || directives.size) {
    addImport(imports, 'installAssets', '@vuetify/loader-shared/runtime')
    components.forEach(name => {
      if (name in importMap.components) {
        resolvedComponents.push(name)
        addImport(imports, name, 'vuetify/lib/' + (importMap.components as any)[name].from)
      }
    })
    directives.forEach(name => {
      if (importMap.directives.includes(name)) {
        resolvedDirectives.push(name)
        addImport(imports, name, 'vuetify/lib/directives/index.mjs')
      }
    })
  }

  return {
    imports,
    components: resolvedComponents,
    directives: resolvedDirectives,
  }
}

function addImport (imports: Map<string, string[]>, name: string, from: string) {
  if (!imports.has(from)) {
    imports.set(from, [])
  }
  imports.get(from)!.push(name)
}
