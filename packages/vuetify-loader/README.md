# vuetify-loader

<div align="center">
  <a href="https://www.patreon.com/kaelwd">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" />
  </a>
  <br>
  <a href="https://opencollective.com/vuetify">
    <img src="https://opencollective.com/static/images/become_sponsor.svg" alt="Donate to OpenCollective">
  </a>
</div>

## Automatic Imports
`vuetify-loader` will automatically import all Vuetify components as you use them

```js
// webpack.config.js
const { VuetifyLoaderPlugin } = require('vuetify-loader')

module.exports = {
  plugins: [
    new VuetifyLoaderPlugin({ autoImport: true }), // Enabled by default
  ],
}
```
```js
// plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify()
```

```html
<template>
  <v-card>
    ...
  </v-card>
</template>

<script>
  export default {
    ...
  }
</script>
```

Will be compiled into:

```html
<template>
  <v-card>
    ...
  </v-card>
</template>

<script>
  import { VCard } from 'vuetify/components'

  export default {
    components: {
      VCard,
    },
    ...
  }
</script>
```

## Style loading
Coming soon...

## Progressive images
Coming soon...
