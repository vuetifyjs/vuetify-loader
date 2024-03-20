import type { Plugin } from 'vite'
import type { Options } from '@vuetify/loader-shared'
import { isObject, includes, transformAssetUrls } from '@vuetify/loader-shared'

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
    plugins.push(importPlugin(options))
  }
  if (includes(['none', 'sass'], options.styles) || isObject(options.styles)) {
    plugins.push(stylesPlugin(options))
  }

  return plugins
}
vuetify.transformAssetUrls = transformAssetUrls

export { transformAssetUrls } from '@vuetify/loader-shared'
