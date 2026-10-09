import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'javascript-obfuscator'

function customObfuscatorPlugin() {
  return {
    name: 'vite-plugin-custom-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (fileName.endsWith('.js') && file.type === 'chunk') {
          const result = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            selfDefending: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 1, // 100% dari semua teks string diobfuscate (termasuk /api/..., TokoKu, dll)
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 1,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayIndexShift: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            splitStrings: true,
            splitStringsChunkLength: 4,
            transformObjectKeys: true,
            unicodeEscapeSequence: true,
            simplify: true,
          })
          file.code = result.getObfuscatedCode()
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    customObfuscatorPlugin(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/st': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
})
