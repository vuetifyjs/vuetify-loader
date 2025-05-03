import { camelize, capitalize } from 'vue'

export function parseTemplate (source: string) {
  const components = createSet(source.matchAll(/(?:var|const) (\w+) *?= *?_resolveComponent\("([\w-.]+)"\);?/gm))
  const directives = createSet(source.matchAll(/(?:var|const) (\w+) *?= *?_resolveDirective\("([\w-.]+)"\);?/gm))

  return { components, directives }
}

export interface TemplateMatch {
  symbol: string,
  name: string,
  index: number,
  length: number,
}

function createSet (matches: IterableIterator<RegExpMatchArray>): Set<TemplateMatch> {
  return new Set(Array.from(matches, i => ({
    symbol: i[1],
    name: capitalize(camelize(i[2])),
    index: i.index!,
    length: i[0].length,
  })))
}
