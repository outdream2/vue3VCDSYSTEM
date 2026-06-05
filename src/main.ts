import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import { router } from './router'

const APP_W = 3840
const APP_H = 2160

function applyScale() {
  const root = document.getElementById('root')
  if (!root) return
  const scale = window.innerWidth / APP_W
  const offsetY = (window.innerHeight - APP_H * scale) / 2
  root.style.transform = `translate(0, ${offsetY}px) scale(${scale})`
}

applyScale()
window.addEventListener('resize', applyScale)

createApp(App).use(router).mount('#root')
