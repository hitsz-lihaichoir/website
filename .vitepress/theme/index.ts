// https://vitepress.dev/guide/custom-theme
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PDFViewer from '../components/PDFViewer.vue'
import MultiTrackPlayer from '../components/MultiTrackPlayer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局自定义组件
    app.component('PDFViewer', PDFViewer)
    app.component('MultiTrackPlayer', MultiTrackPlayer)
  }
} satisfies Theme