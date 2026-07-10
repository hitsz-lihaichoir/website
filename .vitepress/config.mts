import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/website/',

  title: "荔海合唱团",
  description: "哈尔滨工业大学（深圳）合唱团",
  lang: 'zh-CN',
  
  themeConfig: {
    // 顶部导航栏：精准定位三大核心功能
    nav: [
      { text: '首页', link: '/' },
      { text: '🎼 在线曲谱库', link: '/music/' },
      { text: '📢 活动通知', link: '/events/' },
      { text: '🏛️ 乐团架构', link: '/about/' }
    ],

    // 侧边栏：直接列出曲目名称
    sidebar: {
      '/music/': [
        {
          text: '🎶 曲谱资源库',
          items: [
            { text: '荔海 (团歌)', link: '/music/lihai' }
            // 以后添加新歌，直接在这里加一行，例如：{ text: '茉莉花', link: '/music/molihua' }
          ]
        }
      ],
      '/events/': [
        {
          text: '大型活动',
          items: [
            { text: '近期通知', link: '/events/' },
            { text: '历史演出', link: '/events/history' }
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