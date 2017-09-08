import { extend, foreach, type, isEmpty } from "../func/util";
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
        	if ( routeItem.name === moduleName ) {
            	throw RouterErr ( "moduleName", "同级模块的名字不能重复" );
            }
        } );
    	
    	this.routeItem = {
        	name : moduleName,
        	routes : []
        };
    	this.finger.push ( this.routeItem );
    	
    	return this;
    },
	
	route ( pathExpr, modulePath, childDefineFunc ) {
        check ( pathExpr ).type ( "string", "array" ).ifNot ( "Router.route", "pathExpr参数必须为字符串或数组" );

    	if ( !this.routeItem ) {
        	throw RouterErr ( "Router.module", "调用route()前必须先调用module()定义模块路由" );
        }
    	
        let route = {
            modulePath : modulePath,
            path : Router.pathToRegexp ( pathExpr )
        };
    	this.routeItem.routes.push ( route );
        
        if ( type ( childDefineFunc ) === "function" ) {
        	route.children = [];
    		childDefineFunc ( new Router ( route.children ) );
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
    	
    	if ( !redirect ) {
            redirect = {
                redirect : []
            };

            this.finger.push ( redirect );
        }

    	redirect.redirect.push ( { from: Router.pathToRegexp ( from, "redirect" ), to } );
    	
    	return this;
	}
} );

extend ( Router, {
	routeTree : [],

    pathToRegexp ( pathExpr, from ) {
        let i = 1,
            pathObj = { param : {} },
			
            // 如果path为redirect中的from，则不需加结尾的“/”匹配式
            endRegexp = from === "redirect" ? "" : "(?:\\/)?";

        // 如果路径表达式为""时需在结尾增加"$"符号才能正常匹配到
        endRegexp += pathExpr === "" ? "$" : "";

        // 如果pathExpr为数组，则需预处理
        if ( type ( pathExpr ) === "array" ) {
            pathExpr = "(" + pathExpr.join ( "|" ) + ")";;
            i ++;
        }

        pathObj.regexp = new RegExp ( "^" + pathExpr.replace ( "/", "\\/" ).replace ( /:([\w$]+)(?:(\(.*?\)))?/g, ( match, rep1, rep2 ) => {
            pathObj.param [ rep1 ] = i++;

            return rep2 || "([^\\/]+)";
        } ) + endRegexp, "i" );

        return pathObj;
    },

    // 路由路径嵌套模型
    // /settings => /\/settings/、/settings/:page => /\/settings/([^\\/]+?)/、/settings/:page(\d+)
	matchRoutes ( path, param, routeTree = this.routeTree, parent = null ) {
        // [ { module: "...", modulePath: "...", parent: ..., param: {}, children: [ {...}, {...} ] } ]
        let routes = [],
            entityItem;
    	
    	foreach ( routeTree, route => {
        	if ( route.hasOwnProperty ( "redirect" ) ) {
                let isContinue = true;
                
                foreach ( route.redirect, redirect => {
                	
                	path = path.replace ( redirect.from.regexp, ( ...match ) => {
                		isContinue = false;
                		let to = redirect.to;
                		
                		foreach ( redirect.from.param, ( i, paramName ) => {
                        	to = to.replace ( `:${ paramName }`, matchPath [ i ] );
                        } );
          				
          				return to;
                	} );
      				
      				return isContinue;
                } );
  				
  				return false;
        	}
        } );

        foreach ( routeTree, route => {
            foreach ( route.routes, pathReg => {
            	let matchPath,
                    isContinue = true;
            	
            	entityItem = {
                	name : route.name,
                	modulePath : pathReg.modulePath,
                	moduleNode : null,
                	module : null,
                	parent
                };

                if ( matchPath = path.match ( pathReg.path.regexp ) ) {
                	isContinue = false;

                    param [ route.name ] = param [ route.name ] || {};
                    foreach ( pathReg.path.param, ( i, paramName ) => {
                        param [ route.name ] [ paramName ] = matchPath [ i ];
                    } );

                    routes.push ( entityItem );
                }
            	
            	if ( type ( pathReg.children ) === "array" ) {
                	let children = this.matchRoutes ( matchPath ? path.replace ( matchPath [ 0 ], "" ) : path, param, pathReg.children, entityItem );
                	
                	if ( !isEmpty ( children ) ) {
                    	entityItem.children = children;
                    	if ( routes.indexOf ( entityItem ) <= -1 ) {
                    		routes.push ( entityItem );
                        }
                    }
                }
            	
            	return isContinue;
            } );
        } );
    
		// 最顶层时返回一个Structure对象
		if ( parent === null ) {
        	return new Structure ( routes );
        }
		else {
    		return routes;
        }
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