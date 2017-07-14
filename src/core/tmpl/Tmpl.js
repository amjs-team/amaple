import { rexpr } from "../../var/const";
import { extend } from "../../func/util";
import Subscriber from "../Subscriber";
import Watcher from "../Watcher";
import directiveIf from "./directive/if";
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
	mountElem ( elem, vm ) {
    	const rattr = /^:([\$\w]+)$/;
        let directive, directiveHandler, targetNode, expr;
		
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
                        	directiveHandler = Tmpl.directives.on;
                        	targetNode = elem;
                        }
                    	else if ( Tmpl.directives [ directive ] ) {

                        	// 模板属性绑定
                        	directiveHandler = Tmpl.directives [ directive ];
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
                    	directiveHandler = Tmpl.directives.expr;
                    	targetNode = attr;
                    	expr = attr.nodeValue;
                    }
            	} );
            }
        	else if ( elem.nodeType === 3 ) {

            	// 文本节点表达式绑定
            	directiveHandler = Tmpl.directives.expr;
            	targetNode = elem;
            	expr = elem.nodeValue;
            }
          
        	new Watcher ( directiveHandler, targetNode, expr, vm );
        
        	Tmpl.mountElem ( elem.firstChild, vm );
        } while ( elem = elem.nextSibling )
    },
	
	directives : {
        for ( elem, vm ) {

        },

        if : directiveIf,

        expr ( elem, vm ) {
			
        },

        on ( elem, vm ) {

        },

        model ( elem, vm ) {

        }
    }
} );