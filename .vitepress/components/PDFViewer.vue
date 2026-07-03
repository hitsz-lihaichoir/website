<template>
  <div class="pdf-viewer">
    <div v-if="!src" class="pdf-placeholder">
      <div class="placeholder-icon">📄</div>
      <p>请提供曲谱 PDF 文件路径</p>
      <p class="hint">例如：<PDFViewer src="/scores/sample.pdf" /></p>
    </div>
    <div v-else-if="error" class="pdf-error">
      <div class="error-icon">⚠️</div>
      <p>PDF 加载失败：{{ error }}</p>
    </div>
    <div v-else class="pdf-container">
      <div class="pdf-toolbar">
        <span class="pdf-title">{{ filename }}</span>
        <button class="pdf-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏查看'">
          {{ isFullscreen ? '⊠' : '⛶' }}
        </button>
      </div>
      <iframe
        ref="pdfFrame"
        :src="pdfUrl"
        class="pdf-iframe"
        :class="{ 'pdf-fullscreen': isFullscreen }"
        width="100%"
        height="600"
        frameborder="0"
        allowfullscreen
        @error="onError"
      >
      </iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  src: string
}>()

const pdfFrame = ref<HTMLIFrameElement>()
const error = ref('')
const isFullscreen = ref(false)

const pdfUrl = computed(() => {
  if (!props.src) return ''
  // 使用 Google Docs Viewer 作为后备，也支持本地路径
  // 若为本地相对路径则直接使用，远程则编码
  if (props.src.startsWith('http')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(props.src)}&embedded=true`
  }
  return props.src
})

const filename = computed(() => {
  if (!props.src) return ''
  const parts = props.src.split('/')
  return parts[parts.length - 1] || props.src
})

function toggleFullscreen() {
  const el = pdfFrame.value
  if (!el) return

  if (!isFullscreen.value) {
    if (el.requestFullscreen) {
      el.requestFullscreen()
    }
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
    isFullscreen.value = false
  }

  // 监听退出全屏
  const onFullscreenChange = () => {
    if (!document.fullscreenElement) {
      isFullscreen.value = false
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }
  document.addEventListener('fullscreenchange', onFullscreenChange)
}

function onError() {
  error.value = '无法加载 PDF 文件，请确认文件路径正确'
}
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.pdf-placeholder,
.pdf-error {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.placeholder-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.hint {
  font-size: 0.85rem;
  opacity: 0.6;
}

.pdf-error {
  color: var(--vp-c-danger-1);
}

.pdf-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
}

.pdf-title {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.pdf-btn {
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  transition: all 0.2s;
}

.pdf-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.pdf-iframe {
  display: block;
  width: 100%;
  min-height: 500px;
  height: 70vh;
  max-height: 900px;
  background: #fff;
}

.pdf-iframe.pdf-fullscreen {
  height: 100vh;
  max-height: none;
}
</style>