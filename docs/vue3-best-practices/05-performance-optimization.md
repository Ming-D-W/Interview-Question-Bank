---
title: Vue 3 组件性能优化专题
---

# Vue 3 组件性能优化专题

> 本文深入探讨 Vue 3 组件开发中的性能优化技术，包括响应式优化、渲染优化、代码分割等核心主题，帮助你构建高性能的 Vue 3 应用。

## 一、响应式性能优化

### 1. 理解响应式开销

Vue 3 的响应式系统基于 **Proxy**，虽然比 Vue 2 的 `Object.defineProperty` 性能更好，但仍有开销：

**响应式开销来源**:
- 创建 Proxy 对象
- 依赖追踪（track）
- 触发更新（trigger）
- 深层对象的递归代理

**性能影响**:
```typescript
// 深层响应式对象
const state = reactive({
  level1: {
    level2: {
      level3: {
        // 每一层都会被代理
        data: []
      }
    }
  }
})
```

---

### 2. shallowRef vs ref

**ref**: 深层响应式
```typescript
const state = ref({
  nested: {
    count: 0
  }
})

// ✅ 深层属性变化会触发更新
state.value.nested.count++ // 触发更新
```

**shallowRef**: 只有根层响应式
```typescript
const state = shallowRef({
  nested: {
    count: 0
  }
})

// ❌ 深层属性变化不触发更新
state.value.nested.count++ // 不触发更新

// ✅ 整体替换触发更新
state.value = { nested: { count: 1 } } // 触发更新
```

**使用场景**:

```typescript
// ✅ 适合 shallowRef：大型不可变数据
const bigData = shallowRef({
  // 10000+ 个属性的配置对象
  config: { /* ... */ }
})

// 整体替换数据
const updateData = (newData) => {
  bigData.value = newData
}

// ✅ 适合 shallowRef：第三方库返回的对象
const chartInstance = shallowRef(null)

onMounted(() => {
  chartInstance.value = new Chart(/* ... */)
})
```

**性能对比**:
```typescript
// 性能测试示例
import { ref, shallowRef } from 'vue'

// 创建 10000 个属性的对象
const createBigObject = () => {
  const obj = {}
  for (let i = 0; i < 10000; i++) {
    obj[`key${i}`] = i
  }
  return obj
}

// ref: ~50ms
console.time('ref')
const deepState = ref(createBigObject())
console.timeEnd('ref')

// shallowRef: ~5ms (快 10 倍)
console.time('shallowRef')
const shallowState = shallowRef(createBigObject())
console.timeEnd('shallowRef')
```

---

### 3. shallowReactive vs reactive

**reactive**: 深层响应式
```typescript
const state = reactive({
  user: {
    profile: {
      name: 'John'
    }
  }
})

// ✅ 深层属性响应式
state.user.profile.name = 'Jane' // 触发更新
```

**shallowReactive**: 只有第一层响应式
```typescript
const state = shallowReactive({
  user: {
    profile: {
      name: 'John'
    }
  }
})

// ✅ 第一层响应式
state.user = { profile: { name: 'Jane' } } // 触发更新

// ❌ 深层属性不响应式
state.user.profile.name = 'Jane' // 不触发更新
```

**实际应用**:

```typescript
// ✅ 表单状态管理
const formState = shallowReactive({
  username: '',
  email: '',
  // 100 个表单字段
})

// 只需要追踪字段级别的变化
formState.username = 'new value' // 触发更新
```

---

### 4. 避免不必要的响应式

**原则**: 不是所有数据都需要响应式

```typescript
// ❌ 不必要的响应式
const config = reactive({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3
  // 这些配置不会变化，不需要响应式
})

// ✅ 静态配置使用普通对象
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3
}

// ✅ 只有动态数据才需要响应式
const state = ref({
  loading: false,
  data: null
})
```

**组件中的应用**:

```vue
<script setup lang="ts">
// ❌ 避免
const staticOptions = reactive([
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 }
])

// ✅ 推荐：静态数据不需要响应式
const staticOptions = [
  { label: 'Option 1', value: 1 },
  { label: 'Option 2', value: 2 }
]

// ✅ 只有动态数据才响应式
const selectedValue = ref(1)
</script>
```

