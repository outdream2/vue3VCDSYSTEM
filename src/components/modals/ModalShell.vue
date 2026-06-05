<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-8 backdrop-blur-md">
    <div :class="[
      'relative flex max-h-[2100px] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_32px_100px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.06)]',
      className
    ]">
      <button
        v-if="showClose"
        type="button"
        @click="onClose"
        class="absolute right-8 top-8 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        aria-label="Close"
      >
        <XIcon class="h-10 w-10" />
      </button>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { X as XIcon } from 'lucide-vue-next'

// ===== PROPS DEFINITION =====
interface Props {
  onClose: () => void
  className?: string
  showClose?: boolean
}

// Applying identical default parameters as the original structural layout
withDefaults(defineProps<Props>(), {
  className: 'max-w-[900px]',
  showClose: true
})
</script>
