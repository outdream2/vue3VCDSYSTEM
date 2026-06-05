<template>
  <button
    type="button"
    :class="[
      'flex h-full min-h-[clamp(48px,2.7vw,104px)] w-full items-center justify-center gap-[clamp(8px,0.5vw,18px)] rounded-lg border font-bold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]',
      variantClasses[variant],
    ]"
    :style="{ ...variantStyles[variant], fontSize: '36px' }"
    @click="emit('click')"
  >
    <component :is="icon" class="h-[clamp(40px,2.4vw,88px)] w-[clamp(40px,2.4vw,88px)]" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component | string
  label: string
  variant: 'dark' | 'green' | 'orange' | 'blue'
}

defineProps<Props>()

const variantClasses: Record<Props['variant'], string> = {
  blue: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
  dark: 'border-slate-950 bg-slate-950 text-white hover:bg-slate-900',
  green: 'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700',
  orange: 'border-amber-600 bg-amber-500 text-white hover:bg-amber-600',
}

const variantStyles: Record<Props['variant'], Record<string, string>> = {
  blue: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: '#ffffff',
  },
  dark: {
    backgroundColor: '#020617',
    borderColor: '#020617',
    color: '#ffffff',
  },
  green: {
    backgroundColor: '#059669',
    borderColor: '#047857',
    color: '#ffffff',
  },
  orange: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    color: '#ffffff',
  },
}

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
