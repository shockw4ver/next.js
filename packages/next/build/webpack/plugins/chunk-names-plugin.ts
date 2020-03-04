import { Compiler } from 'webpack'
const webpack5Experiential = parseInt(require('webpack').version) === 5

// This plugin mirrors webpack 3 `filename` and `chunkfilename` behavior
// This fixes https://github.com/webpack/webpack/issues/6598
// This plugin is based on https://github.com/researchgate/webpack/commit/2f28947fa0c63ccbb18f39c0098bd791a2c37090
export default class ChunkNamesPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'NextJsChunkNamesPlugin',
      (compilation: any) => {
        // use right hook for webpack 4 or webpack 5
        const renderManifest = webpack5Experiential
          ? compilation.hooks.renderManifest
          : compilation.chunkTemplate.hooks.renderManifest

        renderManifest.intercept({
          register(tapInfo: any) {
            if (tapInfo.name === 'JavascriptModulesPlugin') {
              const originalMethod = tapInfo.fn
              tapInfo.fn = (result: any, options: any) => {
                let filenameTemplate
                const chunk = options.chunk
                const outputOptions = options.outputOptions
                if (chunk.filenameTemplate) {
                  filenameTemplate = chunk.filenameTemplate
                } else if (chunk.hasEntryModule()) {
                  filenameTemplate = outputOptions.filename
                } else {
                  filenameTemplate = outputOptions.chunkFilename
                }

                options.chunk.filenameTemplate = filenameTemplate
                return originalMethod(result, options)
              }
            }
            return tapInfo
          },
        })
      }
    )
  }
}