---

### 5. 使用 markRaw 标记非响应式对象

```typescript
import { reactive, markRaw } from 'vue'

// 第三方库实例不需要响应式
const state = reactive({
  chart: markRaw(new Chart(/* ... */)),
  map: markRaw(new Map()),
  editor: markRaw(new Editor())
})

// 这些对象不会被代理，性能更好
```

**使用场景**:
- 第三方库实例（Chart.js、Leaflet、Monaco Editor）
- 大型不可变数据结构
- DOM 元素引用

---

## 二、计算属性与缓存

### 1. 计算属性缓存机制

**computed 自动缓存**:

```typescript
const items = ref([1, 2, 3, 4, 5])

// ✅ computed 会缓存结果
const sum = computed(() => {
  console.log('计算中...') // 只在依赖变化时执行
  return items.value.reduce((a, b) => a + b, 0)
})

// 多次访问不会重新计算
console.log(sum.value) // 计算中... 15
console.log(sum.value) // 15 (使用缓存)
console.log(sum.value) // 15 (使用缓存)

// 依赖变化时才重新计算
items.value.push(6)
console.log(sum.value) // 计算中... 21
```

---

### 2. computed vs methods

```vue
<script setup lang="ts">
const items = ref([/* 1000 个元素 */])

// ✅ computed：缓存结果
const filteredItems = computed(() => {
  console.log('过滤中...')
  return items.value.filter(item => item.active)
})

// ❌ methods：每次调用都执行
const getFilteredItems = () => {
  console.log('过滤中...')
  return items.value.filter(item => item.active)
}
</script>

<template>
  <!-- computed：只计算一次 -->
  <div>{{ filteredItems.length }}</div>
  <div>{{ filteredItems.length }}</div>
  <div>{{ filteredItems.length }}</div>
  <!-- 输出：过滤中... (只执行一次) -->

  <!-- methods：每次都计算 -->
  <div>{{ getFilteredItems().length }}</div>
  <div>{{ getFilteredItems().length }}</div>
  <div>{{ getFilteredItems().length }}</div>
  <!-- 输出：过滤中... 过滤中... 过滤中... (执行三次) -->
</template>
```

**选择建议**:
- 需要缓存 → `computed`
- 需要传参 → `methods`
- 有副作用 → `methods`

---

### 3. 计算属性的依赖追踪

```typescript
const firstName = ref('John')
const lastName = ref('Doe')
const age = ref(30)

// ✅ 只依赖 firstName 和 lastName
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// age 变化不会触发 fullName 重新计算
age.value = 31 // fullName 不重新计算
firstName.value = 'Jane' // fullName 重新计算
```

**避免不必要的依赖**:

```typescript
// ❌ 不必要的依赖
const result = computed(() => {
  const temp = someRef.value // 创建了依赖
  return otherValue.value * 2
})

// ✅ 只依赖真正需要的数据
const result = computed(() => {
  return otherValue.value * 2
})
```

---

## 三、列表渲染优化

### 1. v-memo 使用指南（Vue 3.2+）

**基础用法**:

```vue
<template>
  <div 
    v-for="item in list" 
    :key="item.id"
    v-memo="[item.id, item.selected]"
  >
    <!-- 只有 id 或 selected 变化时才重新渲染 -->
    <div class="item-content">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <ExpensiveComponent :data="item.data" />
    </div>
  </div>
</template>
```

**性能对比**:

```vue
<script setup lang="ts">
const list = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  title: `Item ${i}`,
  selected: false,
  data: { /* 复杂数据 */ }
})))

const toggleSelect = (id: number) => {
  const item = list.value.find(i => i.id === id)
  if (item) item.selected = !item.selected
}
</script>

<template>
  <!-- ❌ 没有 v-memo：切换一个 item，所有 1000 个都重新渲染 -->
  <div v-for="item in list" :key="item.id">
    <ExpensiveComponent :data="item" />
  </div>

  <!-- ✅ 使用 v-memo：只重新渲染变化的 item -->
  <div 
    v-for="item in list" 
    :key="item.id"
    v-memo="[item.selected]"
  >
    <ExpensiveComponent :data="item" />
  </div>
</template>
```

