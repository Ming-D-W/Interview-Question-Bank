---
title: JavaScript常用API篇
---

## 六、常用API篇

本篇整理了JavaScript中常用的数组、字符串、对象方法。

### 数组的常用方法有哪些?

**改变原数组的方法：**

- `push()`：将参数添加到原数组末尾，并返回数组的长度
- `pop()`：删除原数组最后一项，并返回删除元素的值；如果数组为空则返回undefined
- `shift()`：删除原数组第一项，并返回删除元素的值；如果数组为空则返回undefined
- `unshift()`：将参数添加到原数组开头，并返回数组的长度
- `splice(start, deleteCount, val1, val2, ...)`：从start位置开始删除deleteCount项，并从该位置起插入新元素
- `sort(compareFunction)`：按指定的参数对数组进行排序
- `reverse()`：将数组反序
- `fill(value, start, end)`：使用特定值填充数组中的一个或多个元素
- `copyWithin(target, start, end)`：从数组的指定位置拷贝元素到数组的另一个指定位置中

**不改变原数组的方法：**

- `join(separator)`：将数组的元素组成一个字符串，以separator为分隔符，省略的话则用默认用逗号为分隔符
- `slice(start, end)`：截取数组某部分的元素为一个新的数组，第一个参数是起始位置，第二个是结束位置(不包含end)
- `concat()`：将两个或多个数组合并在一起，返回新数组
- `indexOf(value)`：返回当前值在数组中第一次出现位置的索引，没有则返回-1
- `lastIndexOf(value)`：返回当前值在数组中最后出现位置的索引，没有则返回-1
- `includes(value)`：判断一个数组是否包含指定的值，返回布尔值
- `toString()`、`toLocaleString()`：将数组转换为字符串

**遍历方法：**

- `forEach(callback)`：循环遍历数组每一项，没有返回值
- `map(callback)`：循环遍历数组的每一项，返回新数组
- `filter(callback)`：过滤数组，返回满足条件的新数组
- `find(callback)`：返回第一个匹配的值，并停止查找
- `findIndex(callback)`：返回第一个匹配值的索引，并停止查找
- `every(callback)`：判断数组中每一项是否都符合条件，返回布尔值
- `some(callback)`：判断数组中是否存在满足条件的项，返回布尔值
- `reduce(callback, initialValue)`：将数组元素累加为一个值（从左到右）
- `reduceRight(callback, initialValue)`：将数组元素累加为一个值（从右到左）

**其他方法：**

- `flat(depth)`：将嵌套数组扁平化，depth指定展开深度，默认为1
- `flatMap(callback)`：先map再flat(深度为1)
- `entries()`：返回数组的键值对迭代器
- `keys()`：返回数组的键迭代器
- `values()`：返回数组的值迭代器

**reduce和reduceRight详解：**

```js
// reduce: 从左到右累加
const arr = [1, 2, 3, 4, 5]

// 求和
const sum = arr.reduce((acc, cur) => acc + cur, 0) // 15

// 求最大值
const max = arr.reduce((acc, cur) => Math.max(acc, cur)) // 5

// 数组去重
const arr2 = [1, 2, 2, 3, 3, 4]
const unique = arr2.reduce((acc, cur) => {
  if (!acc.includes(cur)) {
    acc.push(cur)
  }
  return acc
}, []) // [1, 2, 3, 4]

// 对象数组转对象
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]
const userMap = users.reduce((acc, cur) => {
  acc[cur.id] = cur
  return acc
}, {}) // { 1: { id: 1, name: '张三' }, 2: { id: 2, name: '李四' } }

// reduceRight: 从右到左累加
const arr3 = ['a', 'b', 'c', 'd']
const reversed = arr3.reduceRight((acc, cur) => {
  acc.push(cur)
  return acc
}, []) // ['d', 'c', 'b', 'a']
```

### 字符串常用方法

**查找和检索：**

- `charAt(index)`：返回指定位置的字符
- `charCodeAt(index)`：返回指定位置字符的Unicode编码
- `indexOf(searchValue, fromIndex)`：返回某个指定字符串值在字符串中首次出现的位置，没有则返回-1
- `lastIndexOf(searchValue, fromIndex)`：从后向前搜索，返回最后一次出现的位置
- `search(regexp)`：检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串
- `match(regexp)`：在字符串内检索指定的值，或找到一个或多个正则表达式的匹配
- `matchAll(regexp)`：返回一个包含所有匹配正则表达式的结果的迭代器

