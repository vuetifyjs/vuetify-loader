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
        return code + generateImports(code, '_sfc_main')
      }

      return null
    }
  }
}
