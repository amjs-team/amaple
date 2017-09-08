import Router from "src/router/core";

describe ( "router =>", () => {

	let routeTree;

	beforeEach ( () => {
		routeTree = [];
		const router = new Router ( routeTree );

		"/settings/account/name"
    	router.module ().route ( "/settings", "setting", function ( childRouter ) {
			childRouter.redirect ( "", "profile" );
			childRouter.module ( "menu" ).defaultRoute ( "menu1" ).route ( ":page", "menu" );
			// 或者可写成 childRouter.module ( "menu" ).route ( [ "profile", "admin", "keys" ... ], menu );
        	
			childRouter.module ( "main" ).defaultRoute ( "main.account" ).route ( "profile", "main.profile" ).route ( "/admin", "main.admin" );
			childRouter.module ( "footer" ).defaultRoute ( "footer1" ).route ( [ "profile", "admin", "keys", ":a/:b" ], "footer" );
		} );
	} );

	it ( "matches a path that contains root route and sub route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/profile", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.profile", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer", moduleNode: null, module: null, parent: routes [ 0 ] } );
	} );

	it ( "matches a path that contains sub route but not contain root route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/admin", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 1 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "main", modulePath: "main.admin", moduleNode: null, module: null, parent: routes [ 0 ] } );
	} );

	it ( "matches a path that contains root route and empty sub route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.profile", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer", moduleNode: null, module: null, parent: routes [ 0 ] } );
	} );

	it ( "matches a path that has params", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/testpage", param, routeTree ),
			routes = structure.entity;

		expect ( Object.keys ( param ).length ).toBe ( 2 );
		expect ( Object.keys ( param.default ).length ).toBe ( 0 );
		expect ( Object.keys ( param.menu ).length ).toBe ( 1 );
		expect ( param.menu.page ).toBe ( "testpage" );

		structure = Router.matchRoutes ( "/settings/account/name", param, routeTree ),
		routes = structure.entity;
		
		expect ( Object.keys ( param ).length ).toBe ( 3 );
		expect ( Object.keys ( param.default ).length ).toBe ( 0 );
		expect ( Object.keys ( param.menu ).length ).toBe ( 1 );
		expect ( param.menu.page ).toBe ( "account" );
		expect ( Object.keys ( param.footer ).length ).toBe ( 2 );
		expect ( param.footer.a ).toBe ( "account" );
		expect ( param.footer.b ).toBe ( "name" );
	} );
} );