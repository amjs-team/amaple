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
				// 处理:on
				// 处理:model
				// 处理模板的:onrequest :onresponse :onfinish事件
            	Tmpl.parseFor ( elem, vm )
            	.parseIf ( elem, vm )
            	.parseExpression ( elem, vm )
            	.bindEvent ( elem, vm )
            	.bindModel ( elem, vm )
            	.bindModuleEvent ( elem, vm );
            }
        	else if ( elem.nodeType ===3 ) {
            	Tmpl.parseExpression ( elem, vm );
            }
        
        	Tmpl.mountElem ( elem, vm );
        }
    },
	
	parseFor ( elem, vm ) {
    	let w = f;
    },

	parseIf ( elem, vm ) {
    	
    },
  
	parseExpression ( elem, vm ) {
    	
    },

	bindEvent ( elem, vm ) {
    	
    },
  
	bindModel ( elem, vm ) {
    	
    },

	bindModuleEvent ( elem, vm ) {
    	
    },
} );