/**
 * @param options { true | (
 *   (source: string, importer: string, isVuetify: boolean) => boolean | null | { symbol: string, from: string, as?: string }
 * )}
 */
export function importPlugin (options) {
  return {
    name: 'vuetify:import',
    transform (code, id) {
      if (id.endsWith('.vue')) {
        //
      }
    }
  }
}
