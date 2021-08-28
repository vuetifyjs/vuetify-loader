import { PluginOption } from 'vite'

export type importPluginOptions =
  | boolean
  | ((source: string, importer: string, isVuetify: boolean) => boolean | null | replace)
type replace = { symbol: string, from: string, as?: string }

export function importPlugin (options: importPluginOptions): PluginOption {
  return {
    name: 'vuetify:import',
    transform (code, id) {
      if (id.endsWith('.vue')) {
        //
      }

      return null
    }
  }
}
