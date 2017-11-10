import { extend, foreach, type, isEmpty } from "../../func/util";
import { query, attr, serialize } from "../../func/node";
import { moduleErr } from "../../error";
import ModuleLoader from "../../single/ModuleLoader";
import requestEventHandler from "../../single/requestEventHandler";
import iceAttr from "../../single/iceAttr";
import iceHistory from "../../single/history/iceHistory";
import NodeTransaction from "../../core/vnode/NodeTransaction";

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
	update ( structure ) {
    	let x = this.entity,
			y = structure.entity,
            find;
    	const unmountModule = [];
    	
    	if ( ( x && !y ) || ( !x && y ) ) {
        	foreach ( x, xItem => {
            	unmountModule.push ( xItem.module );
            } );
			x = y;
        }
        else if ( x && y ) {
    		foreach ( y, ( yItem, i ) => {
        		foreach ( x, ( xItem, j ) => {
            		find = false;
            		if ( xItem.name === yItem.name ) {
                		find = true;
                		if ( xItem.modulePath !== yItem.modulePath ) {
                        	unmountModule.push ( xItem.module );

                            // 模块名相同但模块内容不同的时候表示此模块需更新为新模块及子模块内容
                            yItem.moduleNode = xItem.moduleNode;
                            x [ j ] = yItem
                    	}
                		else {
                            y [ i ] = xItem;

                            // 模块名和模块内容都不同的时候只表示此模块需更新，还需进一步比较子模块
                            // 标记为更新
                            xItem.notUpdate = null;

                    		if ( xItem.children || yItem.children ) {
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
    	
    	// call unmount
    	foreach ( unmountModule, mod => {
        	foreach ( mod.components, comp => {
            	comp.unmount ();
            } );
        	
        	mod.unmount ();
        } );
    	
    	if ( !this instanceof Structure ) {
        	return x;
        }
	},

    /**
        isEmptyStructure ()
    
        Return Type:
        Boolean
        是否为空结构
    
        Description:
        判断此结构对象是否为空
    
        URL doc:
        http://icejs.org/######
    */
    isEmptyStructure () {
        return isEmpty ( this.entity );
    },

    /**
        signCurrentRender ( structureItem: Object, param: Object, args: String, data: Object )
        
        Return Type:
        void
    
        Description:
        标记当前正在渲染的页面结构项并传递对应的参数到正在渲染的模块内
        这样可以使创建Module对象时获取父级的vm，和保存扫描到的moduleNode
    
        URL doc:
        http://icejs.org/######
    */
    signCurrentRender ( structureItem, param, args, data ) {
    	structureItem.param = param;
    	structureItem.get = args;
        structureItem.post = data;
        this.currentRender = structureItem;
    },
	
    /**
        getCurrentRender ()
    
        Return Type:
        Object
        当前结构项
    
        Description:
        获取当前正在渲染的页面结构项
    
        URL doc:
        http://icejs.org/######
    */
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
        	if ( child.name === ( node.attr ( iceAttr.module ) || "default" ) && !child.moduleNode ) {
            	child.moduleNode = elem;
            	
                return false;
            }
        } );
    },

    /**
        copy ()
    
        Return Type:
        Object
    
        Description:
        拷贝一个Structure对象
    
        URL doc:
        http://icejs.org/######
    */
    copy ( entity = this.entity, parent = null ) {
        const copyEntity = [];

        foreach ( entity, item => {
            const copyItem = {};

            foreach ( item, ( v, k ) => {
                if ( k === "children" ) {
                    copyItem.children = this.copy ( v, copyItem );
                }
                else if ( k === "parent" ) {
                    copyItem.parent = parent;
                }
                else {
                    copyItem [ k ] = v;
                }
            } );

            copyEntity.push ( copyItem );
        } );

        return parent ? copyEntity : new Structure ( copyEntity );
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
            locationGuide = {},

            // 使用模块加载器来加载更新模块
            moduleLoader = new ModuleLoader ();

        if ( location.action !== "POP" ) {
            locationGuide.structure = location.nextStructure.copy ();
            locationGuide.param = location.param;
            locationGuide.get = location.get;
            locationGuide.post = serialize ( location.post );
        }

        if ( Structure.currentPage !== location.nextStructure ) {
            
            // 更新currentPage结构体对象
            Structure.currentPage.update ( location.nextStructure );
        }
        moduleLoader.load ( location.nextStructure, { param : location.param, get : location.get, post : location.post } );
        switch ( location.action ) {
            case "PUSH":
                iceHistory.push ( locationGuide, location.path );
                
                break;
            case "REPLACE":
                iceHistory.replace ( locationGuide, location.path );
                
                break;
            case "NONE":
                iceHistory.saveState ( locationGuide, location.path );

                break;
            case "POP":
                // do nothing
        }
    },
} );