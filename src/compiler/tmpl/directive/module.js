import { type } from "../../../func/util";
import Structure from "../../../router/Structure";

export default {
	name : "module",
	
	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,

    /**
        update ( moduleName: String )
    
        Return Type:
        void
    
        Description:
        将:module子模块元素存入Structure.currentPage对应的结构中, 以便下次直接获取使用
    
        URL doc:
        http://amaple.org/######
    */
	update ( moduleName ) {
    	if ( Structure.currentRender && type ( moduleName ) === "string" ) {
            Structure.saveSubModuleNode ( this.node );
        }
    }
};