import { getImports } from './getImports'

export function generateImports (source: string, id: string, defaultExport: string) {
  const { imports, hasNewImports, components, directives } = getImports(source, id)

  let content = ''

  if (components.length || directives.length) {
    content += '\n\n/* Vuetify */\n'

    Array.from(imports).sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
      .forEach(([from, names]) => {
        content += `import { ${names.join(', ')} } from "${from}"\n`
      })
    content += '\n'

    if (components.length) {
      content += `installAssets(${defaultExport}, 'components', { ${components.join(', ')} })\n`
    }
    if (directives.length) {
      content += `installAssets(${defaultExport}, 'directives', { ${directives.join(', ')} })\n`
    }
  }

  return { code: content, hasNewImports }
}
