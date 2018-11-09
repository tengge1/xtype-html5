# xtype-html5

xtype-html5将常用的html5标签封装为类，可以像ExtJs那样通过javascript动态生成页面。这对于功能特别多、逻辑特别复杂的页面特别有用。

**xtype-html5不保证兼容除最新版`Chrome`以外的其他浏览器。**

使用方法：

```javascript
var hello = XType.UI.create({
    xtype: 'div',
    html: 'Hello, world!'
});

hello.render();
```

其中，类型`div`是`div`标签的的xtype，属性`html`是`Control`控件的一个属性，它的值会被原生输出到页面上。

## 依赖项

无。

## 安装方法

```
npm install @tengge1/xtype-html5
```

## 核心函数

`Control`: 所有控件基类

`UI`：用于html5控件的创建和管理。

请阅读[xtype.js](https://github.com/tengge1/xtype.js)了解每个类的使用方法。

## 相关链接

* xtype.js: https://github.com/tengge1/xtype.js