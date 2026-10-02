  import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js' // 👈 Tetap melebur file .css agar hilang dari folder assets

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: true,
      minify: true // Memaksa string gaya CSS dikompresi serapat mungkin
    }), 
    {
      ...javaScriptObfuscator({
        // ── TARGET SUNTIKAN: Mengunci file hasil bundler (.js/.jsx) ──
        include: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'], 
        exclude: ['node_modules/**'], 
        options: {
          compact: true,
          // ── Teks & String Komponen Tetap Diacak Aman ──
          stringArray: true,
          stringArrayThreshold: 1, // 100% teks wajib diacak
          stringArrayEncoding: ['base64', 'rc4'], // Mengunci teks dengan enkripsi ganda
          rotateStringArray: true,
          
          // ── Logika Alur Komponen Tetap Terlindungi ──
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          
          // ── Mengubah Nama Variabel Menjadi Kode Heksadesimal _0x... ──
          identifierNamesGenerator: 'hexadecimal', 
          
          // ── ❌ FITUR ANTI INSPECT ELEMENT (DEBUG PROTECTION) SUDAH DIHAPUS TOTAL DI SINI ──
          debugProtection: false, // Browser TIDAK AKAN freeze / hang lagi saat F12 dibuka
          debugProtectionInterval: 0,
          
          deadCodeInjection: false,
          disableConsoleOutput: false, // Konsol browser kembali normal
        },
        apply: 'build',
      }),
      enforce: 'post', // Memaksa obfuscator berjalan paling akhir setelah React selesai diproses
    },
  ],
  base: '/',
  // ── KUNCI FIX: Menghapus Data Log Metadata Vercel Yang Bocor di Browser ──
  define: {
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_MESSAGE': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_REPO_OWNER': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_REPO_SLUG': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': JSON.stringify(''),
    'import.meta.env.VITE_VERCEL_GIT_PROVIDER': JSON.stringify(''),
  },
  build: {
    sourcemap: false, // Mematikan source map agar kode asli tidak bisa diintip
    minify: 'terser', // Menggunakan Terser untuk kompresi struktur tingkat tinggi
    terserOptions: {
      compress: {
        drop_console: false, // Menyalakan console kembali agar abang bisa leluasa cek log error
        passes: 3, 
      },
      mangle: true, // Mengacak nama fungsi internal secara aman
    },
  },
})
