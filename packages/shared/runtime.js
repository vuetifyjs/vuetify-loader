export function installAssets (component, type, assets) {
  component[type] = component[type] || {}

  for (const i in assets) {
    component[type][i] = component[type][i] || assets[i]
  }
}
