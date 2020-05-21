---
title: hexo主题配置与修改
date: 2020-05-21 22:47:09
toc: true
tags: hexo
description: "主要对https://github.com/wayou/hexo-theme-material进行配置和修改" 
---
最近把博客换到了github pages上面，使用hexo作为静态页面生成的工具，喜欢简洁风格，选中了https://github.com/wayou/hexo-theme-material 这个hexo主题。
<!-- more -->

## 生成页面
生成分类页面
```shell
hexo new page categories
```
将 source/categories/index.md 的内容修改为如下：
```
---
date: 2018-03-11 16:17:14
type: "categories"
comments: false
---
```
生成标签页面
```shell
hexo new page tags
```
将 source/tags/index.md 的内容修改为如下：
```
---
date: 2017-07-10 16:36:26
type: "tags"
comments: false
---
```
生成 about 关于我页面
```shell
hexo new page about
```
将 source/about/index.md 的内容修改为如下：
```
---
title: 关于我
type: "about"
date: 2018-03-11 16:18:54
comments: false
---

关于你的描述......
```
## 安装favicon.icon
在https://favicon.io/favicon-generator/ 网站上面制作，制作完成之后上面也有引入方式
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
```
修改/home/xiaopo/grayguest.github.io/docs/themes/material/layout/_partial/head.ejs中的内容符合上面的引入方式即可
![image-20200522002421022](/data/typora_assets/hexo主题配置与修改/image-20200522002421022.png)
参考链接：

- https://dustyposa.github.io/posts/e575718e/#%E6%9B%B4%E6%8D%A2%E4%B8%BB%E9%A2%98
- https://www.jianshu.com/p/33bc0a0a6e90
- https://juejin.im/post/5be145a86fb9a049d7472623
