# Local font sources

These are the original, unmodified variable TrueType files from the official Google Fonts repository. The app uses `next/font/local`, so production builds do not fetch CSS or font files from Google. All source glyphs and axes remain intact; no subset, conversion or font substitution was applied.

Fraunces and Geist are preloaded for the library interface. JetBrains Mono uses `preload: false` because it is needed only for code and integration details, avoiding an extra 187,208-byte first-load preload. All three families retain the existing CSS variables, normal style, the 400–700 weight range and swap display.

## Assets

| Asset                    |   Bytes | Official source                                                                                                              | Git blob                                   | SHA-256                                                            |
| ------------------------ | ------: | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `fraunces.ttf`           | 360,440 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf) | `8210f9488d3c732359a9292dd09aca3f2bae830e` | `177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb` |
| `fraunces-OFL.txt`       |   4,391 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/OFL.txt)                                     | `22fa7ce5733434d0c634f6e55116f410858e938c` | `bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b` |
| `geist.ttf`              | 169,056 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/geist/Geist%5Bwght%5D.ttf)                            | `f63f0afc6390323715972b6645115485f37cc9f4` | `73894e0448cae90a92b6c2f8732b7bb9acb7b94c418bff559dad4a18e1de9659` |
| `geist-OFL.txt`          |   4,387 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/geist/OFL.txt)                                        | `61f6f4b7853081236aec6407f2dd3c7170997f84` | `1781d2806a07d91c4edf4740b88449fab7d0eadad53f7c351b94cd4d4eb8c00f` |
| `jetbrains-mono.ttf`     | 187,208 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf)            | `aa310be8b717fe3774f9444dd89d5f4101cc6d10` | `48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda` |
| `jetbrains-mono-OFL.txt` |   4,399 | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt)                                | `821a3dac22aff15a1f1c9689a1d79c45bb58ca39` | `b2fe5e8987594e9ffd1d2ca52a2f5d73eb8335243893c5d6254b5ad69269591d` |

## Verification and refresh

The three font files total 716,704 bytes before HTTP transport compression. Each family has its original SIL Open Font License beside the binary. `tests/unit/local-fonts.test.ts` checks valid variable-font tables, the UI weight range, Fraunces optical/softness/wonk axes and the adjacent licenses.

To refresh an asset, download its official source URL with the existing system `curl`, save to the matching filename, compare its SHA-256 with `shasum -a 256`, and update the source record when the upstream version intentionally changes. Fetch the corresponding OFL file at the same time. No font-tool installation or runtime font-processing dependency is required. WOFF2 conversion was not used because no existing converter was available in the task environment.

The local route avoids the extensionless Google Fonts URL parsing failure documented in [Next issue 99114](https://github.com/vercel/next.js/issues/99114). Loader usage follows [Next local font documentation](https://nextjs.org/docs/app/getting-started/fonts#local-fonts).
