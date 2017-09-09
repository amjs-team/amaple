import { extend, forech, type } from "../../func/util";
import { query } from "../../func/node";
import { moduleErr } from "../../error";
import single from "../../single/core";
import iceAttr from "../../single/iceAttr";
import iceHistory from "../../single/history/iceHistory";

// [
  //  { module: obj1, name: "default", moduleNode: node1, parent: null, children: [
    //    { module: obj2, name: "header", moduleNode: node2, parent: parentObj },
    //    { module: obj3, name: "main", moduleNode: node3, parent: parentObj },
    //    { module: obj4, name: "footer", moduleNode:node4, parent: parentObj }
   // ] }
// ]

function loopRender ( entity, param, search ) {
	let toRender = false;
	foreach ( entity, route => {
    	if ( route.hasOwnProperty ( "notUpdate" ) ) {
        	if ( route.hasOwnProperty ( "forcedRender" ) {
                toRender = true;
            }
    		else {
                // 比较新旧param和search对象中的值，如果有改变则调用paramUpdated和searchUpdated
                // foreach 
            	// route.module.
            }
            
            delete route.notUpdate;
        }
    	else {
        	toRender = true;
        }
        
        // 需更新模块与强制重新渲染模块进行渲染
        if ( toRender ) {
        	const moduleNode = route.moduleNode || query ( `[${ iceAttr.module }=${ route.name === "default" ? "''" : route.name }]` );
    		if ( !moduleNode ) {
        		throw moduleErr ( "moduleNode", `找不到加载路径为"${ route.modulePath }"的模块node` );
        	}
    	
        	// 无刷新跳转组件调用来完成无刷新跳转
			single ( route.modulePath, moduleNode, param [ route.name ], search, undefined, undefined, undefined, () => {
        		if ( type ( route.children ) === "array" ) {
        			loopRender ( route.children );
        		}
        	} );
        }
	} );
}

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
        render ( location: Object )
    
        Return Type:
        void
    
        Description:
        根据location对象渲染出对应的模块
    
        URL doc:
        http://icejs.org/######
    */
	render ( location ) {
    	const locationGuide = {
        	structure : location.structure, 
        	param : location.param,
        	search : location.search
        };
    	
    	loopRender ( this.entity, location.param, location.search );
    	
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