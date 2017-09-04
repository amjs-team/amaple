import { extend, foreach } from "../func/util";
import check from "../check";
import { RouterErr } from "../error";


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
    	
    	this.route.path [ modulePath ] = Router.pathToRegexp ( pathExpr );
    	
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
    // [
      //  { module: "default" path: { "setting": { regexp: /^\/setting(?:\/)?/ } }, children: [
        //    { module: "header" path: { ":footer": "menu" } },
        //    { module: "main" path: { ":footer": "{{ page }}" } },
        //    { module: "footer" path: { ":footer": "footer" } }
       // ] }
    // ]
    // /settings => /\/settings/、/settings/:page => /\/settings/([^\\/]+?)/、/settings/:page(\d+)
	matchRoutes ( path ) {
        // [ { modulePath: "setting", param: {} } ]
        let routePath = [],
            matchPath, moduleItem;

        foreach ( this.routeTree, route => {
            foreach ( route.path, ( pathReg, modulePath ) => {


                if ( matchPath = path.match ( pathReg.regexp ) ) {
                    moduleItem = {
                        module : route.module,
                        modulePath : modulePath;
                    };

                    moduleItem.param = moduleItem.param || {};
                    foreach ( pathReg.params, ( i, paramName ) => {
                        moduleItem.param [ paramName ] = matchPath [ i ];
                    } );

                    routePath.push ( moduleItem );
                }
            } );
        } );
    }
} );