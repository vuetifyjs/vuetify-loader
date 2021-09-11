import { PluginOption } from 'vite'
import { Options } from '@vuetify/loader-shared'

import { importPlugin } from './importPlugin'
import { stylesPlugin } from './stylesPlugin'

export default function vuetify (_options: Options = {}) {
  const options: Options = {
    autoImport: true,
    styles: true,
    ..._options,
  }

  const plugins: PluginOption[] = []
  if (options.autoImport) {
    plugins.push(importPlugin())
  }
  if (options.styles === 'none' || options.styles === 'expose') {
    plugins.push(stylesPlugin(options))
  }

  return plugins
}
