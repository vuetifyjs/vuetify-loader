# @vuetify/vite-plugin

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
import 'vuetify/lib/styles/main.css'
import { createVuetify } from 'vuetify/lib/framework'

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
import { createVuetify } from 'vuetify/lib/framework'

export default createVuetify()
```
```scss
// main.scss
@use 'vuetify/lib/styles' with (
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
import { createVuetify } from 'vuetify/lib/framework'

export default createVuetify()
```
