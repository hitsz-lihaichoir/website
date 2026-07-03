<template>
  <div class="multi-track-player">
    <!-- Header -->
    <div class="player-header">
      <span class="player-title">🎧 多声部音频播放器</span>
      <span class="player-status" v-if="activeTracks > 0">
        {{ activeTracks }} / {{ tracks.length }} 声部激活
      </span>
    </div>

    <!-- No tracks fallback -->
    <div v-if="tracks.length === 0" class="player-empty">
      <div class="empty-icon">🎼</div>
      <p>尚未加载音频轨道</p>
      <p class="hint">请配置声部音轨路径以启用播放器</p>
    </div>

    <!-- Transport Controls -->
    <div v-if="tracks.length > 0" class="transport-bar">
      <button class="transport-btn play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button class="transport-btn" @click="stop" title="停止">⏹</button>

      <!-- Progress -->
      <div class="progress-container" ref="progressContainer" @click="seek">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

      <!-- Master Volume -->
      <div class="master-volume">
        <span class="volume-label">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          v-model.number="masterVolume"
          class="volume-slider master-slider"
          @input="updateMasterVolume"
        />
      </div>
    </div>

    <!-- Individual Track Controls -->
    <div v-if="tracks.length > 0" class="tracks-panel">
      <div
        v-for="(track, index) in tracks"
        :key="index"
        class="track-row"
        :class="{ 'track-muted': track.muted, 'track-solo': track.solo }"
      >
        <div class="track-info">
          <span class="track-icon">{{ track.icon }}</span>
          <span class="track-name">{{ track.name }}</span>
        </div>

        <div class="track-controls">
          <!-- Volume Slider -->
          <input
            type="range"
            min="0"
            max="100"
            v-model.number="track.volume"
            class="volume-slider track-slider"
            :disabled="track.muted"
            @input="updateTrackVolume(index)"
          />

          <!-- Mute Button -->
          <button
            class="track-btn mute-btn"
            :class="{ active: track.muted }"
            @click="toggleMute(index)"
            :title="track.muted ? '取消静音' : '静音'"
          >
            {{ track.muted ? '🔇' : '🔊' }}
          </button>

          <!-- Solo Button -->
          <button
            class="track-btn solo-btn"
            :class="{ active: track.solo }"
            @click="toggleSolo(index)"
            title="独奏"
          >
            S
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

interface Track {
  name: string
  icon: string
  src: string
  volume: number
  muted: boolean
  solo: boolean
  audioContext?: AudioContext
  audioBuffer?: AudioBuffer
  gainNode?: GainNode
  sourceNode?: AudioBufferSourceNode
}

// Default demo tracks — replace with actual rehearsal audio files
const tracks = reactive<Track[]>([
  {
    name: '女高 (Soprano)',
    icon: '🎤',
    src: '/audio/soprano.mp3',
    volume: 80,
    muted: false,
    solo: false
  },
  {
    name: '女低 (Alto)',
    icon: '🎵',
    src: '/audio/alto.mp3',
    volume: 80,
    muted: false,
    solo: false
  },
  {
    name: '男高 (Tenor)',
    icon: '🎶',
    src: '/audio/tenor.mp3',
    volume: 80,
    muted: false,
    solo: false
  },
  {
    name: '男低 (Bass)',
    icon: '🎼',
    src: '/audio/bass.mp3',
    volume: 80,
    muted: false,
    solo: false
  }
])

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const masterVolume = ref(80)

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let animationFrameId: number | null = null
let startTime = 0
let pausedAt = 0
const progressContainer = ref<HTMLElement>()

const activeTracks = computed(() => tracks.filter(t => !t.muted).length)
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function initAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
    masterGain = audioContext.createGain()
    masterGain.gain.value = masterVolume.value / 100
    masterGain.connect(audioContext.destination)
  }

  // Load audio buffers
  for (const track of tracks) {
    if (!track.audioBuffer) {
      try {
        const response = await fetch(track.src)
        if (!response.ok) {
          console.warn(`Failed to load audio: ${track.src}`)
          continue
        }
        const arrayBuffer = await response.arrayBuffer()
        track.audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        // 使用第一个成功加载的音轨时长作为总时长
        if (track.audioBuffer && duration.value === 0) {
          duration.value = track.audioBuffer.duration
        }
      } catch (e) {
        console.warn(`Audio load error for ${track.name}:`, e)
      }
    }
  }
}

function createSourceNode(track: Track, offset: number = 0) {
  if (!audioContext || !masterGain || !track.audioBuffer) return null

  const source = audioContext.createBufferSource()
  source.buffer = track.audioBuffer

  const gainNode = audioContext.createGain()
  gainNode.gain.value = track.muted ? 0 : track.volume / 100

  source.connect(gainNode)
  gainNode.connect(masterGain)

  source.start(0, offset)
  track.sourceNode = source
  track.gainNode = gainNode

  return source
}

