<script setup>
import { computed, onMounted, ref } from 'vue'

const filePath = ref('')
const fileTitle = ref('曲谱预览')
const errorMessage = ref('')

const downloadName = computed(() => `${fileTitle.value}.pdf`)

onMounted(() => {
  try {
    const requestedFile = new URLSearchParams(window.location.search).get('file')

    if (!requestedFile) {
      throw new Error('没有指定需要预览的曲谱。')
    }

    const fileUrl = new URL(requestedFile, window.location.origin)
    const isLocalPdf =
      fileUrl.origin === window.location.origin &&
      fileUrl.pathname.startsWith('/website/pdfs/') &&
      fileUrl.pathname.toLowerCase().endsWith('.pdf')

    if (!isLocalPdf) {
      throw new Error('该文件不在本站允许预览的曲谱目录中。')
    }

    fileUrl.search = ''
    fileUrl.hash = ''
    filePath.value = fileUrl.pathname
    fileTitle.value =
      decodeURIComponent(fileUrl.pathname.split('/').pop() || '').replace(
        /\.pdf$/i,
        '',
      ) || '曲谱预览'
    document.title = `${fileTitle.value} - 荔海合唱团`
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '无法打开该曲谱。'
  }
})
</script>

<template>
  <div class="preview-shell">
    <header class="preview-toolbar">
      <a class="toolbar-button toolbar-back" href="/website/music/">
        ← 返回曲谱库
      </a>
      <strong class="preview-title">{{ fileTitle }}</strong>
      <a
        v-if="filePath"
        class="toolbar-button toolbar-download"
        :href="filePath"
        :download="downloadName"
      >
        下载 PDF
      </a>
      <span v-else class="toolbar-placeholder"></span>
    </header>

    <main class="preview-content">
      <iframe
        v-if="filePath"
        class="pdf-frame"
        :src="`${filePath}#view=FitH`"
        :title="`${fileTitle} PDF 预览`"
      ></iframe>

      <div v-else-if="errorMessage" class="preview-message preview-error">
        <h1>无法预览曲谱</h1>
        <p>{{ errorMessage }}</p>
        <a href="/website/music/">返回曲谱库</a>
      </div>

      <div v-else class="preview-message">正在加载曲谱……</div>
    </main>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  min-width: 320px;
  background: #eef1f5;
}

.preview-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  color: #1f2328;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.preview-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr) minmax(120px, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid #d8dee4;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 8px rgba(31, 35, 40, 0.08);
  backdrop-filter: blur(12px);
}

.preview-title {
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-button {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.toolbar-back {
  color: #475569;
}

.toolbar-back:hover {
  background: #f1f5f9;
}

.toolbar-download {
  justify-self: end;
  background: #3451b2;
  color: #fff;
}

.toolbar-download:hover {
  background: #29429b;
}

.preview-content {
  display: flex;
  min-height: 0;
  flex: 1;
}

.pdf-frame {
  width: 100%;
  min-height: calc(100vh - 65px);
  border: 0;
  background: #525659;
}

.preview-message {
  align-self: center;
  width: min(520px, calc(100% - 40px));
  margin: 48px auto;
  padding: 32px;
  border: 1px solid #d8dee4;
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

.preview-error h1 {
  margin-top: 0;
  font-size: 24px;
}

.preview-error a {
  color: #3451b2;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  html,
  body {
    background: #111827;
  }

  .preview-shell {
    color: #e5e7eb;
  }

  .preview-toolbar {
    border-bottom-color: #374151;
    background: rgba(17, 24, 39, 0.96);
  }

  .toolbar-back {
    color: #cbd5e1;
  }

  .toolbar-back:hover {
    background: #1f2937;
  }

  .preview-message {
    border-color: #374151;
    background: #1f2937;
  }
}

@media (max-width: 640px) {
  .preview-toolbar {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 8px;
    min-height: 56px;
    padding: 0 10px;
  }

  .toolbar-button {
    padding: 7px 10px;
    font-size: 13px;
  }

  .pdf-frame {
    min-height: calc(100vh - 57px);
  }
}
</style>
