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

    // 侧边栏：帮你把曲谱库按声部或风格分类
    sidebar: {
      '/music/': [
        {
          text: '曲谱分类',
          items: [
            { text: '混声合唱 (SATB)', link: '/music/satb' },
            { text: '男声合唱 (TTBB)', link: '/music/ttbb' },
            { text: '女声合唱 (SSAA)', link: '/music/ssaa' }
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