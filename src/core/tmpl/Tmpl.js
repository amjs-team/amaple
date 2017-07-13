import { extend } from "../../func/util";
// import { attr } from "../func/node";
import Subscriber from "../Subscriber";
import Watcher from "../Watcher";
import directiveIf from "./directive/if";

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
    	let rattr = /^:([\$\w]+)$/,
            rexpr = /{{\s*(.*?)\s*}}/g,
            directive, expr;
		
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
                        	// bind evevt
                        	Tmpl.directives.on ( elem, directive.substr ( 3 ), vm );
                        }
                    	else if ( Tmpl.directives [ directive ] ) {
                        	// bind attribute key
                        	new Watcher ( Tmpl.directives [ directive ], elem, attr.nodeValue, vm );
                        }
                    	else {
                        	// no specified directive
                        	
                        }
                    }
                	else {
                    	// bind attribute value expression
                    	elem.nodeValue.replace ( rexpr, ( pat ) => {
                        	new Watcher ( () => {
                            	Tmpl.directives.expr ( elem, variable, vm );
                            }, pat );
                        } );
                    }
            	} );
            }
        	else if ( elem.nodeType ===3 ) {
            	// bind text node expression
            	elem.nodeValue.replace ( rexpr, ( pat ) => {
                	new Watcher ( () => {
                    	Tmpl.directives.expr ( elem, variable, vm );
                    }, pat );
            	} );
            }
        
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