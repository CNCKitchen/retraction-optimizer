import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true })
  const files = readdirSync(src)
  files.forEach(file => {
    const srcPath = join(src, file)
    const destPath = join(dest, file)
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  })
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  plugins: [
    {
      name: 'copy-presets',
      apply: 'build',
      enforce: 'post',
      closeBundle() {
        copyDirRecursive('src/presets', 'dist/presets')
      }
    }
  ],
  server: {
    port: 5173,
    open: true
  },
  base: '/retraction-optimizer/'
})
