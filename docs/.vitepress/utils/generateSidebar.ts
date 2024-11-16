import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface SidebarItem {
  text: string;
  link: string;
}

interface SidebarGroup {
  text: string;
  items: SidebarItem[];
}

interface RouteMapping {
  hash: string;
  originalPath: string;
  text: string;
}

// 存储所有路由映射
const routeMappings: Record<string, RouteMapping[]> = {};

/**
 * 生成文件路径的哈希值
 * @param filePath 文件路径
 * @returns 8位哈希值
 */
function generateHash(filePath: string): string {
  const hash = crypto.createHash('md5').update(filePath).digest('hex');
  return hash.substring(0, 8); // 使用前8位
}

/**
 * 从文件名中提取序号和显示文本
 * @param filename 文件名，如 "01.Vue.md"
 * @returns { order: number, text: string, hash: string } 或 null
 */
function parseFileName(filename: string, dirPath: string): { order: number; text: string; hash: string } | null {
  // 匹配格式: 数字.文本.md
  const match = filename.match(/^(\d+)\.(.+)\.md$/);
  if (!match) return null;

  const order = parseInt(match[1], 10);
  const text = match[2];

  // 生成哈希值（基于完整路径）
  const fullPath = `${dirPath}/${filename}`;
  const hash = generateHash(fullPath);

  return { order, text, hash };
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
  const items: Array<{ order: number; text: string; filename: string; hash: string }> = [];

  for (const file of files) {
    // 跳过 index.md
    if (file === 'index.md') continue;

    // 只处理 .md 文件
    if (!file.endsWith('.md')) continue;

    const parsed = parseFileName(file, dirPath);
    if (parsed) {
      items.push({
        order: parsed.order,
        text: parsed.text,
        filename: file,
        hash: parsed.hash,
      });
    }
  }

  // 按序号排序
  items.sort((a, b) => a.order - b.order);

  // 从目录路径中提取路由前缀，如 "docs/interview" -> "/interview"
  const routePrefix = '/' + dirPath.split('/').slice(1).join('/');

  // 初始化路由映射数组
  if (!routeMappings[routePrefix]) {
    routeMappings[routePrefix] = [];
  }

  // 生成 sidebar items
  const sidebarItems: SidebarItem[] = items.map((item) => {
    // 使用哈希值作为链接路径
    const linkPath = item.hash;

    // 保存路由映射
    routeMappings[routePrefix].push({
      hash: item.hash,
      originalPath: item.filename.replace(/\.md$/, ''),
      text: item.text,
    });

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
 * @returns 第一篇文章的链接路径（使用哈希值），如果没有文章则返回 "/"
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
  const items: Array<{ order: number; filename: string; hash: string }> = [];

  for (const file of files) {
    // 跳过 index.md
    if (file === 'index.md') continue;

    // 只处理 .md 文件
    if (!file.endsWith('.md')) continue;

    const parsed = parseFileName(file, dirPath);
    if (parsed) {
      items.push({
        order: parsed.order,
        filename: file,
        hash: parsed.hash,
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
  // 使用哈希值作为链接路径
  const linkPath = firstArticle.hash;

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

/**
 * 生成路由重写配置
 * @returns Record<string, string> - VitePress rewrites 配置
 */
export function generateRewrites(): Record<string, string> {
  const rewrites: Record<string, string> = {};

  // 遍历所有路由映射
  for (const [routePrefix, mappings] of Object.entries(routeMappings)) {
    for (const mapping of mappings) {
      // 从路由前缀中提取目录名，如 "/interview" -> "interview"
      const dirName = routePrefix.replace(/^\/|\/$/g, '');

      // VitePress rewrites 格式: 实际文件路径.md -> URL路径.md
      // 将实际文件 interview/01.Vue.md 映射到 URL interview/a1b2c3d4
      const originalPath = `${dirName}/${mapping.originalPath}.md`;
      const hashPath = `${dirName}/${mapping.hash}.md`;

      rewrites[originalPath] = hashPath;
    }
  }

  console.log('生成的 rewrites 配置:', rewrites);
  return rewrites;
}

/**
 * 保存路由映射到 JSON 文件（用于调试）
 */
export function saveRouteMappings(): void {
  const outputPath = path.resolve(process.cwd(), 'route-mappings.json');
  const mappingsFormatted: Record<string, Array<{ hash: string; file: string; text: string }>> = {};

  for (const [routePrefix, mappings] of Object.entries(routeMappings)) {
    mappingsFormatted[routePrefix] = mappings.map(m => ({
      hash: m.hash,
      file: m.originalPath,
      text: m.text,
    }));
  }

  fs.writeFileSync(outputPath, JSON.stringify(mappingsFormatted, null, 2), 'utf-8');
  console.log(`路由映射已保存到: ${outputPath}`);
}

