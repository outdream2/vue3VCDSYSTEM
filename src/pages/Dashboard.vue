<template>
  <div class="grid h-[2096px] min-h-0 grid-cols-[minmax(640px,720px)_minmax(0,1fr)_clamp(400px,10.5vw,800px)] grid-rows-[clamp(164px,4.3vw,328px)_minmax(0,1fr)] gap-6 overflow-hidden">
    <div class="col-span-3 min-w-0">
      <Header flush />
    </div>

    <div class="min-h-0 h-full self-start">
      <FloorPlan :target-panel-ids="viewerPanelIds" :camera-position="cameraPosition" />
    </div>
    
    <main class="h-full min-h-0 min-w-0 max-h-[1600px]">
      <ImageViewer
        :activePanelIds="viewerPanelIds"
        :alertPanels="activePanels"
        :sequenceId="sequenceId"
        :isOperationActive="isOperationActive"
        :resetTrigger="cameraResetTrigger"
        @camera-update="handleCameraUpdate"
        @sequence-done="handleSequenceDone"
      />
      
      <div class="hidden grid min-h-0 min-w-0 grid-cols-[clamp(360px,9.5vw,720px)_minmax(0,1fr)] gap-6">
        <section class="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <h2 class="text-[11px] font-black uppercase text-slate-600">통신정보</h2>
          </div>
          <div class="grid gap-1.5 p-2.5">
            <div 
              v-for="stat in communicationStats" 
              :key="stat.label" 
              class="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5"
            >
              <div :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', stat.bg, stat.color]">
                <component :is="stat.icon" class="h-3.5 w-3.5" />
              </div>
              <span class="min-w-0 truncate text-[11px] font-bold text-slate-600">{{ stat.label }}</span>
              <span :class="['ml-auto text-xs font-black', stat.color]">{{ stat.value }}</span>
            </div>
          </div>
        </section>

        <div class="grid min-h-0 min-w-0 grid-cols-[minmax(190px,0.85fr)_minmax(220px,1.15fr)] gap-3">
          <section class="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <h2 class="text-[11px] font-black uppercase tracking-widest text-slate-600">시스템 상태</h2>
              <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-600">정상가동</span>
            </div>
            <div class="grid h-[calc(100%-37px)] items-center gap-3 p-3">
              <div class="space-y-2 text-xs font-bold">
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">월간</span>
                  <span class="text-violet-600">{{ operations.length }}건</span>
                </div>
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">진행중</span>
                  <span class="text-blue-600">{{ activeOperations.length }}건</span>
                </div>
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">알람</span>
                  <span class="text-red-600">{{ alertCount }}건</span>
                </div>
              </div>
            </div>
          </section>

          <RecentActivity :operations="operations" @viewAll="modal = 'activity'" />
        </div>
      </div>
    </main>

    <aside class="grid min-h-0 min-w-0 grid-rows-[120px_minmax(240px,900px)_104px_104px_104px_104px] gap-4 overflow-hidden">
      <ConnectionStatus />
      <StatusPanel :operations="activeOperations" />
      <ActionButton :icon="actionIcons.start" label="조작시작" variant="dark" @click="modal = 'start'" />
      <ActionButton :icon="actionIcons.complete" label="조작완료" variant="green" @click="modal = 'complete'" />
      <ActionButton :icon="actionIcons.manual" label="수동조작" variant="blue" @click="modal = 'manual'" />
      <ActionButton :icon="actionIcons.history" label="이력조회" variant="orange" @click="modal = 'history'" />
    </aside>
  </div>

  <Teleport to="body">
    <OperationModal v-if="modal === 'start'" mode="start" :operations="operations" @close="modal = null" @confirm="startOperations" />
    <OperationModal v-if="modal === 'complete'" mode="complete" :operations="operations" @close="modal = null" @confirm="finishOperations" />
    <OperationModal v-if="modal === 'manual'" mode="manual" :operations="operations" @close="modal = null" @confirm="manualOperations" />
    <HistoryModal v-if="modal === 'history'" :operations="operations" @close="modal = null" />
    <HistoryModal v-if="modal === 'activity'" :operations="operations" @close="modal = null" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, defineOptions, watch, onMounted, onUnmounted } from 'vue'
