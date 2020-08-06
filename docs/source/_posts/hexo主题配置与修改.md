---
title: hexo主题配置与修改
toc: true
categories: web
tags: hexo
abbrlink: 13920
date: 2020-05-21 22:47:09
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
全局修改，目前没找到方法。

### 修改More...
article.ejs，修改如下代码：
```ejs
<a class="btn btn-default" href="<%- url_for(post.path) %>"> More... </a>
```
为
```ejs
<a class="article-more-a" href="<%- url_for(post.path) %>"> 阅读更多... </a>
```

### 修改移动端兼容性
该主题在移动端，实际测试所用手机为iphone se2 13.5.1+safari，对于代码高亮有左右滚动条的展示，代码会显示不全，需要修改material主题source/css/highlight.css和highlight.light.css这2个文件中的`.highlight pre {}`和`figure.highlight pre`部分，具体将以下
```css
.highlight pre {
  border: none;
  margin: 0;
  padding: 0;
}
```
更改为
```css
.highlight pre {
  border: none;
  margin: 0;
  /* padding: 0; */
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 0;
  white-space: pre;
}
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
### 增加版权说明
article.ejs文件的post部分增加，
```ejs
					<% if (page.path != 'about/index.html' && theme.copyright.enable){ %>
					<%- partial('copyright') %>
					<% } %>
```
发现about部分也会显示版权说明，about处的pageType竟然是post？？？

增加主题layout/\_partial/copyright.ejs文件

```ejs
<style type="text/css">
.page-copyright {
    margin: 2em 0 0;
    padding: 0.5em 1em;
    border-left: 3px solid #FF1700;
    background-color: #F9F9F9;
    list-style: none;
}

.page-copyright li {
    line-height: 30px;
}
</style>
<div>
    <ul class="page-copyright">
      <li class="page-copyright-author">
      <strong><%= __('copyright.author') %> </strong><%= config.author%></a>
      </li>
      <li class="page-copyright-link">
      <strong><%= __('copyright.link') %> </strong>
      <a href="<%- config.root %><%- page.path %>" target="_blank" title="<%= page.title %>"><%- config.url %>/<%- page.path %></a>
      </li>
      <li class="page-copyright-license">
        <strong><%= __('copyright.license_title') %>  </strong>
        <%= __('copyright.left_license_content') %><a rel="license" href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" title="Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)">CC BY-NC-ND 4.0</a>
        <%= __('copyright.right_license_content') %>
      </li>
    </ul>
  <div>

```
主题\_config.yml文件增加，
```
#版权信息
copyright:
    enable: true
```
zh-CN.yml语言包增加，
```
copyright:
    author: "作者: "
    link: "文章链接: "
    license_title: "版权声明: "
    left_license_content: "本网站所有文章除特别声明外，均采用"
    right_license_content: "许可协议，转载请注明出处！"
```
### 增加打赏
article.ejs文件的post部分增加，
```ejs
					<% if (page.path != 'about/index.html' && theme.donate.enable){ %>
					<%- partial('donate') %>
					<% } %>
```
主题\_config.yml文件增加，
```
#打赏
donate:
  enable: true
  text: Enjoy it? Donate me! 赞赏支持！
  wechat: 
  alipay: 
```
这部分暂时不需要，不再细写。

## 缺陷

- markdown中使用一号标题#的文章，无法显示在hexo生成的文章结构中
- markdown中标题前面最好空一行，否则在hexo生成的文章中容易排版发生错位和其他问题。
- 文章中超链接需要单独写在一行，否则文章中的超链接会包含多余字符。
- **不支持markdown表格。**

## TODO
- 读hexo主题相关文档细节，更好的自定义主题。

## 后记
后来把主题换了～

## 参考链接

- https://dustyposa.github.io/posts/e575718e/#%E6%9B%B4%E6%8D%A2%E4%B8%BB%E9%A2%98
- https://www.jianshu.com/p/33bc0a0a6e90
- https://juejin.im/post/5be145a86fb9a049d7472623
- https://cloud.tencent.com/developer/article/1440353
- https://juejin.im/post/5d728f506fb9a06aef090e47
- https://github.com/codefine/hexo-theme-mellow/issues/15
