import { rexpr } from "../../var/const";
import { extend } from "../../func/util";
import Subscriber from "../Subscriber";
import Watcher from "../Watcher";
import directiveIf from "./directive/if";
import directiveFor from "./directive/for";
import directiveExpr from "./directive/expr";
import directiveOn from "./directive/on";
import directiveModel from "./directive/model";
import { runtimeErr } from "../error";

export default function Tmpl ( tmplCode ) {
	this.tmplCode = tmplCode;
}

extend ( Tmpl.prototype, {
	mount ( vm ) {
    	Tmpl.mountElem ( this.tmplCode, vm );
    },
} );

extend ( Tmpl, 	{
	mountElem ( elem, vm, scoped ) {
    	const rattr = /^:([\$\w]+)$/;
        let directive, handler, targetNode, expr;
		
    	do {
        	if ( elem.nodeType === 1 ) {
            	
        		// 处理:for
				// 处理:if :else-if :else
				// 处理{{ expression }}
				// 处理:on、:onrequest :onresponse :onfinish事件
				// 处理:model
            	foreach ( elem.attributes, attr => {
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
                    }
                	else {

                    	// 属性值表达式绑定
                    	handler = Tmpl.directives.expr;
                    	targetNode = attr;
                    	expr = attr.nodeValue;
                    }
            	} );
            }
        	else if ( elem.nodeType === 3 ) {

            	// 文本节点表达式绑定
            	handler = Tmpl.directives.expr;
            	targetNode = elem;
            	expr = elem.nodeValue;
            }
            
            // 为视图创建Watcher实例
        	new Watcher ( handler, targetNode, expr, vm, scoped );
        
        	Tmpl.mountElem ( elem.firstChild, vm );
        } while ( elem = elem.nextSibling )
    },
	
	directives : {
        for : directiveFor
        if : directiveIf,
        expr : directiveExpr
        on : directiveOn,
        model : directiveModel
    }
} );