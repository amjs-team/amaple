import slice from "../../var/slice";
import { extend, foreach, type, noop } from "../../func/util";
import { attr } from "../../func/node";
import { transformCompName, defineReactiveProperty } from "../../func/private";
import { rexpr } from "../../var/const";
import iceAttr from "../../single/iceAttr";
import Subscriber from "../Subscriber";
import ViewWatcher from "../ViewWatcher";
import { runtimeErr } from "../../error";
import Structure from "./Structure";
import Component from "../component/core";
import VNode from "../vnode/VNode";
import ViewModel from "../ViewModel";

/**
    preTreat ( vnode: Object )

    Return Type:
    Object
    处理后的元素对象

    Description:
    元素预处理
    主要对“:if”、“:for”两个指令的特殊处理

    URL doc:
    http://icejs.org/######
*/
function preTreat ( vnode ) {

    const
        _if = Tmpl.directivePrefix + "if",
        _elseif = Tmpl.directivePrefix + "else-if",
        _else = Tmpl.directivePrefix + "else";

    let nextSib, parent, 
        condition = vnode.attr ( _if );

    if ( condition && !vnode.conditionElems ) {
        const conditionElems = [ vnode ];

        vnode.conditions = [ condition ];
        vnode.conditionElems = conditionElems;
        parent = vnode.parent;
        while ( nextSib = vnode.nextSibling () ) {
            if ( condition = nextSib.attr ( _elseif ) ) {
                nextSib.conditionElems = conditionElems;
                vnode.conditions.push ( condition );
                vnode.conditionElems.push ( nextSib );
                nextSib.attr ( _elseif, null );
                parent.removeChild ( nextSib );
            }
            else if ( nextSib.attrs.hasOwnProperty ( _else ) ) {
                nextSib.conditionElems = conditionElems;
                vnode.conditions.push ( "true" );
                vnode.conditionElems.push ( nextSib );
                nextSib.attr ( _else, null );
                parent.removeChild ( nextSib );
                break;
            }
            else {
                break;
            }
        }
    }
    
    return vnode;
}

function concatHandler ( target, source ) {
	const concats = {};
	
	concats.watchers = target.watchers.concat ( source.watchers );
	concats.components = target.components.concat ( source.components );
    concats.templates = target.templates.concat ( source.templates );

	return concats;
}

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
        this.components [ comp.name ] = comp;
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
        const 
            isRoot = !vnode.parent,
            rattr = /^:([\$\w]+)$/;


        let directive, handler, targetNode, expr, forAttrValue, firstChild,
            compileHandlers = {
            	watchers : [],
            	components : [],
                templates : []
            };
        
        do {
            if ( vnode.nodeType === 1 && mountModule ) {
        		
                
                // 处理:for
                // 处理:if :else-if :else
                // 处理{{ expression }}
                // 处理:on
                // 处理:model
                vnode = preTreat.call ( this, vnode );
                if ( forAttrValue = vnode.attr ( Tmpl.directivePrefix + "for" ) ) {
                    compileHandlers.watchers.push ( { handler : Tmpl.directives.for, targetNode : vnode, expr : forAttrValue } );
                }
                else {
                	
                    if ( vnode.nodeName === "TEMPLATE" ) {
                        compileHandlers.templates.push ( vnode );
                    }
                    else {

                    	// 收集组件元素待渲染
            			// 局部没有找到组件则查找全局组件
            			const 
                        	componentName = transformCompName ( vnode.nodeName ),
                        	ComponentDerivative = this.getComponent ( componentName ) || Component.getGlobal ( componentName );
            			if ( ComponentDerivative && ComponentDerivative.__proto__.name === "Component" ) {
                        	compileHandlers.components.push ( { vnode, Class : ComponentDerivative } );
                        	
                        	vnode.isComponent = true;
            			}
                    }
                    
                    foreach ( vnode.attrs, ( attr, name ) => {
                        directive = rattr.exec ( name );
                        if ( directive ) {
                            directive = directive [ 1 ];
                            if ( /^on/.test ( directive ) ) {

                                // 事件绑定
                                handler = Tmpl.directives.on;
                                targetNode = vnode,
                                expr = `${ directive.slice ( 2 ) }:${ attr }`;
                            }
                            else if ( Tmpl.directives [ directive ] ) {

                                // 模板属性绑定
                                handler = Tmpl.directives [ directive ];
                                targetNode = vnode;
                                expr = attr;
                            }
                            else {

                                // 没有找到该指令
                                throw runtimeErr ( "directive", "没有找到\"" + directive + "\"指令或表达式" );
                            }

                            compileHandlers.watchers.push ( { handler, targetNode, expr } );
                        }
                        else if ( rexpr.test ( attr ) ) {

                            // 属性值表达式绑定
                            compileHandlers.watchers.push ( { handler: Tmpl.directives.attrExpr, targetNode : vnode, expr : `${ name }:${ attr }` } );
                        }
                    } );
                }
            }
            else if ( vnode.nodeType === 3 ) {

                // 文本节点表达式绑定
                if ( rexpr.test ( vnode.nodeValue ) ) {
                    compileHandlers.watchers.push ( { handler : Tmpl.directives.textExpr, targetNode : vnode, expr : vnode.nodeValue } );
                }
            }
            
            
            firstChild = vnode.children && vnode.children [ 0 ];
            if ( firstChild && !forAttrValue ) {
                compileHandlers = concatHandler ( compileHandlers, this.mount ( firstChild, true, scoped, false ) );
            }
        } while ( !isRoot && ( vnode = vnode.nextSibling () ) )

        if ( !isRoot ) {
            return compileHandlers;
        }
        else {
            
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
        }
    },

    getViewModel () {
        return this.vm;
    },
	
	getComponent ( name ) {
    	return this.components [ name ];
    }
} );

extend ( Tmpl, {
	
	// 指令前缀
    directivePrefix : ":",
	
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
        this.directives = this.directives || {};
    	this.directives [ directive.name ] = directive;
    }
} );