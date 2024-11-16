import { defineConfig } from "vitepress";
import vueOnedarkTheme from "./theme/vue-onedark-theme.json";
import { generateAllSidebars, getFirstArticleLink, generateRewrites, saveRouteMappings } from "./utils/generateSidebar";

// 生成 sidebar（这会填充 routeMappings）
const sidebar = generateAllSidebars();

// 生成 rewrites 配置（必须在 generateAllSidebars 之后调用）
const rewrites = generateRewrites();

// 保存路由映射到文件（用于调试）
if (process.env.NODE_ENV !== 'production') {
  saveRouteMappings();
}

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Interview-Question-Bank/' : '/',
  title: "面试题库",
  description: "前端面试题整理",
  scrollOffset: 80,
  cleanUrls: true,

  // 路由重写配置：将哈希路径映射到原始文件路径
  rewrites,

  // 性能优化配置
  lastUpdated: true,

  // Vite 构建优化
  vite: {
    build: {
      // 代码分割优化
      chunkSizeWarningLimit: 1000,
      // 使用esbuild压缩(默认,速度更快)
      minify: 'esbuild',
    },
    // 开发服务器优化
    server: {
      fs: {
        // 允许访问项目根目录之外的文件
        allow: ['..']
      }
    },
    // esbuild优化配置
    esbuild: {
      drop: ['console', 'debugger'], // 生产环境移除console和debugger
    }
  },

  // Markdown 配置优化
  markdown: {
    theme: {
      light: vueOnedarkTheme as any,
      dark: vueOnedarkTheme as any,
    },
    // 代码块配置优化
    lineNumbers: false, // 禁用行号以提升性能
    // 代码高亮缓存
    cache: true,
  },

  // Head 标签优化
  head: [
    // DNS 预解析
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
    // 预连接
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
  ],
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "面试题", link: getFirstArticleLink('docs/interview'), activeMatch: '/interview/' },
      { text: "Vue3 组件封装最佳实践", link: getFirstArticleLink('docs/vue3-best-practices'), activeMatch: '/vue3-best-practices/' },
    ],
    sidebar,
    search: {
      provider: "local",
    },
    outline: {
      level: "deep",
      label: "目录",
    },
  },
});
