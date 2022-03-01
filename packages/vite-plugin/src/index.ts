import { PluginOption } from 'vite'
import { Options } from '@vuetify/loader-shared'

import { importPlugin } from './importPlugin'
import { stylesPlugin } from './stylesPlugin'

export = function vuetify (_options: Options = {}) {
  const options: Options = {
    autoImport: true,
    styles: true,
    stylesTimeout: 10000,
    ..._options,
  }

  const plugins: PluginOption[] = []
  if (options.autoImport) {
    plugins.push(importPlugin())
  }
  if (options.styles === 'none' || options.styles === 'expose' || options.styles === 'sass') {
    plugins.push(stylesPlugin(options))
  }

  return plugins
}
