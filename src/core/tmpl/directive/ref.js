import { type } from "../../../func/util";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	name : "ref",
	
  	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,

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

            // 返回卸载函数
            return () => {
                if ( type ( refs [ refName ] ) === "array" ) {
                    refs [ refName ].splice ( refs [ refName ].indexOf ( refObj ), 1 );
                }
                else {
                    delete refs [ refName ];
                }
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