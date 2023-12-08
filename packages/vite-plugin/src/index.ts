import { Plugin } from 'vite'
import { Options, isObject, includes, transformAssetUrls } from '@vuetify/loader-shared'

import { importPlugin } from './importPlugin'
import { stylesPlugin } from './stylesPlugin'

export default function vuetify (_options: Options = {}): Plugin[] {
  const options: Options = {
    autoImport: true,
    styles: true,
    ..._options,
  }

  const plugins: Plugin[] = []
  if (options.autoImport) {
    plugins.push(importPlugin())
  }
  if (includes(['none', 'sass'], options.styles) || isObject(options.styles)) {
    plugins.push(stylesPlugin(options))
  }

  return plugins
}
vuetify.transformAssetUrls = transformAssetUrls

export { transformAssetUrls } from '@vuetify/loader-shared'
