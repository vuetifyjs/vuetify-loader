import path from 'path'
import { PluginOption } from 'vite'
import { generateImports } from '@vuetify/loader-shared'

export type importPluginOptions =
  | boolean
  | ((source: string, importer: string, isVuetify: boolean) => boolean | null | replace)
type replace = { symbol: string, from: string, as?: string }

export function importPlugin (options: importPluginOptions): PluginOption {
  return {
    name: 'vuetify:import',
    transform (code, id) {
      if (path.extname(id) === '.vue') {
        const { code: imports, hasNewImports } = generateImports(code, id, '_sfc_main')

        const rerenderOnly = /^export const _rerender_only = true$/m.exec(code)
        if (hasNewImports && rerenderOnly) {
          code = code.substr(0, rerenderOnly.index) + code.substr(rerenderOnly.index + rerenderOnly[0].length)
        }

        return code + imports
      }

      return null
    }
  }
}