**截取和拼接：**

- `slice(start, end)`：提取字符串的某个部分，返回新字符串（支持负数）
- `substring(start, end)`：提取字符串中两个指定的索引号之间的字符（不支持负数）
- `substr(start, length)`：从起始索引号提取字符串中指定数目的字符（已废弃）
- `concat(str1, str2, ...)`：连接两个或多个字符串
- `split(separator, limit)`：把字符串分割为字符串数组

**大小写转换：**

- `toLowerCase()`：把字符串转换为小写
- `toUpperCase()`：把字符串转换为大写
- `toLocaleLowerCase()`：根据本地主机的语言环境把字符串转换为小写
- `toLocaleUpperCase()`：根据本地主机的语言环境把字符串转换为大写

**修改和替换：**

- `replace(searchValue, replaceValue)`：替换字符串中的某些字符（只替换第一个匹配）
- `replaceAll(searchValue, replaceValue)`：替换所有匹配的字符串
- `trim()`：去除字符串两端的空白字符
- `trimStart()` / `trimLeft()`：去除字符串开头的空白字符
- `trimEnd()` / `trimRight()`：去除字符串末尾的空白字符
- `padStart(targetLength, padString)`：在字符串开头填充指定字符，直到达到指定长度
- `padEnd(targetLength, padString)`：在字符串末尾填充指定字符，直到达到指定长度
- `repeat(count)`：返回一个新字符串，表示将原字符串重复n次

**判断：**

- `startsWith(searchString, position)`：判断字符串是否以指定的子字符串开始
- `endsWith(searchString, length)`：判断字符串是否以指定的子字符串结束
- `includes(searchString, position)`：判断字符串是否包含指定的子字符串

**其他：**

- `length`：返回字符串的长度
- `toString()`：返回字符串
- `valueOf()`：返回字符串对象的原始值

### 对象常用方法

**创建和原型：**

- `Object.create(proto, propertiesObject)`：创建一个新对象，使用现有的对象作为新对象的原型
- `Object.getPrototypeOf(obj)`：返回指定对象的原型
- `Object.setPrototypeOf(obj, prototype)`：设置对象的原型

**属性操作：**

- `Object.keys(obj)`：返回对象自身可枚举属性的键组成的数组
- `Object.values(obj)`：返回对象自身可枚举属性的值组成的数组
- `Object.entries(obj)`：返回对象自身可枚举属性的键值对数组
- `Object.fromEntries(entries)`：将键值对数组转换为对象
- `Object.getOwnPropertyNames(obj)`：返回对象所有自身属性的键名（包括不可枚举属性）
- `Object.getOwnPropertySymbols(obj)`：返回对象所有Symbol属性的数组

**属性描述符：**

- `Object.getOwnPropertyDescriptor(obj, prop)`：返回对象指定属性的描述符
- `Object.getOwnPropertyDescriptors(obj)`：返回对象所有自身属性的描述符
- `Object.defineProperty(obj, prop, descriptor)`：定义对象的新属性或修改现有属性
- `Object.defineProperties(obj, props)`：定义对象的多个新属性或修改多个现有属性

**对象操作：**

- `Object.assign(target, ...sources)`：将所有可枚举属性从一个或多个源对象复制到目标对象
- `Object.freeze(obj)`：冻结对象，不能添加、删除、修改属性
- `Object.seal(obj)`：密封对象，不能添加、删除属性，但可以修改现有属性
- `Object.preventExtensions(obj)`：阻止对象扩展，不能添加新属性
- `Object.isFrozen(obj)`：判断对象是否被冻结
- `Object.isSealed(obj)`：判断对象是否被密封
- `Object.isExtensible(obj)`：判断对象是否可扩展

**判断：**

- `Object.is(value1, value2)`：判断两个值是否相同（比===更严格）
- `Object.hasOwn(obj, prop)`：判断对象是否有指定的自身属性（ES2022）
- `obj.hasOwnProperty(prop)`：判断对象是否有指定的自身属性
- `obj.isPrototypeOf(obj)`：判断对象是否在另一个对象的原型链上
