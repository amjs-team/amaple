import { extend, foreach } from "../func/util";
import check from "../check";
import { RouterErr } from "../error";
import Structure from "../core/tmpl/Structure";


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
    	
    	this.module = {
        	name : moduleName,
        	routes : []
        };
    	this.finger.push ( this.route );
    	
    	return this;
    },
	
	route ( pathExpr, modulePath, childDefineFunc ) {
    	if ( !this.module ) {
        	throw RouterErr ( "Router.module", "调用route()前必须先调用module()定义模块路由" );
        }
    	
    	this.module.routes.push ( {
        	modulePath : modulePath,
        	path : Router.pathToRegexp ( pathExpr ),
        
        if ( type ( childDefineFunc ) === "function" ) {
        	this.module.children = [];
    		childDefineFunc ( new Router ( this.route.children ) );
        }
    	
    	return this;
    },
	
	defaultRoute ( modulePath ) {
    	this.route ( "", modulePath );
    	
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

    pathToRegexp ( path ) {
        let i = 1,
            pathObj = {};

        pathObj.regexp = new RegExp ( "^" + path.replace ( "/", "\\/" ).replace ( /:([\w$]+)(?:(\(.*?\)))?/g, ( match, rep1, rep2 ) => {
            pathObj.params [ rep1 ] = i++;

            return rep2 || "([^\\/]+?)";
        } ) + "(?:\\/)?", "i" );

        return pathObj;
    },

    // 路由路径嵌套模型
    // /settings => /\/settings/、/settings/:page => /\/settings/([^\\/]+?)/、/settings/:page(\d+)
	matchRoutes ( path, param, routeTree = this.routeTree, parent = null ) {
        // [ { module: "...", modulePath: "...", parent: ..., param: {}, children: [ {...}, {...} ] } ]
        let routes = [],
            moduleItem;

        foreach ( routeTree, route => {
            foreach ( route.routes, pathReg => {
            	let matchPath = [],
                    isContinue = true;
            	
            	moduleItem = {
                	name : route.name,
                	modulePath : modulePath,
                	parent : parent
                };
                moduleItem.param = moduleItem.param || {};

                if ( matchPath = path.match ( pathReg.regexp ) ) {
                	isContinue = false;
                    foreach ( pathReg.params, ( i, paramName ) => {
                        param [ paramName ] = matchPath [ i ];
                    } );

                    routes.push ( moduleItem );
                }
            	
            	if ( type ( pathReg.children ) === "array" ) {
                	let children = this.matchRoutes ( matchPath [ 0 ] ? path.replace ( matchPath [ 0 ], "" ) : path, pathReg.children, moduleItem );
                	
                	if ( !isEmpty ( children ) ) {
                    	moduleItem.children = children;
                    	if ( routes.indexOf ( moduleItem ) <= -1 ) {
                    		routes.push ( moduleItem );
                        }
                    }
                }
            	
            	return isContinue;
            } );
        } );
    
    	return routes;
    },
    
    matchSearch ( searchStr ) {
    	let search = {},
            kv;
    	
    	foreach ( searchStr.split ( "&" ), searchItem => {
        	kv = searchItem.split ( "=" );
        	search [ kv [ 0 ] ] = kv [ 1 ];
        } );
    
    	return search;
    }
} );