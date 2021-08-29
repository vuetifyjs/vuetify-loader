function requirePeer (name) {
  try {
    return require(name)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e
    throw new Error(`Module "${name}" required by "vuetify-loader" not found.`)
  }
}

module.exports = {
  requirePeer
}
