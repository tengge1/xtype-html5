(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.XType = {})));
}(this, (function (exports) { 'use strict';

	var ID = -1;

	/**
	 * 所有控件基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Control(options = {}) {
	    this.parent = options.parent || document.body;
	    this._id = options.id || this.constructor.name + ID--;
	    this._scope = options.scope || 'global';

	    this.children = options.children || [];
	    this.html = options.html || null;

	    this.attr = options.attr || null; // 控件属性(setAttribute)
	    this.prop = options.prop || null; // 控件属性(使用等号赋值)
	    this.cls = options.cls || null; // class属性
	    this.style = options.style || null; // 控件样式
	    this.listeners = options.listeners || null; // 监听器
	    this.data = options.data || null; // 自定义数据

	    this.manager = null; // Manager.create时自动赋值
	}

	Object.defineProperties(Control.prototype, {
	    /**
	     * 控件id
	     */
	    id: {
	        get: function () {
	            return this._id;
	        },
	        set: function (id) {
	            console.warn(`Control: It is not allowed to assign new value to id.`);
	            this._id = id;
	        }
	    },

	    /**
	     * 命名空间
	     */
	    scope: {
	        get: function () {
	            return this._scope;
	        },
	        set: function (scope) {
	            console.warn(`Control: It is not allowed to assign new value to scope.`);
	            this._scope = scope;
	        }
	    }
	});

	/**
	 * 添加子控件
	 * @param {*} obj 
	 */
	Control.prototype.add = function (obj) {
	    this.children.push(obj);
	};

	/**
	 * 插入子控件
	 * @param {*} index 
	 * @param {*} obj 
	 */
	Control.prototype.insert = function (index, obj) {
	    this.children.splice(index, 0, obj);
	};

	/**
	 * 移除子控件
	 * @param {*} obj 
	 */
	Control.prototype.remove = function (obj) {
	    var index = this.children.indexOf(obj);
	    if (index > -1) {
	        this.children[index].manager = null;
	        this.children.splice(index, 1);
	    }
	};

	/**
	 * 渲染控件
	 */
	Control.prototype.render = function () {
	    this.children.forEach(n => {
	        var obj = this.manager.create(n);
	        obj.parent = this.parent;
	        obj.render();
	    });
	};

	/**
	 * 创建元素
	 * @param {*} tag 标签
	 */
	Control.prototype.createElement = function (tag) {
	    return document.createElement(tag);
	};

	/**
	 * 渲染dom，将dom添加到父dom并给dom赋值，然后循环渲染子dom
	 * @param {*} dom 
	 */
	Control.prototype.renderDom = function (dom) {
	    this.dom = dom;
	    this.parent.appendChild(this.dom);

	    // 属性，通过setAttribute给节点赋值
	    if (this.attr) {
	        Object.keys(this.attr).forEach(n => {
	            this.dom.setAttribute(n, this.attr[n]);
	        });
	    }

	    // 属性，直接赋值给dom
	    if (this.prop) {
	        Object.assign(this.dom, this.prop);
	    }

	    // class属性
	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    // 样式，赋值给dom.style
	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    // 监听器，赋值给dom
	    if (this.listeners) {
	        Object.keys(this.listeners).forEach(n => {
	            this.dom['on' + n] = this.listeners[n];
	        });
	    }

	    // 自定义数据，赋值给dom.data
	    if (this.data) {
	        this.dom.data = {};
	        Object.assign(this.dom.data, this.data);
	    }

	    // innerHTML属性
	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    }

	    // 渲染子节点
	    this.children.forEach(n => {
	        var control = this.manager.create(n);
	        control.parent = this.dom;
	        control.render();
	    });
	};

	/**
	 * 清空控件（可调用render函数重新渲染）
	 */
	Control.prototype.clear = function () {
	    (function remove(items) {
	        if (items == null || items.length === 0) {
	            return;
	        }

	        items.forEach(n => {
	            if (n.id) {
	                this.manager.remove(n.id, n.scope);
	            }
	            if (n.listeners) {
	                Object.keys(n.listeners).forEach(m => {
	                    if (n.dom) {
	                        n.dom['on' + m] = null;
	                    }
	                });
	            }
	            remove(n.children);
	        });
	    })(this.children);

	    this.children.length = 0;

	    if (this.dom) {
	        this.parent.removeChild(this.dom);

	        if (this.listeners) {
	            this.listeners.forEach(n => {
	                this.dom['on' + n] = null;
	            });
	        }

	        this.dom = null;
	    }
	};

	/**
	 * 摧毁控件
	 */
	Control.prototype.destroy = function () {
	    this.clear();
	    if (this.parent) {
	        this.parent = null;
	    }
	    if (this.id) {
	        this.manager.remove(this._id, this._scope);
	    }
	    this.manager = null;
	};

	const svgNS = 'http://www.w3.org/2000/svg';
	const xlinkNS = "http://www.w3.org/1999/xlink";

	/**
	 * SVG控件
	 * @param {*} options 选项
	 */
	function SvgControl(options = {}) {
	    Control.call(this, options);
	}

	SvgControl.prototype = Object.create(Control.prototype);
	SvgControl.prototype.constructor = SvgControl;

	SvgControl.prototype.createElement = function (tag) {
	    return document.createElementNS(svgNS, tag);
	};

	SvgControl.prototype.renderDom = function (dom) {
	    this.dom = dom;
	    this.parent.appendChild(this.dom);

	    if (this.attr) {
	        Object.keys(this.attr).forEach(n => {
	            if (n.startsWith('xlink')) {
	                this.dom.setAttributeNS(xlinkNS, n, this.attr[n]);
	            } else {
	                this.dom.setAttribute(n, this.attr[n]);
	            }
	        });
	    }

	    if (this.prop) {
	        Object.assign(this.dom, this.prop);
	    }

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.listeners) {
	        Object.keys(this.listeners).forEach(n => {
	            this.dom['on' + n] = this.listeners[n];
	        });
	    }

	    if (this.data) {
	        this.dom.data = {};
	        Object.assign(this.dom.data, this.data);
	    }

	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    }

	    this.children.forEach(n => {
	        var control = this.manager.create(n);
	        control.parent = this.dom;
	        control.render();
	    });
	};

	/**
	 * Manager类
	 * @author tengge / https://github.com/tengge1
	 */
	function Manager() {
	    this.xtypes = {};
	    this.objects = {};
	}

	/**
	 * 添加xtype
	 * @param {*} name xtype字符串
	 * @param {*} cls xtype对应类
	 */
	Manager.prototype.addXType = function (name, cls) {
	    if (this.xtypes[name] === undefined) {
	        this.xtypes[name] = cls;
	    } else {
	        console.warn(`Manager: xtype named ${name} has already been added.`);
	    }
	};

	/**
	 * 删除xtype
	 * @param {*} name xtype字符串
	 */
	Manager.prototype.removeXType = function (name) {
	    if (this.xtypes[name] !== undefined) {
	        delete this.xtypes[name];
	    } else {
	        console.warn(`Manager: xtype named ${name} is not defined.`);
	    }
	};

	/**
	 * 获取xtype
	 * @param {*} name xtype字符串
	 */
	Manager.prototype.getXType = function (name) {
	    if (this.xtypes[name] === undefined) {
	        console.warn(`Manager: xtype named ${name} is not defined.`);
	    }
	    return this.xtypes[name];
	};

	/**
	 * 添加一个对象到缓存
	 * @param {*} id 对象id
	 * @param {*} obj 对象
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.add = function (id, obj, scope = "global") {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] !== undefined) {
	        console.warn(`Manager: object named ${id} has already been added.`);
	    }

	    obj.manager = this;
	    this.objects[key] = obj;
	};

	/**
	 * 从缓存中移除一个对象
	 * @param {*} id 对象id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.remove = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] != undefined) {
	        this.objects[key].manager = null;
	        delete this.objects[key];
	    } else {
	        console.warn(`Manager: object named ${id} is not defined.`);
	    }
	};

	/**
	 * 从缓存中获取一个对象
	 * @param {*} id 控件id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	Manager.prototype.get = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    return this.objects[key];
	};

	/**
	 * 通过json配置创建Control实例，并自动将包含id的控件添加到缓存
	 * @param {*} config xtype配置
	 */
	Manager.prototype.create = function (config) {
	    if (config instanceof Control) { // config是Control实例

	        this.add(config.id, this, config.scope);
	        return config;
	    }

	    // config是json配置
	    if (config == null || config.xtype == null) {
	        console.warn('Manager: config is undefined.');
	    }

	    if (config.xtype === undefined) {
	        console.warn('Manager: config.xtype is undefined.');
	    }

	    var cls = this.xtypes[config.xtype];
	    if (cls == null) {
	        console.warn(`Manager: xtype named ${config.xtype} is undefined.`);
	    }

	    var control = new cls(config);

	    this.add(control.id, control, control.scope);

	    return control;
	};

	const UI = new Manager();

	/**
	 * HtmlDom
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function HtmlDom(options = {}) {
	    Control.call(this, options);
	}

	HtmlDom.prototype = Object.create(Control.prototype);
	HtmlDom.prototype.constructor = HtmlDom;

	HtmlDom.prototype.render = function () {
	    this.renderDom(this.createElement('html'));
	};

	UI.addXType('dom', HtmlDom);

	/**
	 * Link
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Link(options = {}) {
	    Control.call(this, options);
	}

	Link.prototype = Object.create(Control.prototype);
	Link.prototype.constructor = Link;

	Link.prototype.render = function () {
	    this.renderDom(this.createElement('link'));
	};

	UI.addXType('link', Link);

	/**
	 * Meta
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Meta(options = {}) {
	    Control.call(this, options);
	}

	Meta.prototype = Object.create(Control.prototype);
	Meta.prototype.constructor = Meta;

	Meta.prototype.render = function () {
	    this.renderDom(this.createElement('meta'));
	};

	UI.addXType('meta', Meta);

	/**
	 * Style
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Style(options = {}) {
	    Control.call(this, options);
	}

	Style.prototype = Object.create(Control.prototype);
	Style.prototype.constructor = Style;

	Style.prototype.render = function () {
	    this.renderDom(this.createElement('style'));
	};

	UI.addXType('style', Style);

	/**
	 * Title
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Title(options = {}) {
	    Control.call(this, options);
	}

	Title.prototype = Object.create(Control.prototype);
	Title.prototype.constructor = Title;

	Title.prototype.render = function () {
	    this.renderDom(this.createElement('title'));
	};

	UI.addXType('title', Title);

	/**
	 * Address
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Address(options = {}) {
	    Control.call(this, options);
	}

	Address.prototype = Object.create(Control.prototype);
	Address.prototype.constructor = Address;

	Address.prototype.render = function () {
	    this.renderDom(this.createElement('address'));
	};

	UI.addXType('address', Address);

	/**
	 * Article
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Article(options = {}) {
	    Control.call(this, options);
	}

	Article.prototype = Object.create(Control.prototype);
	Article.prototype.constructor = Article;

	Article.prototype.render = function () {
	    this.renderDom(this.createElement('article'));
	};

	UI.addXType('article', Article);

	/**
	 * Aside
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Aside(options = {}) {
	    Control.call(this, options);
	}

	Aside.prototype = Object.create(Control.prototype);
	Aside.prototype.constructor = Aside;

	Aside.prototype.render = function () {
	    this.renderDom(this.createElement('aside'));
	};

	UI.addXType('aside', Aside);

	/**
	 * Body
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Body(options = {}) {
	    Control.call(this, options);
	}

	Body.prototype = Object.create(Control.prototype);
	Body.prototype.constructor = Body;

	Body.prototype.render = function () {
	    this.renderDom(this.createElement('body'));
	};

	UI.addXType('body', Body);

	/**
	 * Footer
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Footer(options = {}) {
	    Control.call(this, options);
	}

	Footer.prototype = Object.create(Control.prototype);
	Footer.prototype.constructor = Footer;

	Footer.prototype.render = function () {
	    this.renderDom(this.createElement('footer'));
	};

	UI.addXType('footer', Footer);

	/**
	 * H1
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H1(options = {}) {
	    Control.call(this, options);
	}

	H1.prototype = Object.create(Control.prototype);
	H1.prototype.constructor = H1;

	H1.prototype.render = function () {
	    this.renderDom(this.createElement('h1'));
	};

	UI.addXType('h1', H1);

	/**
	 * H2
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H2(options = {}) {
	    Control.call(this, options);
	}

	H2.prototype = Object.create(Control.prototype);
	H2.prototype.constructor = H2;

	H2.prototype.render = function () {
	    this.renderDom(this.createElement('h2'));
	};

	UI.addXType('h2', H2);

	/**
	 * H3
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H3(options = {}) {
	    Control.call(this, options);
	}

	H3.prototype = Object.create(Control.prototype);
	H3.prototype.constructor = H3;

	H3.prototype.render = function () {
	    this.renderDom(this.createElement('h3'));
	};

	UI.addXType('h3', H3);

	/**
	 * H4
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H4(options = {}) {
	    Control.call(this, options);
	}

	H4.prototype = Object.create(Control.prototype);
	H4.prototype.constructor = H4;

	H4.prototype.render = function () {
	    this.renderDom(this.createElement('h4'));
	};

	UI.addXType('h4', H4);

	/**
	 * H5
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H5(options = {}) {
	    Control.call(this, options);
	}

	H5.prototype = Object.create(Control.prototype);
	H5.prototype.constructor = H5;

	H5.prototype.render = function () {
	    this.renderDom(this.createElement('h5'));
	};

	UI.addXType('h5', H5);

	/**
	 * H6
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function H6(options = {}) {
	    Control.call(this, options);
	}

	H6.prototype = Object.create(Control.prototype);
	H6.prototype.constructor = H6;

	H6.prototype.render = function () {
	    this.renderDom(this.createElement('h6'));
	};

	UI.addXType('h6', H6);

	/**
	 * Head
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Head(options = {}) {
	    Control.call(this, options);
	}

	Head.prototype = Object.create(Control.prototype);
	Head.prototype.constructor = Head;

	Head.prototype.render = function () {
	    this.renderDom(this.createElement('head'));
	};

	UI.addXType('head', Head);

	/**
	 * Header
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Header(options = {}) {
	    Control.call(this, options);
	}

	Header.prototype = Object.create(Control.prototype);
	Header.prototype.constructor = Header;

	Header.prototype.render = function () {
	    this.renderDom(this.createElement('header'));
	};

	UI.addXType('header', Header);

	/**
	 * Nav
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Nav(options = {}) {
	    Control.call(this, options);
	}

	Nav.prototype = Object.create(Control.prototype);
	Nav.prototype.constructor = Nav;

	Nav.prototype.render = function () {
	    this.renderDom(this.createElement('nav'));
	};

	UI.addXType('nav', Nav);

	/**
	 * Section
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Section(options = {}) {
	    Control.call(this, options);
	}

	Section.prototype = Object.create(Control.prototype);
	Section.prototype.constructor = Section;

	Section.prototype.render = function () {
	    this.renderDom(this.createElement('section'));
	};

	UI.addXType('section', Section);

	/**
	 * DD
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function DD(options = {}) {
	    Control.call(this, options);
	}

	DD.prototype = Object.create(Control.prototype);
	DD.prototype.constructor = DD;

	DD.prototype.render = function () {
	    this.renderDom(this.createElement('dd'));
	};

	UI.addXType('dd', DD);

	/**
	 * Div
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Div(options = {}) {
	    Control.call(this, options);
	}

	Div.prototype = Object.create(Control.prototype);
	Div.prototype.constructor = Div;

	Div.prototype.render = function () {
	    this.renderDom(this.createElement('div'));
	};

	UI.addXType('div', Div);

	/**
	 * DL
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function DL(options = {}) {
	    Control.call(this, options);
	}

	DL.prototype = Object.create(Control.prototype);
	DL.prototype.constructor = DL;

	DL.prototype.render = function () {
	    this.renderDom(this.createElement('dl'));
	};

	UI.addXType('dl', DL);

	/**
	 * DT
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function DT(options = {}) {
	    Control.call(this, options);
	}

	DT.prototype = Object.create(Control.prototype);
	DT.prototype.constructor = DT;

	DT.prototype.render = function () {
	    this.renderDom(this.createElement('dt'));
	};

	UI.addXType('dt', DT);

	/**
	 * HR
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function HR(options = {}) {
	    Control.call(this, options);
	}

	HR.prototype = Object.create(Control.prototype);
	HR.prototype.constructor = HR;

	HR.prototype.render = function () {
	    this.renderDom(this.createElement('hr'));
	};

	UI.addXType('hr', HR);

	/**
	 * Li
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Li(options = {}) {
	    Control.call(this, options);
	}

	Li.prototype = Object.create(Control.prototype);
	Li.prototype.constructor = Li;

	Li.prototype.render = function () {
	    this.renderDom(this.createElement('li'));
	};

	UI.addXType('li', Li);

	/**
	 * OL
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function OL(options = {}) {
	    Control.call(this, options);
	}

	OL.prototype = Object.create(Control.prototype);
	OL.prototype.constructor = OL;

	OL.prototype.render = function () {
	    this.renderDom(this.createElement('ol'));
	};

	UI.addXType('ol', OL);

	/**
	 * P
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function P(options = {}) {
	    Control.call(this, options);
	}

	P.prototype = Object.create(Control.prototype);
	P.prototype.constructor = P;

	P.prototype.render = function () {
	    this.renderDom(this.createElement('p'));
	};

	UI.addXType('p', P);

	/**
	 * Pre
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Pre(options = {}) {
	    Control.call(this, options);
	}

	Pre.prototype = Object.create(Control.prototype);
	Pre.prototype.constructor = Pre;

	Pre.prototype.render = function () {
	    this.renderDom(this.createElement('pre'));
	};

	UI.addXType('pre', Pre);

	/**
	 * UL
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function UL(options = {}) {
	    Control.call(this, options);
	}

	UL.prototype = Object.create(Control.prototype);
	UL.prototype.constructor = UL;

	UL.prototype.render = function () {
	    this.renderDom(this.createElement('ul'));
	};

	UI.addXType('ul', UL);

	/**
	 * A
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function A(options = {}) {
	    Control.call(this, options);
	}

	A.prototype = Object.create(Control.prototype);
	A.prototype.constructor = A;

	A.prototype.render = function () {
	    this.renderDom(this.createElement('a'));
	};

	UI.addXType('a', A);

	/**
	 * B
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function B(options = {}) {
	    Control.call(this, options);
	}

	B.prototype = Object.create(Control.prototype);
	B.prototype.constructor = B;

	B.prototype.render = function () {
	    this.renderDom(this.createElement('b'));
	};

	UI.addXType('b', B);

	/**
	 * Br
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Br(options = {}) {
	    Control.call(this, options);
	}

	Br.prototype = Object.create(Control.prototype);
	Br.prototype.constructor = Br;

	Br.prototype.render = function () {
	    this.renderDom(this.createElement('br'));
	};

	UI.addXType('br', Br);

	/**
	 * Code
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Code(options = {}) {
	    Control.call(this, options);
	}

	Code.prototype = Object.create(Control.prototype);
	Code.prototype.constructor = Code;

	Code.prototype.render = function () {
	    this.renderDom(this.createElement('code'));
	};

	UI.addXType('code', Code);

	/**
	 * I
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function I(options = {}) {
	    Control.call(this, options);
	}

	I.prototype = Object.create(Control.prototype);
	I.prototype.constructor = I;

	I.prototype.render = function () {
	    this.renderDom(this.createElement('i'));
	};

	UI.addXType('i', I);

	/**
	 * Small
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Small(options = {}) {
	    Control.call(this, options);
	}

	Small.prototype = Object.create(Control.prototype);
	Small.prototype.constructor = Small;

	Small.prototype.render = function () {
	    this.renderDom(this.createElement('small'));
	};

	UI.addXType('small', Small);

	/**
	 * Span
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Span(options = {}) {
	    Control.call(this, options);
	}

	Span.prototype = Object.create(Control.prototype);
	Span.prototype.constructor = Span;

	Span.prototype.render = function () {
	    this.renderDom(this.createElement('span'));
	};

	UI.addXType('span', Span);

	/**
	 * Strong
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Strong(options = {}) {
	    Control.call(this, options);
	}

	Strong.prototype = Object.create(Control.prototype);
	Strong.prototype.constructor = Strong;

	Strong.prototype.render = function () {
	    this.renderDom(this.createElement('strong'));
	};

	UI.addXType('strong', Strong);

	/**
	 * Audio
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Audio(options = {}) {
	    Control.call(this, options);
	}

	Audio.prototype = Object.create(Control.prototype);
	Audio.prototype.constructor = Audio;

	Audio.prototype.render = function () {
	    this.renderDom(this.createElement('audio'));
	};

	UI.addXType('audio', Audio);

	/**
	 * Img
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Img(options = {}) {
	    Control.call(this, options);
	}

	Img.prototype = Object.create(Control.prototype);
	Img.prototype.constructor = Img;

	Img.prototype.render = function () {
	    this.renderDom(this.createElement('img'));
	};

	UI.addXType('img', Img);

	/**
	 * Video
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Video(options = {}) {
	    Control.call(this, options);
	}

	Video.prototype = Object.create(Control.prototype);
	Video.prototype.constructor = Video;

	Video.prototype.render = function () {
	    this.renderDom(this.createElement('video'));
	};

	UI.addXType('video', Video);

	/**
	 * Embed
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Embed(options = {}) {
	    Control.call(this, options);
	}

	Embed.prototype = Object.create(Control.prototype);
	Embed.prototype.constructor = Embed;

	Embed.prototype.render = function () {
	    this.renderDom(this.createElement('embed'));
	};

	UI.addXType('embed', Embed);

	/**
	 * IFrame
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function IFrame(options = {}) {
	    Control.call(this, options);
	}

	IFrame.prototype = Object.create(Control.prototype);
	IFrame.prototype.constructor = IFrame;

	IFrame.prototype.render = function () {
	    this.renderDom(this.createElement('iframe'));
	};

	UI.addXType('iframe', IFrame);

	/**
	 * Source
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Source(options = {}) {
	    Control.call(this, options);
	}

	Source.prototype = Object.create(Control.prototype);
	Source.prototype.constructor = Source;

	Source.prototype.render = function () {
	    this.renderDom(this.createElement('source'));
	};

	UI.addXType('source', Source);

	/**
	 * Canvas
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Canvas(options = {}) {
	    Control.call(this, options);
	}

	Canvas.prototype = Object.create(Control.prototype);
	Canvas.prototype.constructor = Canvas;

	Canvas.prototype.render = function () {
	    this.renderDom(this.createElement('canvas'));
	};

	UI.addXType('canvas', Canvas);

	/**
	 * Script
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Script(options = {}) {
	    Control.call(this, options);
	}

	Script.prototype = Object.create(Control.prototype);
	Script.prototype.constructor = Script;

	Script.prototype.render = function () {
	    this.renderDom(this.createElement('script'));
	};

	UI.addXType('script', Script);

	/**
	 * Caption
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Caption(options = {}) {
	    Control.call(this, options);
	}

	Caption.prototype = Object.create(Control.prototype);
	Caption.prototype.constructor = Caption;

	Caption.prototype.render = function () {
	    this.renderDom(this.createElement('caption'));
	};

	UI.addXType('caption', Caption);

	/**
	 * Table
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Table(options = {}) {
	    Control.call(this, options);
	}

	Table.prototype = Object.create(Control.prototype);
	Table.prototype.constructor = Table;

	Table.prototype.render = function () {
	    this.renderDom(this.createElement('table'));
	};

	UI.addXType('table', Table);

	/**
	 * TBody
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TBody(options = {}) {
	    Control.call(this, options);
	}

	TBody.prototype = Object.create(Control.prototype);
	TBody.prototype.constructor = TBody;

	TBody.prototype.render = function () {
	    this.renderDom(this.createElement('tbody'));
	};

	UI.addXType('tbody', TBody);

	/**
	 * TD
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TD(options = {}) {
	    Control.call(this, options);
	}

	TD.prototype = Object.create(Control.prototype);
	TD.prototype.constructor = TD;

	TD.prototype.render = function () {
	    this.renderDom(this.createElement('td'));
	};

	UI.addXType('td', TD);

	/**
	 * TFoot
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TFoot(options = {}) {
	    Control.call(this, options);
	}

	TFoot.prototype = Object.create(Control.prototype);
	TFoot.prototype.constructor = TFoot;

	TFoot.prototype.render = function () {
	    this.renderDom(this.createElement('tfoot'));
	};

	UI.addXType('tfoot', TFoot);

	/**
	 * TH
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TH(options = {}) {
	    Control.call(this, options);
	}

	TH.prototype = Object.create(Control.prototype);
	TH.prototype.constructor = TH;

	TH.prototype.render = function () {
	    this.renderDom(this.createElement('th'));
	};

	UI.addXType('th', TH);

	/**
	 * THead
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function THead(options = {}) {
	    Control.call(this, options);
	}

	THead.prototype = Object.create(Control.prototype);
	THead.prototype.constructor = THead;

	THead.prototype.render = function () {
	    this.renderDom(this.createElement('thead'));
	};

	UI.addXType('thead', THead);

	/**
	 * TR
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TR(options = {}) {
	    Control.call(this, options);
	}

	TR.prototype = Object.create(Control.prototype);
	TR.prototype.constructor = TR;

	TR.prototype.render = function () {
	    this.renderDom(this.createElement('tr'));
	};

	UI.addXType('tr', TR);

	/**
	 * Button
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Button(options = {}) {
	    Control.call(this, options);
	}

	Button.prototype = Object.create(Control.prototype);
	Button.prototype.constructor = Button;

	Button.prototype.render = function () {
	    this.renderDom(this.createElement('button'));
	};

	UI.addXType('button', Button);

	/**
	 * DataList
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function DataList(options = {}) {
	    Control.call(this, options);
	}

	DataList.prototype = Object.create(Control.prototype);
	DataList.prototype.constructor = DataList;

	DataList.prototype.render = function () {
	    this.renderDom(this.createElement('datalist'));
	};

	UI.addXType('datalist', DataList);

	/**
	 * FieldSet
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function FieldSet(options = {}) {
	    Control.call(this, options);
	}

	FieldSet.prototype = Object.create(Control.prototype);
	FieldSet.prototype.constructor = FieldSet;

	FieldSet.prototype.render = function () {
	    this.renderDom(this.createElement('fieldset'));
	};

	UI.addXType('fieldset', FieldSet);

	/**
	 * Form
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Form(options = {}) {
	    Control.call(this, options);
	}

	Form.prototype = Object.create(Control.prototype);
	Form.prototype.constructor = Form;

	Form.prototype.render = function () {
	    this.renderDom(this.createElement('form'));
	};

	UI.addXType('form', Form);

	/**
	 * Input
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Input(options = {}) {
	    Control.call(this, options);
	}

	Input.prototype = Object.create(Control.prototype);
	Input.prototype.constructor = Input;

	Input.prototype.render = function () {
	    this.renderDom(this.createElement('input'));
	};

	UI.addXType('input', Input);

	/**
	 * Label
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Label(options = {}) {
	    Control.call(this, options);
	}

	Label.prototype = Object.create(Control.prototype);
	Label.prototype.constructor = Label;

	Label.prototype.render = function () {
	    this.renderDom(this.createElement('label'));
	};

	UI.addXType('label', Label);

	/**
	 * Legend
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Legend(options = {}) {
	    Control.call(this, options);
	}

	Legend.prototype = Object.create(Control.prototype);
	Legend.prototype.constructor = Legend;

	Legend.prototype.render = function () {
	    this.renderDom(this.createElement('legend'));
	};

	UI.addXType('legend', Legend);

	/**
	 * OptGroup
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function OptGroup(options = {}) {
	    Control.call(this, options);
	}

	OptGroup.prototype = Object.create(Control.prototype);
	OptGroup.prototype.constructor = OptGroup;

	OptGroup.prototype.render = function () {
	    this.renderDom(this.createElement('optgroup'));
	};

	UI.addXType('optgroup', OptGroup);

	/**
	 * Option
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Option(options = {}) {
	    Control.call(this, options);
	}

	Option.prototype = Object.create(Control.prototype);
	Option.prototype.constructor = Option;

	Option.prototype.render = function () {
	    this.renderDom(this.createElement('option'));
	};

	UI.addXType('option', Option);

	/**
	 * Progress
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Progress(options = {}) {
	    Control.call(this, options);
	}

	Progress.prototype = Object.create(Control.prototype);
	Progress.prototype.constructor = Progress;

	Progress.prototype.render = function () {
	    this.renderDom(this.createElement('progress'));
	};

	UI.addXType('progress', Progress);

	/**
	 * Select
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Select(options = {}) {
	    Control.call(this, options);
	}

	Select.prototype = Object.create(Control.prototype);
	Select.prototype.constructor = Select;

	Select.prototype.render = function () {
	    this.renderDom(this.createElement('select'));
	};

	UI.addXType('select', Select);

	/**
	 * TextArea
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextArea(options = {}) {
	    Control.call(this, options);
	}

	TextArea.prototype = Object.create(Control.prototype);
	TextArea.prototype.constructor = TextArea;

	TextArea.prototype.render = function () {
	    this.renderDom(this.createElement('textarea'));
	};

	UI.addXType('textarea', TextArea);

	// root

	exports.Control = Control;
	exports.UI = UI;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
