import { foreach } from "../func/util";
import { serialize, attr } from "../func/node";
import { walkVDOM } from "../func/private";
import { amAttr } from "../var/const";
import Router from "../router/Router";
import http from "../http/core";
import amHistory from "./history/core";
import Structure from "./Structure";

/**
    requestToRouting ( pathResolver: Object, method: String, post: Object )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理
    参数post为post请求时的数据

    url doc:
    http://amaple.org/######
*/
function requestToRouting ( pathResolver, method, post ) {
    if ( method === "GET" ) {
        const 
            param = {},
        	nextStructure = Router.matchRoutes ( pathResolver.pathname, param ),
            nextStructureBackup = nextStructure.copy ();

    	if ( !nextStructure.isEmpty () ) {
            const location = {
                path : pathResolver.pathname + pathResolver.search,
                nextStructure,
                param,
                get : pathResolver.search,
                post : post.nodeType ? serialize ( post, false ) : post,
                method,
                action : "PUSH"
            };
            
            // 根据更新后的页面结构体渲染新视图            
            Structure.currentPage
            .update ( nextStructure )
            .render ( location, nextStructureBackup );
                	
        }
        else {

            // 匹配路由后为空时返回false，外层将不阻止此链接
            return false;
        }
    }
    else if ( method === "POST" ) {

        // post提交数据
        http.post ( pathResolver.pathname + pathResolver.search, post, ( redirectPath ) => {
            if ( redirectPath ) {
                requestToRouting ( amHistory.history.buildURL ( redirectPath ), "GET", post );
            }
        } );
    }
}

/**
    routing ( e: Object )
    
    Return Type:
    void
    
    Description:
    路由跳转事件函数
    
    URL doc:
    http://amaple.org/######
*/
function routing ( e ) {
    const path = attr ( this, e.type.toLowerCase () === "submit" ? amAttr.action : amAttr.href );
    if ( path && !/#/.test ( path ) ) {

        const 
            method = e.type.toLowerCase () === "submit" ? attr ( this, "method" ).toUpperCase () : "GET",
            buildedPath = amHistory.history.buildURL ( path ),
            target = attr ( this, "target" ) || "_self";

        if ( window.location.host === buildedPath.host && target === "_self" ) {

            // 如果url相同则不做任何事
            if ( buildedPath.pathname === window.location.pathname && buildedPath.search === window.location.search ) {
                e.preventDefault ();
            }
            else if ( requestToRouting (
                    buildedPath, 
                    method, 
                    method.toLowerCase () === "post" ? this : {} 
                ) !== false ) {
                e.preventDefault ();
            }
        }
    }
}

/**
    routingHandler ( vnode: Object )
    
    Return Type:
    void
    
    Description:
    为非组件vnode、组件的视图vnodes绑定路由跳转事件(click或submit)
    
    URL doc:
    http://amaple.org/######
*/
export default function routingHandler ( vnode ) {
    if ( !vnode.isComponent ) {
        if ( vnode.nodeType === 1 ) {
            if ( vnode.attr ( amAttr.href ) ) {
                vnode.bindEvent ( "click", routing );
            }
            else if ( vnode.attr ( amAttr.action ) && vnode.nodeName === "FORM" ) {
                vnode.bindEvent ( "submit", routing );
            }
        }
    }
    else {
        foreach ( vnode.templateNodes, childVNode => {
            walkVDOM ( childVNode, routingHandler );
        } );
    }
}