**使用场景**:
- ✅ 大列表（100+ 项）
- ✅ 列表项包含复杂组件
- ✅ 只有部分数据会变化

---

### 2. key 的正确使用

```vue
<!-- ❌ 使用 index 作为 key -->
<div v-for="(item, index) in items" :key="index">
  {{ item.name }}
</div>
<!-- 问题：插入/删除元素时会导致不必要的重渲染 -->

<!-- ✅ 使用唯一 ID 作为 key -->
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>

<!-- ✅ 如果没有 ID，可以组合多个字段 -->
<div v-for="item in items" :key="`${item.type}-${item.name}`">
  {{ item.name }}
</div>
```

**key 的作用**:
- 帮助 Vue 识别节点
- 优化 diff 算法
- 避免不必要的 DOM 操作

---

### 3. 虚拟滚动

**使用 VueUse 的 useVirtualList**:

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const allItems = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})))

const { list, containerProps, wrapperProps } = useVirtualList(
  allItems,
  {
    itemHeight: 50, // 每项高度
    overscan: 10    // 预渲染项数
  }
)
</script>

<template>
  <div v-bind="containerProps" style="height: 400px; overflow: auto;">
    <div v-bind="wrapperProps">
      <div 
        v-for="{ index, data } in list" 
        :key="index"
        style="height: 50px;"
      >
        {{ data.name }}
      </div>
    </div>
  </div>
</template>
```

**性能提升**:
- 10000 项列表
- 无虚拟滚动：渲染 10000 个 DOM 节点
- 虚拟滚动：只渲染可见的 ~20 个节点

---

## 四、代码分割与懒加载

### 1. 异步组件

```typescript
import { defineAsyncComponent } from 'vue'

// ✅ 基础异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// ✅ 带加载状态的异步组件
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200, // 延迟显示 loading
  timeout: 3000 // 超时时间
})
```

**使用场景**:
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 重量级组件按需加载
const RichTextEditor = defineAsyncComponent(() =>
  import('./RichTextEditor.vue')
)

const Chart = defineAsyncComponent(() =>
  import('./Chart.vue')
)

const showEditor = ref(false)
</script>

<template>
  <button @click="showEditor = true">打开编辑器</button>
  
  <!-- 只有在需要时才加载 -->
  <RichTextEditor v-if="showEditor" />
</template>
```

---

### 2. 路由懒加载

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/admin',
      // 使用 webpackChunkName 命名 chunk
      component: () => import(
        /* webpackChunkName: "admin" */
        '@/views/Admin.vue'
      )
    }
  ]
})
```

---

### 3. 动态导入与代码分割

```typescript
// ✅ 按需导入工具函数
const loadUtils = async () => {
  const { formatDate, formatCurrency } = await import('@/utils/formatters')
  return { formatDate, formatCurrency }
}

// ✅ 条件导入
const loadChartLibrary = async (type: string) => {
  if (type === 'line') {
    return await import('chart.js/auto')
  } else if (type === 'pie') {
    return await import('echarts')
  }
}
```

---

## 五、性能监控

### 1. Vue DevTools Performance

**使用步骤**:
1. 安装 Vue DevTools 浏览器扩展
2. 打开 DevTools → Vue → Performance
3. 点击 "Start Recording"
4. 执行操作
5. 点击 "Stop Recording"
6. 分析性能火焰图

**关注指标**:
- 组件渲染时间
- 更新频率
- 内存使用

---

### 2. Chrome DevTools Performance

```typescript
// 在代码中添加性能标记
performance.mark('component-render-start')

// 组件渲染逻辑

performance.mark('component-render-end')
performance.measure(
  'component-render',
  'component-render-start',
  'component-render-end'
)