import { Bell, CheckCircle, Hand as HandIcon, History as HistoryIcon, Play, Radio, Server, ShieldCheck } from 'lucide-vue-next'

// API Network Core Hooks and Endpoint Interfaces
import { clearActivePanels, completeOperations, fetchOperations, registerOperation, setActivePanels } from '../api/operations'
import type { ActivePanel } from '../api/operations'

// Structural Interface Components Mapping
import FloorPlan from '../components/dashboard/FloorPlan.vue'
import ImageViewer from '../components/dashboard/ImageViewer.vue'
import RecentActivity from '../components/dashboard/RecentActivity.vue'
import ConnectionStatus from '../components/dashboard/ConnectionStatus.vue'
import StatusPanel from '../components/dashboard/StatusPanel.vue'
import Header from '../components/layout/Header.vue'

// Custom UI Form Elements
import ActionButton from '../components/ui/ActionButton.vue'

// Modular Overlays Dialog Registries 
import HistoryModal from '../components/modals/HistoryModal.vue'
import OperationModal from '../components/modals/OperationModal.vue'

// Static Mock Telemetry Initialization Assets
import { INITIAL_OPERATIONS } from '../data/operations'
import type { Operation } from '../types'

defineOptions({ name: 'Dashboard' })

// Typing Constraints defining available layout dialog variants
type ModalType = 'start' | 'complete' | 'manual' | 'history' | 'activity' | null
type CameraPosition = { x: number; z: number; rotation: number }

// String match evaluator tracking Korean charset variance statuses from original React node
const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

// Local Reactive Functional Memory Allocations
const modal = ref<ModalType>(null)
const cameraResetTrigger = ref(0)
const operations = ref<Operation[]>(INITIAL_OPERATIONS)
const sequencePanelIds = ref<number[]>([])
const sequenceId = ref(0)
const activePanels = ref<ActivePanel[]>([])
const isOperationActive = ref(false)
const cameraPosition = ref<CameraPosition>({ x: -9, z: 0, rotation: 0 })
const actionIcons = {
  start: markRaw(Play),
  complete: markRaw(CheckCircle),
  manual: markRaw(HandIcon),
  history: markRaw(HistoryIcon),
}

// Tracking buffers preventing redundant view mutations on repetitive incoming network data frames
const lastActivePanelsSerialized = ref('[]')
let pollIntervalId: ReturnType<typeof setInterval> | null = null
let suppressPoll = false

// Re-computes and syncs centralized active process records with local memory state
const refreshOperations = async () => {
  try {
    const data = await fetchOperations()
    operations.value = data
  } catch (error) {
    console.error('Operation synchronization failed:', error)
  }
}

// Background Network Sync Daemon Cycle Poller matching original React implementation
const pollActivePanels = async () => {
  if (suppressPoll) return
  try {
    const response = await fetch('/api/active-panels')
    const data = await response.json()
    if (!Array.isArray(data.panels)) return

    const serialized = JSON.stringify(data.panels)
    if (serialized === lastActivePanelsSerialized.value) return
    lastActivePanelsSerialized.value = serialized

    activePanels.value = data.panels

    const newIds = data.panels.map((panel: ActivePanel) => panel.id).sort((a: number, b: number) => a - b)
    const prevIds = sequencePanelIds.value.slice().sort((a: number, b: number) => a - b)
    const idsChanged = JSON.stringify(newIds) !== JSON.stringify(prevIds)

    // Only assign a new array when the contents actually changed — keeps the reference
    // stable for poll cycles where serialization changed but IDs are the same order shift
    if (idsChanged) {
      sequencePanelIds.value = data.panels.map((panel: ActivePanel) => panel.id)
    }

    if (data.panels.length === 0) {
      // External DELETE or server-side clear: reset operation state so 3D overlay clears
      isOperationActive.value = false
    } else if (idsChanged) {
      sequenceId.value += 1
      isOperationActive.value = true
    }
  } catch {
    // API starting boundaries gracefully intercepted to bypass volatile UI updates
  }
}

// Core Component Lifecycle Hooks Handling Daemon Sequences
onMounted(async () => {
  await refreshOperations()
  void pollActivePanels()
  pollIntervalId = setInterval(pollActivePanels, 1000)
})

