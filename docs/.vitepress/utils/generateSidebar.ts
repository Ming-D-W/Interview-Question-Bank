import fs from 'fs';
import path from 'path';

interface SidebarItem {
  text: string;
  link: string;
}

interface SidebarGroup {
  text: string;
  items: SidebarItem[];
}

/**
 * 从文件名中提取序号和显示文本
 * @param filename 文件名，如 "01.Vue.md"
 * @returns { order: number, text: string } 或 null
 */
function parseFileName(filename: string): { order: number; text: string } | null {
  // 匹配格式: 数字.文本.md
  const match = filename.match(/^(\d+)\.(.+)\.md$/);
  if (!match) return null;

  const order = parseInt(match[1], 10);
  const text = match[2];

  return { order, text };
}

/**
 * 生成指定目录的 sidebar 配置
 * @param dirPath 目录路径，相对于项目根目录，如 "docs/interview"
 * @param groupText sidebar 分组标题
 * @returns SidebarGroup[]
 */
export function generateSidebar(dirPath: string, groupText: string): SidebarGroup[] {
  const fullPath = path.resolve(process.cwd(), dirPath);

  // 检查目录是否存在
  if (!fs.existsSync(fullPath)) {
    console.warn(`目录不存在: ${fullPath}`);
    return [];
  }

  // 读取目录下的所有文件
  const files = fs.readdirSync(fullPath);

  // 解析文件名并过滤
  const items: Array<{ order: number; text: string; filename: string }> = [];

  for (const file of files) {
    // 跳过 index.md
    if (file === 'index.md') continue;

    // 只处理 .md 文件
    if (!file.endsWith('.md')) continue;

    const parsed = parseFileName(file);
    if (parsed) {
      items.push({
        order: parsed.order,
        text: parsed.text,
        filename: file,
      });
    }
  }

  // 按序号排序
  items.sort((a, b) => a.order - b.order);

  // 生成 sidebar items
  const sidebarItems: SidebarItem[] = items.map((item) => {
    // 从目录路径中提取路由前缀，如 "docs/interview" -> "/interview"
    const routePrefix = '/' + dirPath.split('/').slice(1).join('/');
    // 移除 .md 后缀
    const linkPath = item.filename.replace(/\.md$/, '');

    return {
      text: item.text,
      link: `${routePrefix}/${linkPath}`,
    };
  });

  return [
    {
      text: groupText,
      items: sidebarItems,
    },
  ];
}

/**
 * 获取指定目录的第一篇文章链接
 * @param dirPath 目录路径，相对于项目根目录，如 "docs/interview"
 * @returns 第一篇文章的链接路径，如 "/interview/01.Vue"，如果没有文章则返回 "/"
 */
export function getFirstArticleLink(dirPath: string): string {
  const fullPath = path.resolve(process.cwd(), dirPath);

  // 检查目录是否存在
  if (!fs.existsSync(fullPath)) {
    console.warn(`目录不存在: ${fullPath}`);
    return '/';
  }

  // 读取目录下的所有文件
  const files = fs.readdirSync(fullPath);

  // 解析文件名并过滤
  const items: Array<{ order: number; filename: string }> = [];

  for (const file of files) {
    // 跳过 index.md
    if (file === 'index.md') continue;

    // 只处理 .md 文件
    if (!file.endsWith('.md')) continue;

    const parsed = parseFileName(file);
    if (parsed) {
      items.push({
        order: parsed.order,
        filename: file,
      });
    }
  }

  // 如果没有找到文章，返回根路径
  if (items.length === 0) {
    return '/';
  }

  // 按序号排序
  items.sort((a, b) => a.order - b.order);

  // 获取第一篇文章
  const firstArticle = items[0];
  const routePrefix = '/' + dirPath.split('/').slice(1).join('/');
  const linkPath = firstArticle.filename.replace(/\.md$/, '');

  return `${routePrefix}/${linkPath}`;
}

/**
 * 生成所有目录的 sidebar 配置
 * @returns Record<string, SidebarGroup[]>
 */
export function generateAllSidebars(): Record<string, SidebarGroup[]> {
  return {
    '/interview/': generateSidebar('docs/interview', '面试题'),
    '/vue3-best-practices/': generateSidebar('docs/vue3-best-practices', 'Vue 3 组件封装最佳实践'),
  };
}