// 查看测量结果
const measures = performance.getEntriesByType('measure')
console.log(measures)
```

---

### 3. 自定义性能监控

```typescript
// composables/usePerformance.ts
export function usePerformance(componentName: string) {
  const startTime = performance.now()
  
  onMounted(() => {
    const mountTime = performance.now() - startTime
    console.log(`${componentName} 挂载耗时: ${mountTime.toFixed(2)}ms`)
  })
  
  const measureUpdate = (label: string) => {
    const updateStart = performance.now()
    
    return () => {
      const updateTime = performance.now() - updateStart
      console.log(`${componentName} ${label} 耗时: ${updateTime.toFixed(2)}ms`)
    }
  }
  
  return { measureUpdate }
}

// 使用
const { measureUpdate } = usePerformance('UserList')

const handleFilter = () => {
  const done = measureUpdate('过滤操作')
  // 执行过滤
  done()
}
```

---

## 六、性能检查清单

### 开发阶段

- [ ] **响应式优化**
  - [ ] 静态数据不使用响应式
  - [ ] 大型对象使用 `shallowRef`/`shallowReactive`
  - [ ] 第三方库实例使用 `markRaw`

- [ ] **计算属性**
  - [ ] 复杂计算使用 `computed` 而非 `methods`
  - [ ] 避免计算属性中的副作用
  - [ ] 减少不必要的依赖

- [ ] **列表渲染**
  - [ ] 使用唯一 `key`
  - [ ] 大列表使用 `v-memo`
  - [ ] 超长列表使用虚拟滚动

- [ ] **组件设计**
  - [ ] 避免不必要的组件嵌套
  - [ ] 使用 `v-once` 渲染静态内容
  - [ ] 合理使用 `v-show` vs `v-if`

### 构建阶段

- [ ] **代码分割**
  - [ ] 路由懒加载
  - [ ] 异步组件
  - [ ] 动态导入

- [ ] **打包优化**
  - [ ] Tree Shaking
  - [ ] 代码压缩
  - [ ] 图片优化

### 运行时监控

- [ ] **性能指标**
  - [ ] 首屏加载时间 (FCP)
  - [ ] 可交互时间 (TTI)
  - [ ] 组件渲染时间

- [ ] **工具使用**
  - [ ] Vue DevTools Performance
  - [ ] Chrome DevTools
  - [ ] Lighthouse

---

## 七、实战案例

### 案例 1: 优化大型表格组件

**优化前**:
```vue
<script setup lang="ts">
const data = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  email: `user${i}@example.com`,
  status: 'active'
})))
</script>

<template>
  <table>
    <tr v-for="row in data" :key="row.id">
      <td>{{ row.name }}</td>
      <td>{{ row.email }}</td>
      <td>{{ row.status }}</td>
    </tr>
  </table>
</template>
```

**优化后**:
```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const allData = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  email: `user${i}@example.com`,
  status: 'active'
})))

const { list, containerProps, wrapperProps } = useVirtualList(
  allData,
  { itemHeight: 50 }
)
</script>

<template>
  <div v-bind="containerProps" style="height: 500px; overflow: auto;">
    <table v-bind="wrapperProps">
      <tr 
        v-for="{ index, data: row } in list" 
        :key="row.id"
        v-memo="[row.status]"
      >
        <td>{{ row.name }}</td>
        <td>{{ row.email }}</td>
        <td>{{ row.status }}</td>
      </tr>
    </table>
  </div>
</template>
```

**性能提升**: 渲染时间从 ~500ms 降至 ~50ms

---

## 总结

### 核心要点

✅ **响应式优化**: 不是所有数据都需要响应式  
✅ **计算属性**: 优先使用 computed 缓存结果  
✅ **列表优化**: v-memo + 虚拟滚动  
✅ **代码分割**: 异步组件 + 路由懒加载  
✅ **性能监控**: 使用工具持续监控  

### 优化原则

1. **测量优先** - 先测量再优化
2. **渐进优化** - 从影响最大的开始
3. **保持平衡** - 性能 vs 可维护性

---

**最后更新**: 2025年1月  
**相关文档**: [组件封装最佳实践](./01-component-encapsulation.md) | [常见问题 FAQ](./04-faq.md)

