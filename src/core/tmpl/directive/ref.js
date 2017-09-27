import { type } from "../../../func/util";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	name : "ref",

	dynamic : false,

    /**
        update ( listener: Function )
    
        Return Type:
        void
    
        Description:
        事件绑定方法
    
        URL doc:
        http://icejs.org/######
    */
	update ( ref ) {
    	const refs = this.tmpl.refs;
    	
    	function saveRef ( refObj ) {
        	const tref = type ( refs [ ref ] );
        	switch ( tref ) {
            	case "undefined" :
                	refs [ ref ] = refObj;
                	
                	break;
            	case "object" :
                	refs [ ref ] = [ refs [ ref ] ];
                	refs [ ref ].push ( refObj );
                    
                    break;
            	case "array" :
                    refs [ ref ].push ( refObj );
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