import fs from 'fs/promises'
import path from 'path'

import mkdirp from 'mkdirp'

function isSubdir (root, test) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/**
 * @param options { true | 'none' | 'expose' }
 */
export function stylesPlugin (options = true) {
  const vuetifyBase = path.dirname(require.resolve('vuetify/package.json'))
  const files = new Set()

  function addResolution (resolution) {
    files.add(resolution.id)
    mkdirp(path.resolve(__dirname, 'node_modules/.cache/vuetify')).then(() => {
      return fs.writeFile(
        path.resolve(__dirname, 'node_modules/.cache/vuetify/styles.scss'),
        ['vuetify/lib/styles/main.sass', ...files.values()].map(v => `@forward '${v}';`).join('\n'),
        'utf8'
      )
    })
  }

  return {
    name: 'vuetify:styles',
    enforce: 'pre',
    async resolveId (source, importer, custom) {
      if (
        ['.css', '.scss', '.sass'].some(v => source.endsWith(v)) &&
        isSubdir(vuetifyBase, importer)
      ) {
        if (options === 'none') {
          return '/dev/null'
        } else if (options === 'expose') {
          const resolution = await this.resolve(source.replace(/.css$/, '.sass'), importer, { skipSelf: true, custom })
          if (resolution) {
            addResolution(resolution)

            return '/dev/null'
          }
        }
      }

      return null
    },
    transform (code, id) {
      if (
        options === 'expose' &&
        id.endsWith('.scss') &&
        code.includes('~vuetify/lib/styles')
      ) {
        return code.replace('~vuetify/lib/styles', '.cache/vuetify/styles.scss')
      }
    }
  }
}
