# webpack-plugin-vuetify

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
`webpack-plugin-vuetify` will automatically import all Vuetify components as you use them

```js
// webpack.config.js
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
  plugins: [
    new VuetifyPlugin({ autoImport: true }), // Enabled by default
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
### Customising variables
```js
// webpack.config.js
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
  plugins: [
    new VuetifyPlugin({ styles: 'expose' }),
  ],
}
```
```js
// plugins/vuetify.js
import './main.scss'
import { createVuetify } from 'vuetify'

export default createVuetify()
```
```scss
// main.scss
@use 'vuetify/styles' with (
  $color-pack: false,
  $utilities: false,
);
```

### Remove all style imports
```js
// webpack.config.js
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
  plugins: [
    new VuetifyPlugin({ styles: 'none' }),
  ],
}
```
```js
// plugins/vuetify.js
import { createVuetify } from 'vuetify'

export default createVuetify()
```

### Import sass from source
Vuetify 3 uses precompiled css by default, these imports can optionally be modified to point to sass files instead:

```js
// webpack.config.js
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
  plugins: [
    new VuetifyPlugin({ styles: 'sass' }),
  ],
}
```

## Progressive images
Coming soon...