onUnmounted(() => {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId)
  }
})

// Dispatches panel configuration triggers payload matrix over interface endpoints
const startOperations = async (selectedOperations: Operation[], worker: string, team: string) => {
  await saveOperationRecords(selectedOperations, worker, team, 'GENi 연동 후 조작 시작')
  await triggerHardware(selectedOperations, 'ON')
  await refreshOperations()
}

const manualOperations = async (selectedOperations: Operation[], worker: string, team: string) => {
  await saveOperationRecords(selectedOperations, worker, team, 'GENi 연결 장애 수동 조작')
  await triggerHardware(selectedOperations, 'ON')
  await refreshOperations()
}

const triggerHardware = async (selectedOperations: Operation[], status: 'ON' | 'OFF') => {
  if (status === 'ON') {
    const panels = selectedOperations.map((op) => ({
      id: op.panelId,
      status,
      description: op.unitId,
      equipName: op.equipName,
    }))
    await setActivePanels(panels)
    const panelIds = selectedOperations.map((op) => op.panelId)
    lastActivePanelsSerialized.value = JSON.stringify(panels)
    sequencePanelIds.value = panelIds
    activePanels.value = panels
    sequenceId.value += 1
    isOperationActive.value = true
  } else {
    await clearActivePanels()
    lastActivePanelsSerialized.value = '[]'
    sequencePanelIds.value = []
    activePanels.value = []
    isOperationActive.value = false
    cameraResetTrigger.value += 1
  }
}

const saveOperationRecords = async (selectedOperations: Operation[], worker: string, team: string, notes: string) => {
  await Promise.all(selectedOperations.map((op) => registerOperation({
    panelId: op.panelId,
    unitId: op.unitId,
    equipName: op.equipName,
    panelName: op.panelName ?? op.equipName,
    opType: op.opType,
    operator: worker,
    department: team,
    purpose: op.purpose || 'Red Tag operation',
    notes,
  })))
}

// Terminates active hardware signaling sequences clearing global processes
const finishOperations = async (selectedOperations: Operation[]) => {
  await triggerHardware(selectedOperations, 'OFF')
  await completeOperations(selectedOperations.map((op) => op.id))
  await refreshOperations()
}

// Clears cached tracking segments cleanly upon visual loop sequence completion
const handleSequenceDone = async () => {
  suppressPoll = true
  sequencePanelIds.value = []
  activePanels.value = []
  isOperationActive.value = false
  try { await clearActivePanels() } catch { /* best effort */ }
  lastActivePanelsSerialized.value = '[]'
  suppressPoll = false
}

const handleCameraUpdate = (position: CameraPosition) => {
  cameraPosition.value = position
}

// Computed Reactive Projection Filters
const activeOperations = computed(() => {
  return operations.value.filter((op) => isProgress(op.status))
})

const alertCount = computed(() => {
  const alertOperationsCount = operations.value.filter(
    (op) => op.opType === 'KEY ALERT' && isProgress(op.status)
  ).length
  return activePanels.value.length + alertOperationsCount
})

const viewerPanelIds = computed(() => sequencePanelIds.value)

watch(modal, (newVal) => {
  cameraResetTrigger.value += 1
  suppressPoll = true
  sequencePanelIds.value = []
  activePanels.value = []
  isOperationActive.value = false
  lastActivePanelsSerialized.value = '[]'
  suppressPoll = false
  if (newVal !== null) void refreshOperations()
})

// FIX: Ikonka obyektlari Vue Proxy kuzatuviga tushib resolveComponent xatosini bermasligi uchun ularga markRaw() to'liq va to'g'ri o'rnatildi
const communicationStats = computed(() => [
  { icon: markRaw(Radio), label: 'GENi 연동', value: 'ON', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: markRaw(ShieldCheck), label: '키보관함 연동', value: 'ON', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: markRaw(Bell), label: '알람', value: alertCount.value > 0 ? `${alertCount.value}건` : '없음', color: alertCount.value > 0 ? 'text-red-600' : 'text-emerald-600', bg: alertCount.value > 0 ? 'bg-red-50' : 'bg-emerald-50' },
  { icon: markRaw(Server), label: '패널', value: '47', color: 'text-blue-600', bg: 'bg-blue-50' },
])
</script>
