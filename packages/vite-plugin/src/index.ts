import { PluginOption } from 'vite'

import { importPlugin, importPluginOptions } from './importPlugin'
import { stylesPlugin, stylesPluginOptions } from './stylesPlugin'

interface Options {
  autoImport?: importPluginOptions,
  styles?: stylesPluginOptions
}

export default function vuetify (_options: Options = {}) {
  const options: Options = {
    autoImport: true,
    styles: true,
    ..._options,
  }

  const plugins: PluginOption[] = []
  if (options.autoImport) {
    plugins.push(importPlugin(options.autoImport))
  }
  if (options.styles === 'none' || options.styles === 'expose') {
    plugins.push(stylesPlugin(options.styles))
  }

  return plugins
}
