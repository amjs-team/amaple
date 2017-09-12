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
            method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ) : undefined,
            param = {},
        	nextStructure = Router.matchRoutes ( path, param );

		if ( !nextStructure.isEmptyStructure () ) {
        	e.preventDefault ();

            const location = {
                path,
                nextStructure : nextStructure,
                param,
                search : Router.matchSearch ( getSearch () ),
                action : "NONE"
            };
                	
			moduleElem = getModuleElem ( targetModule );
                	
            // 当前模块路径与请求路径不相同时，调用single方法
           	if ( getCurrentPath ( moduleElem ) !== path ) {
            	single ( path, moduleElem, undefined, method, undefined, undefined, undefined, undefined, undefined, true, false );
            }
        }
    } );
}