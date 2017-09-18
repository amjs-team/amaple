import slice from "../../var/slice";
import { extend, foreach, type } from "../../func/util";
import { attr } from "../../func/node";
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
        elem = this.renderComponent ( elem );

        elem.conditions = [ condition ];
        elem.conditionElems = [ elem ];
        parent = elem.parentNode;
        while ( nextSib = elem.nextElementSibling ) {
            if ( condition = attr ( nextSib, _elseif ) ) {
                nextSib = this.renderComponent ( nextSib );
                elem.conditions.push ( condition );
                elem.conditionElems.push ( nextSib );
                attr ( nextSib, _elseif, null );
                parent.removeChild ( nextSib );
            }
            else if ( nextSib.hasAttribute ( _else ) ) {
                nextSib = this.renderComponent ( nextSib );
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
            nextSib.templateNodes = slice.call ( nextSib.content.childNodes );
        }
    } );
    
    return elem;
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
    	this.components [ comp.name.toLowerCase () ] = comp;
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
            watcherData = [];
        
        do {
            if ( elem.nodeType === 1 && mountModule ) {
        		
                
                // 处理:for
                // 处理:if :else-if :else
                // 处理{{ expression }}
                // 处理:on
                // 处理:model
                elem = preTreat.call ( this, elem );
                if ( forAttrValue = attr ( elem, Tmpl.directivePrefix + "for" ) ) {
                    watcherData.push ( { handler : Tmpl.directives.for, targetNode : elem, expr : forAttrValue } );
                }
                else {
                	
                    // 如果不是渲染后的组件元素，即表示该组件元素没有"if"和"for"指令
                    if ( !elem.isComponent ) {
                        // elem = this.renderComponent ( elem );
                        // elem.canRender = true;
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

                            watcherData.push ( { handler, targetNode, expr } );
                        }
                        else if ( rexpr.test ( attr.nodeValue ) ) {

                            // 属性值表达式绑定
                            watcherData.push ( { handler: Tmpl.directives.expr, targetNode : attr, expr : attr.nodeValue } );
                        }
                    } );
                }
            }
            else if ( elem.nodeType === 3 ) {

                // 文本节点表达式绑定
                if ( rexpr.test ( elem.nodeValue ) ) {
                    watcherData.push ( { handler : Tmpl.directives.expr, targetNode : elem, expr : elem.nodeValue } );
                }
            }
            
            if ( elem.isComponent ) {
                if ( elem.canRender ) {
                    Component.render ( elem );
                }
            }
            else {
                firstChild = elem.firstChild || elem.content && elem.content.firstChild;
                if ( firstChild && !forAttrValue ) {
                    watcherData = watcherData.concat ( this.mount ( firstChild, true, scoped, false ) );
                }
            }
        } while ( !isRoot && ( elem = elem.nextSibling ) )

        if ( !isRoot ) {
            return watcherData;
        }
        else {
            //////////////////////////////
            //////////////////////////////
            //////////////////////////////
            foreach ( watcherData, data => {
                new ViewWatcher ( data.handler, data.targetNode, data.expr, this, scoped );
            } );
        }
    },

    getViewModel () {
        return this.vm;
    },
	
	getComponent ( name ) {
    	return this.components [ name ];
    },

    /**
        renderComponent ( elem: DOMObject )
    
        Return Type:
        elem
        原组件或渲染后的组件
    
        Description:
        渲染组件元素为真实元素结构，如果不是组件元素则返回原来的元素
    
        URL doc:
        http://icejs.org/######
    */
    renderComponent ( elem ) {

        // 处理组件元素
        // 局部没有找到组件则查找全局组件
        const ComponentDerivative = this.getComponent ( elem.nodeName ) || Component.getGlobal ( elem.nodeName );
        if ( ComponentDerivative && ComponentDerivative.__proto__.name === "Component" ) {
            const comp = new ComponentDerivative ();
            this.compInstances.push ( comp );
           
            elem = comp.__init__ ( elem, this.getViewModel () );
        }

        return elem;
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
	
	defineDirective ( name, directive ) {
        this.directives = this.directives || {};
    	this.directives [ name ] = directive;
    }
} );