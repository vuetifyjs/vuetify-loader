import { importPlugin } from './importPlugin'
import { stylesPlugin } from './stylesPlugin'

/**
 * @param _options {{
 *   autoImport?: boolean | (
 *     (source: string, importer: string, isVuetify: boolean) => boolean | null | { symbol: string, from: string, as?: string }
 *   ),
 *   styles: true | 'none' | 'expose'
 * }}
 */
export function vuetify (_options = {}) {
  const options = {
    autoImport: true,
    styles: true,
    ..._options,
  }

  const plugins = []
  if (options.autoImport) {
    plugins.push(importPlugin(options.autoImport))
  }
  if (options.styles === 'none' || options.styles === 'expose') {
    plugins.push(stylesPlugin(options.styles))
  }

  return plugins
}
