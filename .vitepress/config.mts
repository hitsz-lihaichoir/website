import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/website/',

  title: "荔海合唱团",
  description: "哈尔滨工业大学（深圳）合唱团",
  lang: 'zh-CN',
  
  themeConfig: {
    // 顶部导航栏：活动通知暂时隐藏，保留文件以便后续恢复
    nav: [
      { text: '首页', link: '/' },
      { text: '🎼 在线曲谱库', link: '/music/' },
      { text: '🎤 招新专区', link: '/recruitment/' },
      { text: '🏛️ 乐团架构', link: '/about/' }
    ],

    // 侧边栏：直接列出曲目名称
    sidebar: {
      '/music/': [
        {
          text: '🎶 曲谱资源库',
          items: [
            { text: '爱永在（本学期）', link: '/music/aiyongzai' },
            { text: '荔海 (团歌)', link: '/music/lihai' }
            // 以后添加新歌，直接在这里加一行，例如：{ text: '茉莉花', link: '/music/molihua' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hitsz-lihaichoir' }
    ],

    footer: {
      message: '哈尔滨工业大学（深圳）荔海合唱团',
      copyright: 'Copyright © 2026 HITSZ Choir'
    },

    search: {
      provider: 'local'
    }
  }
})
