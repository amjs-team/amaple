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

/**
    preTreat ( elem: DOMObject )

    Return Type:
    Object
    处理后的元素对象

    Description:
    元素预处理
    主要对“:if”、“:for”两个指令的特殊处理

    URL doc:
    http://icejs.org/######
*/
function preTreat ( elem ) {

    const
        _if = Tmpl.directivePrefix + "if",
        _elseif = Tmpl.directivePrefix + "else-if",
        _else = Tmpl.directivePrefix + "else";

    let nextSib, parent, 
        condition = attr ( elem, _if );

    if ( condition && !elem.conditionElems ) {
        elem.conditions = [ condition ];
        elem.conditionElems = [ elem ];
        parent = elem.parentNode;
        while ( nextSib = elem.nextElementSibling ) {
            if ( condition = attr ( nextSib, _elseif ) ) {
                elem.conditions.push ( condition );
                elem.conditionElems.push ( nextSib );
                attr ( nextSib, _elseif, null );
                parent.removeChild ( nextSib );
            }
            else if ( nextSib.hasAttribute ( _else ) ) {
                elem.conditions.push ( "true" );
                elem.conditionElems.push ( nextSib );
                attr ( nextSib, _else, null );
                parent.removeChild ( nextSib );
                break;
            }
            else {
                break;
            }
        }
    }

    foreach ( elem.conditionElems || [], nextSib => {
        if ( nextSib.nodeName.toUpperCase () === "TEMPLATE" ) {
            nextSib.templateNodes = slice.call ( nextSib.content.childNodes || nextSib.childNodes );
        }
    } );
    
    return elem;
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
export default function Tmpl ( vm, components ) {
	this.vm = vm;
	this.components = {};
	
	foreach ( components, comp => {
    	this.components [ comp.name ] = comp;
    } );
}

extend ( Tmpl.prototype, {

    /**
        mount ( tmplNode: DOMObject, mountModule: Boolean, isRoot?: Boolean, scoped?: Object )
    
        Return Type:
        void
    
        Description:
        使用vm对象挂载并动态绑定数据到模板
    
        URL doc:
        http://icejs.org/######
    */
	mount ( elem, mountModule, scoped, isRoot = true ) {
        const 
            rattr = /^:([\$\w]+)$/;


        let directive, handler, targetNode, expr, forAttrValue, firstChild,
            compileHandlers = {
            	watchers : [],
            	components : []
            };
        
        do {
            if ( elem.nodeType === 1 && mountModule ) {
        		
                
                // 处理:for
                // 处理:if :else-if :else
                // 处理{{ expression }}
                // 处理:on
                // 处理:model
                elem = preTreat.call ( this, elem );
                if ( forAttrValue = attr ( elem, Tmpl.directivePrefix + "for" ) ) {
                    compileHandlers.watchers.push ( { handler : Tmpl.directives.for, targetNode : elem, expr : forAttrValue } );
                }
                else {
                	
                	// 收集组件元素待渲染
        			// 局部没有找到组件则查找全局组件
        			const 
                    	componentName = transformCompName ( elem.nodeName ),
                    	ComponentDerivative = this.getComponent ( componentName ) || Component.getGlobal ( componentName );
        			if ( ComponentDerivative && ComponentDerivative.__proto__.name === "Component" ) {
                    	compileHandlers.components.push ( { elem, Class : ComponentDerivative } );
        			}
                    
                    // 将子模块元素保存到页面结构体中以便下次直接获取使用
                    const moduleName = attr ( elem, iceAttr.module );
                    if ( Structure.currentPage && type ( moduleName ) === "string" ) {
                        const currentStructure = Structure.currentPage.getCurrentRender ();
                        currentStructure.saveSubModuleNode ( elem );
                    }
                    
                    foreach ( slice.call ( elem.attributes ), attr => {
                        directive = rattr.exec ( attr.nodeName );
                        if ( directive ) {
                            directive = directive [ 1 ];
                            if ( /^on/.test ( directive ) ) {
                                // 事件绑定
                                handler = Tmpl.directives.on;
                                targetNode = elem,
                                expr = directive.slice ( 2 ) + ":" + attr.nodeValue;
                            }
                            else if ( Tmpl.directives [ directive ] ) {

                                // 模板属性绑定
                                handler = Tmpl.directives [ directive ];
                                targetNode = elem;
                                expr = attr.nodeValue;
                            }
                            else {

                                // 没有找到该指令
                                throw runtimeErr ( "directive", "没有找到\"" + directive + "\"指令或表达式" );
                            }

                            compileHandlers.watchers.push ( { handler, targetNode, expr } );
                        }
                        else if ( rexpr.test ( attr.nodeValue ) ) {

                            // 属性值表达式绑定
                            compileHandlers.watchers.push ( { handler: Tmpl.directives.expr, targetNode : attr, expr : attr.nodeValue } );
                        }
                    } );
                }
            }
            else if ( elem.nodeType === 3 ) {

                // 文本节点表达式绑定
                if ( rexpr.test ( elem.nodeValue ) ) {
                    compileHandlers.watchers.push ( { handler : Tmpl.directives.expr, targetNode : elem, expr : elem.nodeValue } );
                }
            }
            
            
            firstChild = elem.firstChild || elem.content && elem.content.firstChild;
            if ( firstChild && !forAttrValue ) {
                compileHandlers = concatHandler ( compileHandlers, this.mount ( firstChild, true, scoped, false ) );
            }
        } while ( !isRoot && ( elem = elem.nextSibling ) )

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
            this.compInstances = this.compInstances || [];
        	foreach ( compileHandlers.components, comp => {
            	const instance = new comp.Class ();
                this.compInstances.push ( instance );
           
                instance.__init__ ( comp.elem, this.getViewModel () );
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
            	availableItems.push ( varName );
    		}
    	} );

    	scoped.regexp = new RegExp ( availableItems.join ( "|" ), "g" );

    	return scoped;
    },
	
	defineDirective ( name, directive ) {
        this.directives = this.directives || {};
    	this.directives [ name ] = directive;
    }
} );