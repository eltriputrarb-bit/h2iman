import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js' // 👈 Melebur file .css agar hilang dari folder assets

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(), // 👈 Menyatukan CSS langsung ke dalam file JS teracak
    {
      ...javaScriptObfuscator({
        // ── KUNCI HIDE FIX: Mengunci target folder src secara total berdasarkan ekstensi file ──
        include: ['src/**/*.jsx', 'src/**/*.js'], 
        options: {
          compact: true,
          // ── Mengacak Seluruh String & Teks Komponen Secara Agresif ──
          stringArray: true,
          stringArrayThreshold: 1, // 100% teks wajib diacak
          stringArrayEncoding: ['base64', 'rc4'], // Mengunci teks dengan enkripsi ganda
          rotateStringArray: true,
          
          // ── Mengacak Logika Alur Komponen Film ──
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          
          // ── Mengubah Nama Variabel Menjadi Kode Heksadesimal _0x... ──
          identifierNamesGenerator: 'hexadecimal', 
          
          // ── Perlindungan Mutlak (Anti Inspect Element) ──
          debugProtection: true, // Memaksa browser masuk ke mode 'debugger' tanpa henti saat F12 ditekan
          debugProtectionInterval: 2000, // Mengulang pembekuan devtools setiap 2 detik
          
          deadCodeInjection: false,
          disableConsoleOutput: true,
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
        drop_console: true,
        passes: 3, // Memproses kode 3 kali agar fungsi hancur berantakan menjadi baris acak
      },
    },
  },
})
