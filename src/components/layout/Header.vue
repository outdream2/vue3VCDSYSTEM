<template>
  <header :class="[flush ? 'h-full' : 'mb-3', 'flex items-stretch rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden']">
    <!-- 타이틀 + 로고 -->
    <div class="flex min-w-0 flex-1 items-center gap-6 px-8 py-2">
      <img src="/koen_logo.png" alt="KOEN" class="h-[38%] w-auto object-contain shrink-0 mt-6" />
      <div class="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
        <h1 class="text-[88px] font-black text-slate-950 mt-8" style="font-weight:900;">영동 1호기 <span class="text-red-600" style="font-weight:900;">고압차단기반</span> 위치안내 시스템</h1>
      </div>
    </div>

    <!-- 시간/날짜 -->
    <div class="flex shrink-0 flex-col justify-center border-l border-slate-200 px-6">
      <div class="flex items-center gap-2 text-[40px] font-bold text-slate-800">
        <Clock class="h-10 w-10 text-blue-600" />
        {{ time }}
      </div>
      <div class="mt-1 flex items-center gap-2 text-[32px] font-semibold text-slate-500">
        <Calendar class="h-9 w-9 text-blue-600" />
        {{ dateStr }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, Clock } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    title?: string
    flush?: boolean
  }>(),
  {
    title: '영동 1호기 고압차단기반 위치안내 시스템',
    flush: false,
  }
)

const time = ref('13:30:59')
const dateStr = ref('2026.05.28')
let timer: ReturnType<typeof setInterval> | undefined

const updateDateTime = () => {
  const now = new Date()
  time.value = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  dateStr.value = `${year}.${month}.${day}`
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
