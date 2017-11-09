import iceAttr from "./iceAttr";
import { attr, query } from "../func/node";
import { type } from "../func/util";
import Router from "../router/core";
import http from "../http/core";
import iceHistory from "./history/iceHistory";
import { moduleErr } from "../error";
import Structure from "../core/tmpl/Structure";

/**
    requestEventHandler ( path: String, method: String, post: Object )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理
    参数post为post请求时的数据

    url doc:
    http://icejs.org/######
*/
export default function requestEventHandler ( path, method, post ) {

    if ( method === "GET" ) {

        const 
            param = {},
        	nextStructure = Router.matchRoutes ( path, param );

    	if ( !nextStructure.isEmptyStructure () ) {
            const location = {
                path,
                nextStructure,
                param,
                get : iceHistory.history.getQuery ( path ),
                post,
                method,
                action : "PUSH"
            };
            
            // 根据更新后的页面结构体渲染新视图
            Structure.currentPage.render ( location );
                	
        }
        else {

            // 匹配路由后为空时返回false，外层将不阻止此链接
            return false;
        }
    }
    else if ( method === "POST" ) {
        // post提交数据
        http.post ( path, post, ( redirectPath ) => {
            if ( redirectPath ) {
                redirectPath = iceHistory.history.buildURL ( redirectPath );

                requestEventHandler ( redirectPath, "GET", {} );
            }
        } );
    }
}