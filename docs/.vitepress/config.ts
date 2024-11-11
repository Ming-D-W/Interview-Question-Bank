import { defineConfig } from "vitepress";
import vueOnedarkTheme from "./theme/vue-onedark-theme.json";

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: '/Interview-Question-Bank/',
  title: "面试题库",
  description: "前端面试题整理",
  scrollOffset: 80,
  markdown: {
    theme: {
      light: vueOnedarkTheme as any,
      dark: vueOnedarkTheme as any,
    },
  },
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "面试题", link: "/interview/01.Vue" },
      { text: "Vue3 组件封装最佳实践", link: "/vue3-best-practices/" },
    ],
    sidebar: {
      "/interview/": [
        {
          text: "面试题",
          items: [
            { text: "Vue", link: "/interview/01.Vue" },
            { text: "JavaScript", link: "/interview/02.JS" },
            { text: "浏览器 & HTTP", link: "/interview/03.浏览器&http" },
            { text: "CSS", link: "/interview/04.CSS" },
            { text: "New Vue 主体流程", link: "/interview/07.new vue主体流程" },
            { text: "Vue2 响应式源码", link: "/interview/08.Vue2响应式源码" },
            { text: "Vue2 Diff 算法", link: "/interview/09.Vue2 Diff 算法" },
          ],
        },
      ],
      "/vue3-best-practices/": [
        {
          text: "Vue 3 组件封装最佳实践",
          items: [
            { text: "概述", link: "/vue3-best-practices/" },
            { text: "组件封装最佳实践", link: "/vue3-best-practices/01-component-encapsulation" },
            { text: "无渲染组件指南", link: "/vue3-best-practices/02-renderless-components" },
            { text: "组件二次封装指南", link: "/vue3-best-practices/03-component-wrapper" },
            { text: "常见问题 FAQ", link: "/vue3-best-practices/04-faq" },
            { text: "性能优化专题", link: "/vue3-best-practices/05-performance-optimization" },
          ],
        },
      ],
    },
    search: {
      provider: "local",
    },
    outline: {
      level: "deep",
      label: "目录",
    },
  },
});
