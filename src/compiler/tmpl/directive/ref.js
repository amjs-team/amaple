import { type } from "../../../func/util";

export default {
	name : "ref",
	
  	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,

    /**
        update ( refName: String )
    
        Return Type:
        void
    
        Description:
        将引用元素/组件保存到对应的模块中
    
        URL doc:
        http://amaple.org/######
    */
	update ( refName ) {
    	const 
            refs = this.tmpl.module.references,
            tref = type ( refs [ refName ] ),
            node = this.node;

        switch ( tref ) {
            case "undefined" :
                refs [ refName ] = node;
                
                break;
            case "object" :
                refs [ refName ] = [ refs [ refName ] ];
                refs [ refName ].push ( node );
                   
               break;
            case "array" :
               refs [ refName ].push ( node );
        }


        // 保存将引用元素/组件从对应的模块中移除的函数
        node.delRef = () => {
            if ( type ( refs [ refName ] ) === "array" ) {
                refs [ refName ].splice ( refs [ refName ].indexOf ( node ), 1 );
            }
            else {
                delete refs [ refName ];
            }
        };
    }
};