import { camelize, capitalize } from 'vue'

export function parseTemplate (source: string) {
  const components = createSet(source.matchAll(/_resolveComponent\("([\w-.]+)"\)/gm))
  const directives = createSet(source.matchAll(/_resolveDirective\("([\w-.]+)"\)/gm))

  return { components, directives }
}

function createSet (matches: IterableIterator<RegExpMatchArray>): Set<string> {
  return new Set(Array.from(matches, i => capitalize(camelize(i[1]))))
}
