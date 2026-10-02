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
          // ── KUNCI FIX 1: Ubah include ke file hasil bundler (.js/.ts), karena JSX mentah tidak memiliki className terkompilasi ──
          include: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'], 
          // ── KUNCI FIX 2: Wajib memisahkan node_modules agar kode pustaka eksternal tidak ikut rusak saat enkripsi objek ──
          exclude: ['node_modules/**'], 
          options: {
            compact: true,
            // ── Mengacak Seluruh String & Teks Komponen Secara Agresif ──
            stringArray: true,
            stringArrayThreshold: 1, // 100% teks wajib diacak
            stringArrayEncoding: ['base64', 'rc4'], // Mengunci teks dengan enkripsi ganda
            rotateStringArray: true,
            
            // ── KUNCI FIX 3: Memaksa Obfuscator mengacak string properti objek (termasuk isi literal di className) ──
            transformObjectKeys: true, 
            
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
        }),
        enforce: 'post', // Memaksa    berjalan paling akhir setelah React selesai diproses
        apply: 'build',   // Memastikan taktik obfuscate hanya berjalan saat npm run build
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
        // ── KUNCI FIX UTAMA: Menghancurkan kata "classname" menjadi huruf acak tunggal (seperti a, b, c) ──
        mangle: {
          properties: {
            regex: /^(classname)$/, // Menargetkan tepat kata kunci 'classname' seperti yang tertulis di DevTools Anda
          },
        },
      },
    },
  })
