import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	name : "cache",
	
	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,

    /**
        update ( isCache: String )
    
        Return Type:
        void
    
        Description:
        将:cache存入vnode中
    
        URL doc:
        http://icejs.org/######
    */
	update ( isCache ) {
    	if ( isCache === "true" ) {
        	this.node.cache = true;
        }
    	else if ( isCache === "false" ) {
        	this.node.cache === false;
        }
    }
} );