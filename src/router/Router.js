import { extend, foreach } from "../func/util";
import check from "../check";
import { RouterErr } from "../error";


// 路由路径嵌套模型
// [
  //  { module: "default" path: { "/settings": "setting" }, children: [
    //    { module: "header" path: { ":footer": "menu" } },
    //    { module: "main" path: { ":footer": "{{ page }}" } },
    //    { module: "footer" path: { ":footer": "footer" } }
   // ] }
// ]


export default function Router ( finger ) {
	this.finger = finger;
}

extend ( Router.prototype, {
	module ( moduleName = "default" ) {
    	check ( moduleName ).type ( "string" ).notBe ( "" ).ifNot ( "Router.module", "模块名必须为不为空的字符串" ).do ();
    	
    	
    	foreach ( this.finger, routeItem => {
        	if ( routeItem.module === this.moduleName ) {
            	throw RouterErr ( "moduleName", "同级模块的名字不能重复" );
            }
        } );
    	
    	this.route = {
        	module : moduleName,
        	path : {}
        };
    	this.finger.push ( this.route );
    	
    	return this;
    },
	
	route ( pathExpr, modulePath ) {
    	if ( !this.route ) {
        	throw RouterErr ( "Router.module", "调用route()前必须先调用module()定义模块路由" );
        }
    	
    	this.route.path [ pathExpr ] = modulePath;
    	
    	return this;
    },
	
	defaultRoute ( modulePath ) {
    	this.route ( "", modulePath );
    	
    	return this;
    },
	
	children ( childDefineFunc ) {
    	this.route.children = [];
    	childDefineFunc ( new Router ( this.route.children ) );
    	
    	return this;
    },
	
	redirect ( from, to ) {
    	let redirect;
    	foreach ( this.finger, routeItem => {
        	if ( routeItem.redirect ) {
            	redirect = routeItem;
            	return false;
            }
        } );
    	
    	if ( redirect ) {
        	redirect.redirect [ from ] = to;
        }
    	else {
        	redirect = {
        		redirect : {}
        	};
        	
        	redirect.redirect [ from ] = to;
    		this.finger.push ( redirect );
        }
    	
    	return this;
	}
} );

extend ( Router, {
	routeTree : [],
	matchesRoutes () {
    	
    },
} );