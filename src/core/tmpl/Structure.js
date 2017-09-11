import { extend, forech, type } from "../../func/util";
import { query, attr } from "../../func/node";
import { moduleErr } from "../../error";
import single from "../../single/core";
import ModuleLoader from "../../single/ModuleLoader";
import iceAttr from "../../single/iceAttr";
import iceHistory from "../../single/history/iceHistory";

// [
  //  { module: obj1, name: "default", moduleNode: node1, parent: null, children: [
    //    { module: obj2, name: "header", moduleNode: node2, parent: parentObj },
    //    { module: obj3, name: "main", moduleNode: node3, parent: parentObj },
    //    { module: obj4, name: "footer", moduleNode:node4, parent: parentObj }
   // ] }
// ]




export default function Structure ( entity ) {
    this.entity = entity;
}

extend ( Structure.prototype, {
	update ( location ) {
    	let x = this.entity,
			y = structure.entity,
            find;
    	
    	if ( ( x && !y ) || ( !x && y ) ) {
			x = y;
        }
        else if ( x && y ) {
    		foreach ( y, ( yItem, i ) => {
        		foreach ( x, ( xItem, j ) => {
            		find = false;
            		if ( xItem.name === yItem.name ) {
                		find = true;
                		if ( xItem.modulePath !== yItem.modulePath ) {
                    	
                    		// 模块名相同但模块内容不同的时候表示此模块需更新为新模块及子模块内容
                    		x.splice ( j, 1, yItem );
                    	}
                		else {
                    	
                    		// 模块名和模块内容都相同的时候只表示此模块不需更新，还需进一步比较子模块
                        	// 标记为不更新
                        	xItem.notUpdate = null;
                    		if ( !( !xItem.children && !yItem.children ) ) {
                    			xItem.children = this.update.call ( {  
                        			entity : xItem.children,
                        			update : this.update
                        		}, {
                        			entity : yItem.children
                        		} );
                        	}
                    	}
                	
                		return false;
                	}
            	} );
        	
        		if ( !find ) {
            	
            		// 在原结构体中没有匹配到此更新模块，表示此模块为新模块，直接push进原结构体对应位置中
            		x.push ( yItem );
            	}
        	} );
        }
    	
    	if ( !this instanceof Structure ) {
        	return x;
        }
	},

    /**
        signCurrentRender ( structureItem: Object )
    
        Return Type:
        void
    
        Description:
        标记当前正在渲染的页面结构项
        这样可以使创建Module对象时获取父级的vm，和保存扫描到的moduleNode
    
        URL doc:
        http://icejs.org/######
    */
    signCurrentRender ( structureItem, param, search ) {
    	structureItem.param = param;
    	structureItem.search = search;
        this.currentRender = structureItem;
    },
	
	getCurrentRender () {
    	return this.currentRender;
    },

    /**
        saveSubModuleNode ( node: DOMObject )
    
        Return Type:
        void
    
        Description:
        保存扫描到的模块节点对象以便下次使用时直接获取
    
        URL doc:
        http://icejs.org/######
    */
    saveSubModuleNode ( node ) {
    	foreach ( this.currentRender.children, child => {
        	if ( child.name === ( attr ( node, iceAttr.module ) || "default" ) && !child.moduleNode ) {
            	child.moduleNode = elem;
            	
                break;
            }
        } );
    },
	
	/**
        render ( location: Object )
    
        Return Type:
        void
    
        Description:
        根据location对象渲染出对应的模块
    
        URL doc:
        http://icejs.org/######
    */
	render ( location ) {
    	const 
            locationGuide = {
        	   structure : location.nextStructure, 
        	   param : location.param,
        	   search : location.search
            },

            // 使用模块加载器来加载更新模块
            moduleLoader = new ModuleLoader ();
    	
        moduleLoader.load ( this, { param : location.param, search : location.search } );

    	// loopRender.call ( this, new ModuleLoader (), location.param, location.search );
    	
    	switch ( location.action ) {
        	case "PUSH":
            	iceHistory.push ( locationGuide, location.path );
            	
            	break;
        	case "REPLACE":
            	iceHistory.replace ( locationGuide, location.path );
            	
        		break;
        	case "NONE":
            	iceHistory.saveState ( location.path, locationGuide );

            	break;
        	case "POP":
            	// do nothing
        }
    },
} );