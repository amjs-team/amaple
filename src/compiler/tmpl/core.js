import { extend, foreach, noop } from "../../func/util";
import { defineReactiveProperty, getFunctionName } from "../../func/private";
import { rvar } from "../../var/const";
import ViewWatcher from "../../core/ViewWatcher";
import mountVNode from "./mountVNode";
import ViewModel from "../../core/ViewModel";


/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://amaple.org/######
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
        http://amaple.org/######
    */
    mount ( vnode, mountModule, scoped ) {
        if ( !this.moduleNode ) {
            this.moduleNode = vnode;
        }
        const compileHandlers = mountVNode ( vnode, this, mountModule );
            
        //////////////////////////////
        //////////////////////////////
        // 如果有model属性则需将此属性放到最后
        // 因为当前元素的value值为一个"{{ }}"时需先挂载value的表达式，这样在model处理时才能获取到正确的value值
        compileHandlers.watchers.sort ( ( a, b ) => {
            return a.handler.name === "model" ? 1 : 0;
        } );

        // 如果有局部状态数据则添加局部状态到state上
        this.addScoped ( scoped && scoped.scopedMounts );

        // 为相应模板元素挂载数据
        foreach ( compileHandlers.watchers, watcher => {
            new ViewWatcher ( watcher.handler, watcher.targetNode, watcher.expr, scoped, this );
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
            
            instance.__init__ ( comp.vnode, this, scoped );
        } );

        // 移除局部数据
        this.removeScoped ( scoped && scoped.scopedUnmounts );
    },
    
    /**
        getComponent ()
    
        Return Type:
        Function
        对应的组件衍生类
    
        Description:
        获取当前挂载模块依赖的Component衍生类
    
        URL doc:
        http://amaple.org/######
    */
    getComponent ( name ) {
        return this.components [ name ];
    },

    /**
        addScoped ()
    
        Return Type:
        Object
        void
    
        Description:
        为vm增加局部变量
    
        URL doc:
        http://amaple.org/######
    */
    addScoped ( scopedMounts ) {
        foreach ( scopedMounts || [], mountFunc => {
            mountFunc ( this.vm );
        } );
    },
    
    /**
        removeScoped ()
    
        Return Type:
        Object
        void
    
        Description:
        移除vm中的局部变量
    
        URL doc:
        http://amaple.org/######
    */
    removeScoped ( scopedUnmounts ) {
        foreach ( scopedUnmounts || [], unmountFunc => {
            unmountFunc ( this.vm );
        } );
    }
} );

extend ( Tmpl, {
    
    /**
        defineScoped ( scopedDefinition: Object, scopedVNode: Object, indexName: String )
    
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
        http://amaple.org/######
    */
    defineScoped ( scopedDefinition, scopedVNode, indexName ) {

        const 
            /** @type {String} 范围变量前缀，为避免重复而定义得比较复杂 */
            scopedPrefix = "$$__AMAPLE_SCOPED_VARIABLE__$$__",
            scoped = {
                prefix : `${ scopedPrefix }${ Date.now () }_`,
                scopedMounts : [],
                scopedUnmounts : [],
            },
            availableItems = [];

        foreach ( scopedDefinition, ( val, varName ) => {
            const 
                rscopedVar = "\\b" + varName + "\\b",
                scopedVarName = scoped.prefix + varName;
            if ( varName === indexName ) {
                scoped.indexName = new RegExp ( rscopedVar );
                const obj = {};
                obj [ scopedVarName ] = val;
                scopedVNode.scoped = new ViewModel ( obj );

                // 构造局部变量代理变量
                scoped.scopedMounts.push ( vm => {
                    defineReactiveProperty ( scopedVarName, () => {
                        return scopedVNode.scoped [ scopedVarName ];
                    }, noop, vm );
                } );
            }
            else {

                // 构造静态的局部变量
                scoped.scopedMounts.push ( vm => {
                    vm [ scopedVarName ] = val;
                } );
            }

            // 构造局部变量卸载函数
            scoped.scopedUnmounts.push ( vm => {
                delete vm [ scopedVarName ];
            } );

            // 两边添加”\b“表示边界，以防止有些单词中包含局部变量名而错误替换
            availableItems.push ( rscopedVar );
        } );
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
        http://amaple.org/######
    */
    defineDirective ( directive ) {
        this.directives [ directive.name ] = directive;
    }
} );