import { type } from "../../../func/util";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	name : "ref",

	dynamic : false,

    /**
        update ( refName: String )
    
        Return Type:
        void
    
        Description:
        元素或组件引用
    
        URL doc:
        http://icejs.org/######
    */
	update ( refName ) {
    	const refs = this.tmpl.module.refs;
    	function saveRef ( refObj ) {
        	const tref = type ( refs [ refName ] );
        	switch ( tref ) {
            	case "undefined" :
                	refs [ refName ] = refObj;
                	
                	break;
            	case "object" :
                	refs [ refName ] = [ refs [ ref ] ];
                	refs [ refName ].push ( refObj );
                    
                    break;
            	case "array" :
                    refs [ refName ].push ( refObj );
            }
        }
    	
        if ( this.node.isComponent === true ) {
			this.node.saveRef = saveRef;
        }
    	else {
        	saveRef ( this.node );
        }
    }
} );