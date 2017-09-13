import iceAttr from "./iceAttr";
import { attr, query } from "../func/node";
import { buildURL } from "../func/private";
import { type } from "../func/util";
import event from "../event/core";
import Router from "../router/core";
import iceHistory from "./history/iceHistory";
import { moduleErr } from "../error";

/**
    requestEventBind ( elem: DOMObject )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理

    url doc:
    http://icejs.org/######
*/
export default function requestEventBind ( elem ) {
    event.on ( elem, "click submit", e => {

        const 
            target = e.target,
        	path = iceHistory.history.buildURL ( attr ( target, e.type.toLowerCase () === "submit" ? iceAttr.action : iceAttr.href ) ),
            method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ) : "get",
            param = {},
        	nextStructure = Router.matchRoutes ( path, param );

		if ( !nextStructure.isEmptyStructure () ) {
        	e.preventDefault ();

            const location = {
                path,
                nextStructure : nextStructure,
                param,
                get : iceHistory.history.getQuery ( path ),
                post : method.toLowerCase () === "post" ? target : {},
                action : "PUSH"
            };

            // 更新currentPage结构体对象
            Structure.currentPage.update ( location.nextStructure );
            
            // 根据更新后的页面结构体渲染新视图
            Structure.currentPage.render ( location );
                	
        }
    } );
}