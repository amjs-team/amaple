import { runtimeErr } from "../error";
import { foreach } from "../func/util";
import { serialize, attr } from "../func/node";
import { walkVDOM } from "../func/private";
import { amAttr } from "../var/const";
import { HASH } from "./history/historyMode";
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
            extra = {},
        	nextStructure = Router.matchRoutes ( pathResolver.pathname, extra ),
            nextStructureBackup = nextStructure.copy ();

        pathResolver.pathname = extra.path;
    	if ( !nextStructure.isEmpty () ) {
            const location = {
                path : pathResolver.pathname + pathResolver.search,
                nextStructure,
                param: extra.param,
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

function getRoutingElem ( elem, rootElem, eventType ) {
    let path = null;
    const pathAttr = eventType === "submit" ? amAttr.action : amAttr.href;
    do {
        path = attr ( elem, pathAttr );
        if ( path ) {
            break;
        }
    } while ( ( elem = elem.parentNode ) !== rootElem );

    return { elem, path };
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
export default function routingHandler ( e ) {
    const 
        eventType = e.type.toLowerCase (),
        { elem, path } = getRoutingElem ( e.target, this, eventType );
    if ( path && !/http(?:s)?:\/\/|mailto:|#/i.test ( path ) ) {

        const 
            method = eventType === "submit" ? ( attr ( elem, "method" ) || "POST" ).toUpperCase () : "GET",
            buildedPath = amHistory.history.buildURL ( path ),
            target = attr ( elem, "target" ) || "_self";

        if ( window.location.host === buildedPath.host && target === "_self" ) {

            // 如果url相同则不做任何事
            if ( buildedPath.pathname === amHistory.history.getPathname && buildedPath.search === amHistory.history.getQuery ) {
                e.preventDefault ();
            }
            else if ( requestToRouting (
                    buildedPath, 
                    method, 
                    method === "POST" ? elem : {}
                ) !== false ) {
                e.preventDefault ();
            }
        }
    }
    else if ( /^#/.test ( path ) && amHistory.mode === HASH ) {
        e.preventDefault ();
        throw runtimeErr ( "redirect", "hash模式下不可使用形如'#...'的锚链接作为href的值" );
    }
}