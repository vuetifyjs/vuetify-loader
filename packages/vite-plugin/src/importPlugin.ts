import path from 'path'
import { PluginOption } from 'vite'
import { camelize, capitalize } from 'vue'
import importMap from 'vuetify/dist/json/importMap.json'

export type importPluginOptions =
  | boolean
  | ((source: string, importer: string, isVuetify: boolean) => boolean | null | replace)
type replace = { symbol: string, from: string, as?: string }

function createSet (matches: IterableIterator<RegExpMatchArray>): Set<string> {
  return new Set(Array.from(matches, i => capitalize(camelize(i[1]))))
}

type ImportMap = Map<string, string[]>
function addImport (imports: ImportMap, name: string, from: string) {
  if (!imports.has(from)) {
    imports.set(from, [])
  }
  imports.get(from)!.push(name)
}

function generateImports (imports: ImportMap) {
  let code = ''
  Array.from(imports).sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
    .forEach(([from, names]) => {
      code += `import { ${names.join(', ')} } from "${from}"\n`
    })
  return code + '\n'
}

export function importPlugin (options: importPluginOptions): PluginOption {
  return {
    name: 'vuetify:import',
    transform (code, id) {
      if (path.extname(id) === '.vue') {
        const components = createSet(code.matchAll(/_resolveComponent\("([\w-.]+)"\)/gm))
        const directives = createSet(code.matchAll(/_resolveDirective\("([\w-.]+)"\)/gm))
        const resolvedComponents = [] as string[]
        const resolvedDirectives = [] as string[]
        const imports: ImportMap = new Map()

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

          code += '\n\n/* Vuetify */\n'
          code += generateImports(imports)
          if (resolvedComponents.length) {
            code += `installAssets(_sfc_main, 'components', { ${resolvedComponents.join(', ')} })\n`
          }
          if (resolvedDirectives.length) {
            code += `installAssets(_sfc_main, 'directives', { ${resolvedDirectives.join(', ')} })\n`
          }
        }

        return code
      }

      return null
    }
  }
}
