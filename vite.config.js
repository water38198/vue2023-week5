import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import UnocssIcons from '@unocss/preset-icons'
import { presetUno } from 'unocss'
/* global process */
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      presets: [
        UnocssIcons({
          prefix: 'i-',
          extraProperties: {
            display: 'inline-block',
            'vertical-align':'middle'
          }
        }),
        presetUno()
      ]
    }),
  ],
  base: process.env.NODE_ENV === "production" ? "/vue2023-week5/" : "/",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