function applySoloLogic() {
  const hasAnySolo = tracks.some(t => t.solo)
  tracks.forEach(track => {
    if (track.gainNode && audioContext) {
      const targetGain = hasAnySolo
        ? (track.solo ? track.volume / 100 : 0)
        : (track.muted ? 0 : track.volume / 100)
      track.gainNode.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + 0.05)
    }
  })
}

function startPlayback(offset: number = 0) {
  if (!audioContext || !masterGain) return

  // 恢复 context（解决浏览器自动播放策略）
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  stopAllSources()

  tracks.forEach(track => {
    if (track.audioBuffer) {
      createSourceNode(track, offset)
    }
  })

  applySoloLogic()

  startTime = audioContext.currentTime - offset
  pausedAt = 0
  isPlaying.value = true

  updateProgress()
}

function stopAllSources() {
  tracks.forEach(track => {
    if (track.sourceNode) {
      try { track.sourceNode.stop() } catch (_) { /* already stopped */ }
      track.sourceNode = undefined
    }
    track.gainNode = undefined
  })
}

function updateProgress() {
  if (!isPlaying.value || !audioContext) return

  currentTime.value = audioContext.currentTime - startTime

  if (currentTime.value >= duration.value) {
    stop()
    return
  }

  animationFrameId = requestAnimationFrame(updateProgress)
}

async function togglePlay() {
  await initAudioContext()

  if (isPlaying.value) {
    // Pause
    if (audioContext) {
      pausedAt = audioContext.currentTime - startTime
    }
    stopAllSources()
    isPlaying.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  } else {
    startPlayback(pausedAt)
  }
}

function stop() {
  stopAllSources()
  isPlaying.value = false
  currentTime.value = 0
  pausedAt = 0
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

function seek(event: MouseEvent) {
  if (!progressContainer.value || duration.value === 0) return
  const rect = progressContainer.value.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  const seekTime = Math.max(0, Math.min(duration.value, ratio * duration.value))

  pausedAt = seekTime
  currentTime.value = seekTime

  if (isPlaying.value) {
    stopAllSources()
    startPlayback(seekTime)
  }
}

function toggleMute(index: number) {
  tracks[index].muted = !tracks[index].muted
  // 如果取消静音，也取消 solo
  if (!tracks[index].muted) {
    tracks[index].solo = false
  }
  applySoloLogic()
  // 也通过非 Web Audio 路径更新
  updateTrackVolume(index)
}

function toggleSolo(index: number) {
  tracks[index].solo = !tracks[index].solo
  if (tracks[index].solo) {
    tracks[index].muted = false
  }
  applySoloLogic()
}

function updateTrackVolume(index: number) {
  const track = tracks[index]
  if (track.gainNode && audioContext) {
    const targetGain = track.muted ? 0 : track.volume / 100
    track.gainNode.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + 0.05)
  }
  // Solo logic may also change if volume is non-zero and solo is active
  applySoloLogic()
}

function updateMasterVolume() {
  if (masterGain && audioContext) {
    masterGain.gain.linearRampToValueAtTime(masterVolume.value / 100, audioContext.currentTime + 0.05)
  }
}

onMounted(() => {
  // 预初始化音频上下文（由用户首次交互触发）
})

onBeforeUnmount(() => {
  stopAllSources()
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})
</script>

<style scoped>
.multi-track-player {
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

/* Header */
.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.player-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.player-status {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

/* Empty state */
.player-empty {
  padding: 2.5rem 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.8rem;
  opacity: 0.5;
}

/* Transport Bar */
.transport-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.transport-btn {
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
  flex-shrink: 0;
}

.transport-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.play-btn {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.play-btn:hover {
  background: var(--vp-c-brand-2);
  color: #fff;
}

.progress-container {
  flex: 1;
  min-width: 80px;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-container:hover .progress-bar {
  height: 8px;
}

.time-display {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}

/* Master Volume */
.master-volume {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.volume-label {
  font-size: 0.85rem;
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-divider);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.master-slider {
  width: 70px;
}

/* Tracks Panel */
.tracks-panel {
  padding: 0.5rem 1.25rem 1rem;
}

.track-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  transition: background 0.15s;
  gap: 0.75rem;
}

.track-row:hover {
  background: var(--vp-c-bg-alt);
}

.track-muted {
  opacity: 0.55;
}

.track-solo {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

.track-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  flex-shrink: 0;
}

.track-icon {
  font-size: 1.1rem;
}

.track-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.track-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
}

.track-slider {
  flex: 1;
  max-width: 160px;
}

.track-btn {
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
  flex-shrink: 0;
}

.track-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.track-btn.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.solo-btn {
  font-weight: 700;
  font-size: 0.7rem;
}
</style>