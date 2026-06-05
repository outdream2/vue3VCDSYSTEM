<template>
  <div class="min-h-screen bg-slate-50">
    <main class="min-h-screen p-4">
      <RouterView v-slot="{ Component }">
        <KeepAlive include="Dashboard">
          <component :is="Component" v-if="Component" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { KeepAlive } from 'vue'
</script>
