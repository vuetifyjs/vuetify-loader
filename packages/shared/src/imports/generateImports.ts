import { getImports } from './getImports'

export function generateImports (source: string, ignore: string[] = []) {
  const { imports, components, directives } = getImports(source, ignore)

  let code = ''

  if (components.length || directives.length) {
    code += '\n\n/* Vuetify */\n'

    Array.from(imports).sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
      .forEach(([from, names]) => {
        code += `import { ${names.join(', ')} } from "${from}"\n`
      })
    code += '\n'

    source = [...components, ...directives].reduce((acc, v) => {
      return acc.slice(0, v.index) + ' '.repeat(v.length) + acc.slice(v.index + v.length)
    }, source)
  }

  return { code, source }
}
