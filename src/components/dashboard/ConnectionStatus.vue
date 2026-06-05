<template>
  <section class="shrink-0 overflow-hidden rounded-xl border-2 border-sky-200 bg-white shadow-sm">
    <div class="px-3 py-2">
      <span class="mb-2 block text-[15px] font-black tracking-widest text-slate-400 uppercase">통신상태</span>
      <div class="flex flex-col gap-1.5">
        <div class="flex gap-1.5">
          <div
            v-for="item in connectionIndicators.slice(0, 3)"
            :key="item.key"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-slate-50 px-2 text-[15px] font-black uppercase text-slate-700 ring-1 ring-slate-200 h-7"
            :title="item.message"
          >
            <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', item.ok ? 'bg-emerald-500' : 'bg-red-500']"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
        <div class="flex gap-1.5">
          <div
            v-for="item in connectionIndicators.slice(3)"
            :key="item.key"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-slate-50 px-2 text-[15px] font-black uppercase text-slate-700 ring-1 ring-slate-200 h-7"
            :title="item.message"
          >
            <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', item.ok ? 'bg-emerald-500' : 'bg-red-500']"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

type ConnectionStatusKey = 'geni' | 'server' | 'keyCabinet' | 'signBoard' | 'led'
type ConnectionStatus = Record<ConnectionStatusKey, { ok: boolean; message: string }>

const connectionStatus = ref<ConnectionStatus>({
  geni: { ok: true, message: 'GENi connected' },
  server: { ok: true, message: 'Local DB connected' },
  keyCabinet: { ok: true, message: 'Key cabinet connected' },
  signBoard: { ok: true, message: 'Sign board connected' },
  led: { ok: true, message: 'LED connected' },
})

const connectionIndicators = computed(() => [
  { key: 'geni', label: 'GENi', ...connectionStatus.value.geni },
  { key: 'server', label: 'SERVER', ...connectionStatus.value.server },
  { key: 'keyCabinet', label: 'KEY CABINET', ...connectionStatus.value.keyCabinet },
  { key: 'signBoard', label: 'SIGN BOARD', ...connectionStatus.value.signBoard },
  { key: 'led', label: 'LED', ...connectionStatus.value.led },
])

const fetchConnectionStatus = async () => {
  try {
    const response = await fetch('/api/connection-status')
    if (!response.ok) throw new Error()
    const data = await response.json()
    connectionStatus.value = { ...connectionStatus.value, ...data.status }
  } catch {
    connectionStatus.value = {
      geni: { ok: false, message: 'GENi status unavailable' },
      server: { ok: false, message: 'Local DB status unavailable' },
      keyCabinet: { ok: false, message: 'Key cabinet status unavailable' },
      signBoard: { ok: false, message: 'Sign board status unavailable' },
      led: { ok: false, message: 'LED status unavailable' },
    }
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { void fetchConnectionStatus(); timer = setInterval(fetchConnectionStatus, 5000) })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>
