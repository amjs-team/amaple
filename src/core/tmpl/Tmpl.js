import slice from "../../var/slice";
import { extend, foreach } from "../../func/util";
import { attr } from "../../func/node";
import single from "../../single/core";
import elementDriver from "../driver/elementDriver";
import Subscriber from "../Subscriber";
import ViewWatcher from "../ViewWatcher";
import directiveIf from "./directive/if";
import directiveFor from "./directive/for";
import directiveExpr from "./directive/expr";
import directiveOn from "./directive/on";
import directiveModel from "./directive/model";
import { runtimeErr } from "../../error";

/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://icejs.org/######
*/
export default function Tmpl ( tmplCode ) {
	this.tmplCode = tmplCode;
}

extend ( Tmpl.prototype, {
	mount ( vm, scoped ) {
    	foreach ( Tmpl.mountElem ( this.tmplCode ), ( data ) => {
        	new ViewWatcher ( data.handler, data.targetNode, data.expr, vm, scoped );
        } );
    },
} );

extend ( Tmpl, 	{
	mountElem ( elem, vm, scoped ) {
    	const rattr = /^:([\$\w]+)$/;
        let directive, handler, targetNode, expr, forAttrValue, firstChild,
            watcherData = [],
            rexpr = /{{\s*(.*?)\s*}}/;
		
    	do {
        	if ( elem.nodeType === 1 ) {
            	
        		// 处理:for
				// 处理:if :else-if :else
				// 处理{{ expression }}
				// 处理:on、:onrequest :onresponse :onfinish事件
				// 处理:model
            	forAttrValue = Tmpl.preTreat ( elem, vm, scoped );
            	if ( forAttrValue ) {
                	watcherData.push ( { handler : Tmpl.directives.for, targetNode : elem, expr : forAttrValue } );
                }
            	else {
                	// 绑定无刷新跳转点击事件
                	// single.bind ( elem );
                	
                	// 加载元素驱动器渲染元素
                	// elementDriver.render ( elem );
                	
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
            
            firstChild = elem.firstChild || elem.content && elem.content.firstChild;
            if ( firstChild && !forAttrValue ) {
                watcherData = watcherData.concat ( Tmpl.mountElem ( firstChild ) );
            }
        } while ( elem = elem.nextSibling )
        return watcherData;
    },

    /**
        preTreat ( elem: DOMObject )
    
        Return Type:
        String
        当前元素的“:for”属性值
    
        Description:
        元素预处理
        主要对“:if”、“:for”两个指令的特殊处理
    
        URL doc:
        http://icejs.org/######
    */
	preTreat ( elem, vm, scoped ) {
    	let nextSib, parent, 
            _if = ":if",
            _elseif = ":else-if",
            _else = ":else",
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
                nextSib.templateNodes = slice.call ( nextSib.content.childNodes );
            }
        } );
        
        return attr ( elem, ":for" );
    },
	
	directives : {
        for : directiveFor,
        if : directiveIf,
        expr : directiveExpr,
        on : directiveOn,
        model : directiveModel
    }
} );