# vite-plugin-vuetify

<div align="center">
  <a href="https://www.patreon.com/kaelwd">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" />
  </a>
  <br>
  <a href="https://opencollective.com/vuetify">
    <img src="https://opencollective.com/static/images/become_sponsor.svg" alt="Donate to OpenCollective">
  </a>
</div>

## Automatic imports
```js
// vite.config.js
plugins: [
  vue(),
  vuetify({ autoImport: true }), // Enabled by default
]
```
```js
// plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify()
```

## Style loading
### Customising variables
```js
// vite.config.js
plugins: [
  vue(),
  vuetify({ styles: 'expose' }),
]
```
```js
// plugins/vuetify.js
import './main.scss'
import { createVuetify } from 'vuetify'

export default createVuetify()
```
```scss
// main.scss
@use 'vuetify' with (
  $color-pack: false,
  $utilities: false,
);
```

### Remove all style imports
```js
// vite.config.js
plugins: [
  vue(),
  vuetify({ styles: 'none' }),
]
```
```js
// plugins/vuetify.js
import { createVuetify } from 'vuetify'

export default createVuetify()
```

### Import sass from source
Vuetify 3 uses precompiled css by default, these imports can optionally be modified to point to sass files instead:

```js
// vite.config.js
plugins: [
  vue(),
  vuetify({ styles: 'sass' }),
]
```
