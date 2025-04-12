import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    entries: [
        'src/index',
        'src/types',
        'src/unimport-presets',
        'src/unplugin-vue-components-resolvers',
        'src/utils',
    ],
    externals: [
        'pathe',
        'upath',
        'vite',
        'vuetify',
        'vuetify/directives',
        'vuetify/components',
        'vuetify/labs/components',
        'unplugin-vue-components/types',
    ],
    declaration: 'node16',
    clean: true,
})