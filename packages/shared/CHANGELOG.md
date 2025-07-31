# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.1.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@2.1.0...@vuetify/loader-shared@2.1.1) (2025-07-31)


### Bug Fixes

* account for spaces when extracting components and directives ([#348](https://github.com/vuetifyjs/vuetify-loader/issues/348)) ([b7b547b](https://github.com/vuetifyjs/vuetify-loader/commit/b7b547b5c7fa1e7abf922782598fe7d4bf324c90))



## [2.1.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@2.0.3...@vuetify/loader-shared@2.1.0) (2025-02-04)


### Features

* resolve subpath exports in import map ([5f70b57](https://github.com/vuetifyjs/vuetify-loader/commit/5f70b57147dde1b957b6f01be51644aded045636))



### [2.0.3](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@2.0.2...@vuetify/loader-shared@2.0.3) (2024-03-10)


### Bug Fixes

* remove resolveComponent import if unused ([7c38995](https://github.com/vuetifyjs/vuetify-loader/commit/7c389951c26d62dc02ff9c9b3737d1585e0284a0))



### [2.0.2](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@2.0.1...@vuetify/loader-shared@2.0.2) (2024-02-28)


### Bug Fixes

* replace json import with require ([e391b18](https://github.com/vuetifyjs/vuetify-loader/commit/e391b185fea33719f0dcbc36f8ae285515b61aae)), closes [#326](https://github.com/vuetifyjs/vuetify-loader/issues/326)



### [2.0.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@2.0.0...@vuetify/loader-shared@2.0.1) (2023-12-12)


### Bug Fixes

* support node 18 ([9683bf5](https://github.com/vuetifyjs/vuetify-loader/commit/9683bf54ad3b26a6553574a1be6a6c3c95fc3afd)), closes [#325](https://github.com/vuetifyjs/vuetify-loader/issues/325)



## [2.0.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.7.1...@vuetify/loader-shared@2.0.0) (2023-12-12)


### ⚠ BREAKING CHANGES

* Requires node >18
* Removed `styles: 'expose'` option

### Features

* add autoImport ignore option ([#323](https://github.com/vuetifyjs/vuetify-loader/issues/323)) ([1328d49](https://github.com/vuetifyjs/vuetify-loader/commit/1328d492abcf4612f336b6ad1d014f1ed250793c))
* add esm build ([34a03c1](https://github.com/vuetifyjs/vuetify-loader/commit/34a03c152e04e16694ca43c255a08edf3a2bd382)), closes [#319](https://github.com/vuetifyjs/vuetify-loader/issues/319)
* allow labs auto-import ([55ead16](https://github.com/vuetifyjs/vuetify-loader/commit/55ead1692cd857a15e7595d14e97766c57651f0b)), closes [#315](https://github.com/vuetifyjs/vuetify-loader/issues/315)
* remove `styles: 'expose'` ([c43dc80](https://github.com/vuetifyjs/vuetify-loader/commit/c43dc804811bf22be920ac72a38e7b4c193bca3b))


### Bug Fixes

* update transformAssetUrls ([8cc31a8](https://github.com/vuetifyjs/vuetify-loader/commit/8cc31a8db7e325aa779c0bfb0e55186afe6db736)), closes [#317](https://github.com/vuetifyjs/vuetify-loader/issues/317)



### [1.7.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.7.0...@vuetify/loader-shared@1.7.1) (2023-01-28)


### Bug Fixes

* add leading slash to absolute paths on windows ([3ecd8e2](https://github.com/vuetifyjs/vuetify-loader/commit/3ecd8e2d8034137ca47ad8325df960dfb0efc08e)), closes [#274](https://github.com/vuetifyjs/vuetify-loader/issues/274)



## [1.7.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.6.0...@vuetify/loader-shared@1.7.0) (2022-10-13)


### Features

* add transformAssetUrls ([c2e525b](https://github.com/vuetifyjs/vuetify-loader/commit/c2e525b3a3ad5582ffc50216a94c47b94f1c8fc9)), closes [#237](https://github.com/vuetifyjs/vuetify-loader/issues/237)



## [1.6.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.5.1...@vuetify/loader-shared@1.6.0) (2022-08-31)


### Features

* add styles.configFile option ([9142e9d](https://github.com/vuetifyjs/vuetify-loader/commit/9142e9d644ba1e4f86486440c29a318704090636)), closes [#263](https://github.com/vuetifyjs/vuetify-loader/issues/263) [#245](https://github.com/vuetifyjs/vuetify-loader/issues/245) [#221](https://github.com/vuetifyjs/vuetify-loader/issues/221)



### [1.5.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.5.0...@vuetify/loader-shared@1.5.1) (2022-07-23)


### Bug Fixes

* add vue and upath to dependencies ([ac5af82](https://github.com/vuetifyjs/vuetify-loader/commit/ac5af823f1bfd8bc79dc3eb353eed64adef34421)), closes [#242](https://github.com/vuetifyjs/vuetify-loader/issues/242)
* resolve vuetify relative to cwd ([9bf71d4](https://github.com/vuetifyjs/vuetify-loader/commit/9bf71d4fd8596cf8333e3041f4307a851c7aba6a)), closes [#248](https://github.com/vuetifyjs/vuetify-loader/issues/248)



## [1.5.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.4.0...@vuetify/loader-shared@1.5.0) (2022-06-16)


### Features

* support vuetify beta.4 ([f1a0976](https://github.com/vuetifyjs/vuetify-loader/commit/f1a09765e568c7ee5481dd576765939ffc1fe534))


### Bug Fixes

* sort generated imports ([e14c456](https://github.com/vuetifyjs/vuetify-loader/commit/e14c45630442cc235cc670578a56457880e734f1))



## [1.4.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.3.0...@vuetify/loader-shared@1.4.0) (2022-05-21)


### Features

* **styles:** add sass option ([ddd68d9](https://github.com/vuetifyjs/vuetify-loader/commit/ddd68d99aedaa0088c5d89740d1a9b9c1bb74808))



## [1.3.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.2.2...@vuetify/loader-shared@1.3.0) (2021-12-10)


### Features

* add stylesTimeout option ([93e830d](https://github.com/vuetifyjs/vuetify-loader/commit/93e830dd728610bfa83c5a93f85fcca6acb4f59d))


### Bug Fixes

* disable esModuleInterop ([b3ae4d1](https://github.com/vuetifyjs/vuetify-loader/commit/b3ae4d17e4319ab1b8c550d50b0cc2737a8d0719)), closes [#222](https://github.com/vuetifyjs/vuetify-loader/issues/222)



### [1.2.2](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.2.1...@vuetify/loader-shared@1.2.2) (2021-11-17)


### Bug Fixes

* match resolveComponent with var or const ([5f83f21](https://github.com/vuetifyjs/vuetify-loader/commit/5f83f215e82b6637230ac3808d09c1e106d892ec))



### [1.2.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.2.0...@vuetify/loader-shared@1.2.1) (2021-11-15)


### Bug Fixes

* add leading slash to absolute paths on windows ([1128c72](https://github.com/vuetifyjs/vuetify-loader/commit/1128c721d87ba64a4143c6a7f6fbeb86ac3aa25a)), closes [#204](https://github.com/vuetifyjs/vuetify-loader/issues/204)



## [1.2.0](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.1.3...@vuetify/loader-shared@1.2.0) (2021-11-11)


### Features

* support external templates ([8b7fc70](https://github.com/vuetifyjs/vuetify-loader/commit/8b7fc7082cf177e122d83b97ec0521092c044a77)), closes [#215](https://github.com/vuetifyjs/vuetify-loader/issues/215)


### Bug Fixes

* add leading slash to absolute paths on windows ([33d0757](https://github.com/vuetifyjs/vuetify-loader/commit/33d0757e5de3278fb17a299141f87024bdd936d3)), closes [#204](https://github.com/vuetifyjs/vuetify-loader/issues/204)
* export runtime as mjs ([8767fb1](https://github.com/vuetifyjs/vuetify-loader/commit/8767fb1c227320e63c0259b630cdf52756218e23)), closes [#210](https://github.com/vuetifyjs/vuetify-loader/issues/210)



### [1.1.3](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.1.2...@vuetify/loader-shared@1.1.3) (2021-10-03)

**Note:** Version bump only for package @vuetify/loader-shared





### [1.1.2](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.1.1...@vuetify/loader-shared@1.1.2) (2021-09-11)

**Note:** Version bump only for package @vuetify/loader-shared





### [1.1.1](https://github.com/vuetifyjs/vuetify-loader/compare/@vuetify/loader-shared@1.1.0...@vuetify/loader-shared@1.1.1) (2021-08-31)


### Bug Fixes

* publish runtime.js ([7528da3](https://github.com/vuetifyjs/vuetify-loader/commit/7528da3f4f225521bcfa8bea7583590be24a7e38))



## 1.1.0 (2021-08-30)


### Features

* add auto-loading to webpack plugin ([59f1b1f](https://github.com/vuetifyjs/vuetify-loader/commit/59f1b1f6f805cdab9cacd0372b394df3dafb4698))
* implement autoImport plugin ([163ff7f](https://github.com/vuetifyjs/vuetify-loader/commit/163ff7f25c2e8cb65bc6461f4399b52e53b77612))
* support HMR ([39baa9d](https://github.com/vuetifyjs/vuetify-loader/commit/39baa9dd70a52656af8f7508a1e095a468483d19))
