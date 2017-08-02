import { rexpr } from "../../var/const";
import slice from "../../var/slice";
import { extend, foreach } from "../../func/util";
import Subscriber from "../Subscriber";
import Watcher from "../Watcher";
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
    	foreach ( Tmpl.mountElem ( this.tmplCode, vm ), ( item ) => {
        	new Watcher ( item.handler, item.targetNode, item.expr, vm, scoped );
        } );
    },
} );

extend ( Tmpl, 	{
	mountElem ( elem ) {
    	const rattr = /^:([\$\w]+)$/;
        let directive, handler, targetNode, expr,
            tmplItems = [];
		
    	do {
        	if ( elem.nodeType === 1 ) {
            	
        		// 处理:for
				// 处理:if :else-if :else
				// 处理{{ expression }}
				// 处理:on、:onrequest :onresponse :onfinish事件
				// 处理:model
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
                    }
                	else if ( rexpr.test ( attr.nodeValue ) ) {

                    	// 属性值表达式绑定
                    	handler = Tmpl.directives.expr;
                    	targetNode = attr;
                    	expr = attr.nodeValue;
                    }

                    tmplItems.push ( {
                    	handler, 
                    	targetNode,
                    	expr
                    } );
            	} );
            }
        	else if ( elem.nodeType === 3 ) {

            	// 文本节点表达式绑定
                if ( rexpr.test ( elem.nodeValue ) ) {
                	tmplItems.push ( {
                    	handler : Tmpl.directives.expr, 
                    	targetNode : elem,
                    	expr : elem.nodeValue
                    } );
                }
            }
            
            if ( elem.firstChild ) {
                 tmplItems = tmplItems.concat ( Tmpl.mountElem ( elem.firstChild ) );
            }
        } while ( elem = elem.nextSibling )
        return tmplItems;
    },
	
	directives : {
        for : directiveFor,
        if : directiveIf,
        expr : directiveExpr,
        on : directiveOn,
        model : directiveModel
    }
} );