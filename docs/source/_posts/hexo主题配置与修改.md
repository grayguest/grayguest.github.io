---
title: hexo主题配置与修改
date: 2020-05-21 22:47:09
toc: true
categories: web
tags: hexo
description: "主要对https://github.com/wayou/hexo-theme-material进行配置和修改" 
---
最近把博客换到了github pages上面，使用hexo作为静态页面生成的工具，hexo自带主题比较丑，于是搜索自己比较喜欢简洁、小众风格，最后选中了https://github.com/wayou/hexo-theme-material 这个hexo主题，我们需要对这个主题做一些配置和修改，因为这个主题本身不提供文章分类和标签的功能，记录一下摸索的过程。
<!-- more -->

## 配置与修改
### 选择语言包
修改hexo中的\_config.yml文件
```
language: zh-CN
```
主题languages文件夹下zh-CN.yml文件中需要补充以下两个字段
```
archive_a: 归档
archive_b: "归档: %s"
```
其中archive_a用来显示点击菜单中“归档”时的页面title
### 编辑首页
编辑主题中的\_config.yml文件，而非hexo中的\_config.yml文件
1. 修改”存档“为”归档“
2. 注释菜单中”RSS“
3. 修改links:
4. 增加以下两个widgets
```
- category
- tag
```
其中category用于显示文章分类，tag用于显示标签。

### 生成页面
1. 生成分类页面
```shell
hexo new page categories
```
将 source/categories/index.md 的内容修改为如下：
```
---
title: 分类
date: 2020-05-21 22:00:00
type: "categories"
comments: false
---
```
2. 生成标签页面
```shell
hexo new page tags
```
将 source/tags/index.md 的内容修改为如下：
```
---
title: 标签
date: 2020-05-21 22:00:00
type: "tags"
comments: false
---
```
3. 生成 about 关于我页面
```shell
hexo new page about
```
将 source/about/index.md 的内容修改为如下：
```
---
title: 关于我
type: "about"
date: 2020-05-21 22:00:00
comments: false
---

关于你的描述......
```

### 安装favicon.icon
在https://favicon.io/favicon-generator/ 网站上面制作，制作完成之后上面也有引入方式
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
```
修改/home/xiaopo/grayguest.github.io/docs/themes/material/layout/_partial/head.ejs中的内容符合上面的引入方式即可
![data-typora_assets-hexo主题配置与修改-image-20200522002421022.png](https://i.loli.net/2020/05/22/gxry7fCeE1PaFdW.png)

### 修改颜色
目前没找到方法

### 修改More...
article.ejs，修改如下代码：
```ejs
<a class="btn btn-default" href="<%- url_for(post.path) %>"> More... </a>
```
为
```ejs
<a class="article-more-a" href="<%- url_for(post.path) %>"> 阅读更多... </a>
```
### 增加分类
前面已经通过```hexo new page categories```生成分类页面，拷贝landscape主题的layout/category.ejs到material主题的同级目录，拷贝landscape主题的layout/\_partial/post文件夹到material主题的同级目录，编辑material主题layout/\_widget\category.ejs
```ejs
<% if (site.categories.length){ %>
	<div class="widget">
		<h4><%= __('categories') %></h4>
		<ul class="tag_box inline list-unstyled">
		<% site.categories.sort('name').each(function(item){ %>
			<li>
            <a href="<%- config.root %><%- item.path %>"><i class="mdi-content-sort"></i><%= item.name %></a>
            </li>
		<% }); %>
		</ul>
	</div>
<% } %>
```
### 增加标签
前面已经通过```hexo new page tags```生成标签页面，拷贝landscape主题的layout/tag.ejs到material主题的同级目录，编辑material主题layout/\_widget\tag.ejs
```ejs
<% if (site.tags.length){ %>
  <div class="widget">
    <h4><%= __('tags') %></h4>
    <ul class="blogroll list-unstyled">
      <% site.tags.each(function(tag){ %>
        <li>
          <a href="<%= config.root %><%= tag.path %>" > <i class="mdi-action-label-outline"></i><%= tag.name%></a>
        </li>
      <% }); %>
    </ul>
  </div>
<% } %>

```
## 缺陷

- markdown中使用一号标题#的文章，无法显示在hexo生成的文章结构中
- markdown中标题前面最好空一行，否则在hexo生成的文章中容易排版发生错位和其他问题。

## 参考链接

- https://dustyposa.github.io/posts/e575718e/#%E6%9B%B4%E6%8D%A2%E4%B8%BB%E9%A2%98
- https://www.jianshu.com/p/33bc0a0a6e90
- https://juejin.im/post/5be145a86fb9a049d7472623
- https://cloud.tencent.com/developer/article/1440353
