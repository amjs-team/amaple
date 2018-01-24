import { type } from "../../../func/util";
import { amAttr } from "../../../var/const";
import Structure from "../../../router/Structure";

export default {
	name : "module",
	
	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before () {
        this.moduleName = this.node.attr ( amAttr.module );
    },

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
            Structure.saveSubModuleNode ( this.node, this.moduleName );
        }
    }
};