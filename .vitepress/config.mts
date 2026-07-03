import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HITSZ 合唱团",
  description: "哈尔滨工业大学（深圳）合唱团 — 排练、曲谱与资源平台",
  lang: 'zh-CN',
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '曲谱库', link: '/music/' },
      { text: '排练日程', link: '/schedule/' }
    ],

    sidebar: {
      '/music/': [
        {
          text: '曲谱库',
          items: [
            { text: '浏览曲谱', link: '/music/' },
            { text: '声部练习', link: '/music/#声部练习' }
          ]
        }
      ],
      '/schedule/': [
        {
          text: '排练日程',
          items: [
            { text: '排练安排', link: '/schedule/' },
            { text: '历史记录', link: '/schedule/#历史排练' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    footer: {
      message: '哈尔滨工业大学（深圳）合唱团',
      copyright: 'Copyright © 2024 HITSZ Choir'
    },

    search: {
      provider: 'local'
    }
  }
})