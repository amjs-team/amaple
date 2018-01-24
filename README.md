# ![](https://raw.githubusercontent.com/amjs-team/amaple.org/master/logo.png)

# Amaple · 体验优先的Javascript单页框架

[![Build Status](https://travis-ci.org/amjs-team/amaple.svg?branch=master)](https://travis-ci.org/amjs-team/amaple)
[![Coverage Status](https://coveralls.io/repos/github/amjs-team/amaple/badge.svg?branch=master)](https://coveralls.io/github/amjs-team/amaple?branch=master)
[![Build Status](https://saucelabs.com/buildstatus/icejs_team)](https://saucelabs.com/beta/builds/0afdd39846aa4eb49d060fccb8de2406)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/amjs-team/amaple/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/amaple.svg)](https://www.npmjs.com/package/amaple)
[![Package Control](https://img.shields.io/packagecontrol/dw/GitGutter.svg)](https://www.npmjs.com/package/amaple)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**Amaple** 是专为单页web应用而设计的基于页面模块化的JavaScript框架，它可使开发者快速开发单页web应用。Amaple其实由 **“A maple”(一片枫叶)** 组合而成，它就像Web前端大森林中的一片枝叶，在享受这片森林呵护的同时也为森林增添一丝色彩，因此，Amaple选择了拥抱这片大森林，它的插件功能除了可使用自身规范的插件外，还支持所有[ **AMD**(点击了解详情)](https://github.com/amdjs/amdjs-api/wiki/AMD-%28%E4%B8%AD%E6%96%87%E7%89%88%29)和[ **IIFE**(点击了解详情)](https://segmentfault.com/a/1190000003985390)规范的第三方js库，在`rollup`、`webpack`、`browserify`等模块打包工具流行的今天，这也意味着`lodash`、`socket.io`等几乎所有的第三方js库都可以与Amaple协同运作，同时也支持旧式的IIFE格式js库。此外，Amaple还拥有 **高级虚拟DOM功能、模块化、MVVM及原生Web化设计** 等特性，即使初级前端开发也能顺利掌握和使用，这也充分体现了Amaple **“体验优先”** 的设计理念。



## 浏览器兼容性

|   IE    | Chrome  | Firefox | Safari | Andriod | IOS  |
| :-----: | :-----: | :-----: | :----: | :-----: | :--: |
| v 9.0 ~ | v 26.0~ | v 7.0~  | v 8.0~ |   ALL   | ALL  |



## Amaple特性简介

- 【**开放式插件**】支持所有AMD和IIFE规范的第三方js库作为Amaple的插件。
- 【**高级虚拟DOM**】与其他带有虚拟DOM功能的js库相比，Amaple实现了性能更好的虚拟DOM，它不再需要开发者提供可识别的key标志，也能自动判断可复用的DOM元素，并在重新排序的过程中自动计算出最少的移动步骤进行移动。
- 【**模块化**】
    - 【**页面模块化**】单页Web应用的特点之一是将页面划分为多个模块，URL跳转时更新模块的内容。在Amaple中存在 **模块(Module)** 和 **组件(Component)** 两种模块化单位，模块是单页Web应用更新的最小单位，它管控URL跳转时的内容替换、参数更新等一系列变化，而且允许开发者定义任意层级的任意多个模块及子模块；而组件的定位是拥有特定功能的封装块，它有自己的独立视图、状态数据和组件行为。与其他单页库相比，它们的职责更清晰，也易于理解。
    - 【**编写模块化**】Amaple内嵌了代码模块化功能，它允许将模块文件、组件文件和插件文件单独编写并分类保存，这让不熟悉`nodejs`构建工具的开发者也能编写模块化的js代码，当然对于熟悉`nodejs`构建工具的中高端开发者，你也完全可以使用`webpack`、`babel`、`scss/less`等工具辅助开发。
- 【**MVVM**】Amaple提供了更简洁的动态模板引擎，使开发者更加专注于对数据的处理。
- 【**原生Web化设计**】Amaple沿用了许多原生Web开发的标准，这样可以最大化符合具有一定基础的开发者的认知范围，如Amaple依旧使用`onclick`属性绑定点击事件，使用`href`属性进行跳转页面，使用`<form>`设置`action`属性提交表单，只是它们是浏览器无刷新的跳转，甚至可以创建像**ShadowDOM **那样的组件，在组件内使用特定子元素，看起来就像`<video>`和`<source>`、`<select>`和`<option>`的关系一样。



## Amaple使用前置要求

此框架的使用者可不需了解nodejs构建工具，但必须已掌握html、js和css的基础知识。



## 开发模式介绍

### \# 普通开发模式

普通开发模式适合对Nodejs构建工具不熟悉的初级开发者使用，Amaple自身的代码模块化管理将会使你摆脱代码缠绕的困扰。此外，Web单页应用需使用 **http** 协议进行模块的请求与跳转，为解决这个问题，我们特地提供了可快速启动一个本地Web服务器的，具有一定文件结构的Amaple开发包，开发者只需下载并按以下操作即可完成启动。

- [ 1 ]. 本地Web服务器依赖 **Nodejs** ，如没有安装请[**【点此下载Nodejs】**](http://nodejs.cn/download/)并安装。
- [ 2 ]. 下载Amaple开发包[**【点此下载Amaple开发包】**](https://github.com/amjs-team/amaple-dev-pkg/archive/1.3.1.zip)。
- [ 3 ]. 解压并进入到开发包中，直接执行启动程序即可自动启动本地Web服务器（windows系统运行 **start_win.bat** ，macOS系统运行 **start_macOS** ，程序会自动安装所需依赖包并启动一个本地Web服务器）。
- [ 4 ]. 此时就可以在开发包的`src`目录下进行开发，将对应类型的代码文件保存到对应文件夹。
> 此后每次启动本地Web服务器时，只需执行第[ 2 ]步描述的程序即可。等到开发完成后直接将`src`目录下的代码拷贝到生产环境即可。



### \# Nodejs构建开发模式

对于熟悉Nodejs构建工具的中高端开发者，可使用npm安装Amaple。

```bash
npm install amaple --save
```


## 准备好了吗？请看Amaple教程：
- [**【Amaple教程】1. 启动路由**](https://segmentfault.com/a/1190000012966350)
- [【Amaple教程】2. 模块](https://segmentfault.com/a/1190000012966430)
- [【Amaple教程】3. 模板指令与状态数据（state）](https://segmentfault.com/a/1190000012966497)
- [【Amaple教程】4. 组件](https://segmentfault.com/a/1190000012966552)
- [【Amaple教程】5. 插件](https://segmentfault.com/a/1190000012966591)
- [【Amaple教程】6. 路由配置](https://segmentfault.com/a/1190000012966646)



## Amaple技术交流
- 提交一个issue
- Amaple官方QQ群：674036951
- Email：jou@amaple.org
