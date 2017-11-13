import { extend, foreach, noop } from "../../func/util";
import { defineReactiveProperty, getFunctionName } from "../../func/private";
import ViewWatcher from "../ViewWatcher";
import mountVNode from "./mountVNode";
import ViewModel from "../ViewModel";
import attrExpr from "./directive/attrExpr";
import cache from "./directive/cache";
import _for from "./directive/for";
import _if from "./directive/if";
import model from "./directive/model";
import module from "./directive/module";
import on from "./directive/on";
import ref from "./directive/ref";
import textExpr from "./directive/textExpr";

/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://icejs.org/######
*/
export default function Tmpl ( vm, components, module ) {
    this.vm = vm;
    this.components = {};
    this.module = module;
    
    foreach ( components, comp => {
        this.components [ getFunctionName ( comp ) ] = comp;
    } );
}

extend ( Tmpl.prototype, {

    /**
        mount ( vnode: Object, mountModule: Boolean, scoped?: Object )
    
        Return Type:
        void
    
        Description:
        使用vm对象挂载并动态绑定数据到模板
    
        URL doc:
        http://icejs.org/######
    */
	mount ( vnode, mountModule, scoped ) {
        const compileHandlers = mountVNode ( vnode, this, mountModule );
            
        //////////////////////////////
        //////////////////////////////
        // 为相应模板元素挂载数据
        foreach ( compileHandlers.watchers, watcher => {
            new ViewWatcher ( watcher.handler, watcher.targetNode, watcher.expr, this, scoped );
        } );

        // 处理template元素
        foreach ( compileHandlers.templates, vnode => {
            vnode.templateNodes = vnode.children.concat ();
        } );
        
    	// 渲染组件
        this.module.components = this.module.components || [];
    	foreach ( compileHandlers.components, comp => {
        	const instance = new comp.Class ();
            this.module.components.push ( instance );
            
            instance.__init__ ( comp.vnode, this.module );
        } );
    },

    /**
        getViewModel ()
    
        Return Type:
        Object
    
        Description:
        获取当前挂载模块的vm
    
        URL doc:
        http://icejs.org/######
    */
    getViewModel () {
        return this.vm;
    },
	
    /**
        getComponent ()
    
        Return Type:
        Function
        对应的组件衍生类
    
        Description:
        获取当前挂载模块依赖的Component衍生类
    
        URL doc:
        http://icejs.org/######
    */
	getComponent ( name ) {
    	return this.components [ name ];
    }
} );

extend ( Tmpl, {
	
	// 指令前缀
    directivePrefix : ":",

    // 指令集
    directives : {
        attrExpr,
        cache,
        for : _for,
        if : _if,
        model,
        module,
        on,
        ref,
        textExpr
    },
	
	/**
    	defineScoped ( scopedDefinition: Object, scopedVNode: Object, isStatic: Object )
    
    	Return Type:
    	Object
    	局部变量操作对象
    
    	Description:
		定义模板局部变量
		此方法将生成局部变量操作对象，内含替身变量前缀
    	此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
    	在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
        局部变量vm将保存在当前挂载的vnode上，可直接修改此局部变量修改模板内容
    
    	URL doc:
    	http://icejs.org/######
    */
    defineScoped ( scopedDefinition, scopedVNode, isStatic ) {

		const
            scopedVars = {},
            scoped = {
            	prefix : "ICE_FOR_" + Date.now() + "_",
                scopedMounts : [],
                scopedUnmounts : [],
            },
            availableItems = [];

    	foreach ( scopedDefinition, ( val, varName ) => {
    		if ( varName ) {
    			scopedVars [ scoped.prefix + varName ] = val;

                // 两边添加”\b“表示边界，以防止有些单词中包含局部变量名而错误替换
            	availableItems.push ( "\\b" + varName + "\\b" );
    		}
    	} );

        if ( isStatic !== false ) {
            scopedVNode.scoped = new ViewModel ( scopedVars );
            foreach ( scopedVars, ( scopedVar, name ) => {

                // 构造局部变量代理变量
                scoped.scopedMounts.push ( vm => {
                    defineReactiveProperty ( name, () => {
                        return scopedVNode.scoped [ name ];
                    }, noop, vm );
                } );

                // 构造代理变量卸载函数
                scoped.scopedUnmounts.push ( vm => {
                    delete vm [ name ];
                } );
            } );
        }
        else {
            foreach ( scopedVars, ( scopedVar, name ) => {

                // 构造静态的局部变量
                scoped.scopedMounts.push ( vm => {
                    vm [ name ] = scopedVar;
                } );

                // 静态局部变量卸载函数
                scoped.scopedUnmounts.push ( vm => {
                    delete vm [ name ];
                } );
            } );
        }

        scoped.regexp = new RegExp ( availableItems.join ( "|" ), "g" );

    	return scoped;
    },
	
    /**
        defineDirective ( directive: Object )
    
        Return Type:
        void
    
        Description:
        定义指令
        指令对象必须包含”name“属性和”update“方法，”before“方法为可选项
    
        URL doc:
        http://icejs.org/######
    */
	defineDirective ( directive ) {
    	this.directives [ directive.name ] = directive;
    }
} );