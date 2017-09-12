import iceAttr from "./iceAttr";
import { attr, query } from "../func/node";
import { getCurrentPath } from "../func/private";
import { type } from "../func/util";
import event from "../event/core";
import Router from "../router/core";
import { moduleErr } from "../error";

function getModuleElem ( targetModule ) {
	return query ( `*[${ single.aModule }=${ targetModule }]` );
	
	// let module;

    // ice-target属性的值为一个模块的名称
	//if ( /^[^\:,\s]+$/.test ( targetModule) ) {
    	// module = query ( `*[${ single.aModule }=${ targetModule }]` );
    // }
	// else {

        // ice-target属性的值为多个模块的名称
    	// try {
        	// targetModule = "{" + targetModule.replace ( /[^:,\s]+/g, match => "\"" + match + "\"" ) + "}";
        	// targetModule = JSON.parse ( targetModule );
        // }
    	// catch ( e ) {
        	// throw moduleErr ( "parse", "目标模块字符串解析异常，请检查格式是否为code1:mod1,code2:mod2 …" );
        // }
    	
    	//module = {};
    	// foreach ( targetModule, ( name, code ) => {
        	// if ( !( module [ code ] = query ( `*[${ single.aModule }=${ name }]` ) ) ) {
            	// throw moduleErr ( "NotFind", `找不到${ name }模块` );
            // }
        // } );
    // }

    // return module;
}

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
        	path = attr ( target, e.type.toLowerCase () === "submit" ? iceAttr.action : iceAttr.href ),
            method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ) : undefined,
            nextStructure = Router.matchRoutes ( getPathname ( path ), this.param );

		if ( targetModule && path ) {
        	e.preventDefault ();

            const location = {
                path : ,
                nextStructure : Router.matchRoutes ( this.path, this.param ),
                param : {},
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