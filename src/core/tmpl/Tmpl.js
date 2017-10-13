import slice from "../../var/slice";
import { extend, foreach, type } from "../../func/util";
import { attr } from "../../func/node";
import { transformCompName } from "../../func/private";
import { rexpr } from "../../var/const";
import iceAttr from "../../single/iceAttr";
import Subscriber from "../Subscriber";
import ViewWatcher from "../ViewWatcher";
import { runtimeErr } from "../../error";
import Structure from "./Structure";
import Component from "../component/core";
import VNode from "../vnode/VNode";

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

    let nextSib, parent;
    const condition = vnode.attr ( _if );

    if ( condition && !vnode.conditionElems ) {
        vnode.conditions = [ condition ];
        vnode.conditionElems = [ vnode ];
        parent = elem.parent;
        while ( nextSib = elem.nextSibling () ) {
            if ( condition = nextSib.attr ( _elseif ) ) {
                vnode.conditions.push ( condition );
                vnode.conditionElems.push ( nextSib );
                nextSib.attr ( _elseif, null );
                parent.removeChild ( nextSib );
            }
            else if ( nextSib.attr ( _else ) ) {
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

    foreach ( vnode.conditionElems || [], nextSib => {
        if ( nextSib.nodeName === "TEMPLATE" ) {
            nextSib.templateNodes = nextSib.children;
        }
    } );
    
    return vnode;
}

function concatHandler ( target, source ) {
	const concats = {};
	
	concats.watchers = target.watchers.concat ( source.watchers );
	concats.components = target.components.concat ( source.components );

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
export default function Tmpl ( module, components ) {
	this.module = module;
    this.components = {};
    
    foreach ( components, comp => {
        this.components [ comp.name ] = comp;
    } );
}

extend ( Tmpl.prototype, {

    /**
        mount ( vnode: Object, mountModule: Boolean, isRoot?: Boolean, scoped?: Object )
    
        Return Type:
        void
    
        Description:
        使用vm对象挂载并动态绑定数据到模板
    
        URL doc:
        http://icejs.org/######
    */
	mount ( vnode, mountModule, scoped, isRoot = true ) {
        const 
            rattr = /^:([\$\w]+)$/;


        let directive, handler, targetNode, expr, forAttrValue, firstChild,
            compileHandlers = {
            	watchers : [],
            	components : []
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
                	
                	// 收集组件元素待渲染
        			// 局部没有找到组件则查找全局组件
        			const 
                    	componentName = transformCompName ( vnode.nodeName ),
                    	ComponentDerivative = this.getComponent ( componentName ) || Component.getGlobal ( componentName );
        			if ( ComponentDerivative && ComponentDerivative.__proto__.name === "Component" ) {
                    	compileHandlers.components.push ( { vnode, Class : ComponentDerivative } );
                    	
                    	vnode.isComponent = true;
        			}
                    
                    // 将子模块元素保存到页面结构体中以便下次直接获取使用
                    const moduleName = vnode.attr ( iceAttr.module );
                    if ( Structure.currentPage && type ( moduleName ) === "string" ) {
                        const currentStructure = Structure.currentPage.getCurrentRender ();
                        currentStructure.saveSubModuleNode ( vnode );
                    }
                    
                    foreach ( vnode.attrs, ( attr, name, attrs ) => {
                        directive = rattr.exec ( name );
                        if ( directive ) {
                            directive = directive [ 1 ];
                            if ( /^on/.test ( directive ) ) {

                                // 事件绑定
                                handler = Tmpl.directives.on;
                                targetNode = vnode,
                                expr = ` ${ directive.slice ( 2 ) }:${ attr }`;
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
                            compileHandlers.watchers.push ( { handler: Tmpl.directives.attrExpr, targetNode : attrs, expr : `${ name }:${ attr }` } );
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
        
        	// 渲染组件
            this.module.components = this.module.components || [];
        	foreach ( compileHandlers.components, comp => {
            	const instance = new comp.Class ();
                this.module.components.push ( instance );
           
                instance.__init__ ( comp.vnode, this.getViewModel () );
            } );
        }
    },

    getViewModel () {
        return this.module.state;
    },
	
	getComponent ( name ) {
    	return this.components [ name ];
    }
} );

extend ( Tmpl, {

    directivePrefix : ":",
      
    renderTemplate ( elem ) {
		if ( elem && elem.nodeName && elem.nodeName.toUpperCase () === "TEMPLATE" ) {
        	const f = document.createDocumentFragment ();
        	foreach ( elem.content && elem.content.childNodes || elem.childNodes, childNode => {
            	f.appendChild ( childNode );
    		} );
        	
        	elem = f;
    	}
    
    	return elem;
    },
	
	/**
    	defineScoped ( scopedDefinition: Object )
    
    	Return Type:
    	Object
    	局部变量操作对象
    
    	Description:
		定义模板局部变量
		此方法将生成局部变量操作对象，内含替身变量前缀
    	此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
    	在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
    
    	URL doc:
    	http://icejs.org/######
    */
    defineScoped ( scopedDefinition ) {
		const scoped = {
            	prefix : "ICE_FOR_" + Date.now() + "_",
        		vars : {}
            },
            availableItems = [];

    	foreach ( scopedDefinition, ( val, varName ) => {
    		if ( varName ) {
    			scoped.vars [ scoped.prefix + varName ] = val;

                // 两边添加”\b“表示边界，以防止有些单词中包含局部变量名而错误替换
            	availableItems.push ( "\\b" + varName + "\\b" );
    		}
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
        http://icejs.org/######
    */
	defineDirective ( directive ) {
        this.directives = this.directives || {};
    	this.directives [ directive.name ] = directive;
    }
} );