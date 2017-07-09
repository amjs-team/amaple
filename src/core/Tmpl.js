import { extend } from "../func/util";
import { attr } from "../func/node";
import Watcher from "./Watcher";

export default function Tmpl ( tmplCode ) {
	this.tmplCode = tmplCode;
}

extend ( Tmpl.prototype, {
	mount ( vm ) {
    	Tmpl.mountElem ( this.tmplCode, vm );
    },
} );

extend ( Tmpl, {
	mountElem ( elem, vm ) {
      	elem = elem.firstChild;
    	while ( elem = elem.nextSibling ) {
        	if ( elem.nodeType === 1 ) {
            
        		// 处理:for
				// 处理:if :else-if :else
				// 处理{{ expression }}
				// 处理:on、:onrequest :onresponse :onfinish事件
				// 处理:model
            }
        	else if ( elem.nodeType ===3 ) {
            	Tmpl.parseExpression ( elem, vm );
            }
        
        	Tmpl.mountElem ( elem, vm );
        }
    },
	
	mountHandlers : {
        for ( elem, vm ) {

        },

        if ( elem, vm ) {

        },

        expression ( elem, vm ) {

        },

        on ( elem, vm ) {

        },

        model ( elem, vm ) {

        }
    }
} );