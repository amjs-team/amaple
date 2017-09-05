import Router from "src/router/core";

describe ( "router =>", () => {

	let routeTree;

	beforeEach ( () => {
		routeTree = [];
		const router = new Router ( routeTree );
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
			routes = Router.matchRoutes ( "/settings/profile", param, routeTree );


		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu", parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.profile", parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer", parent: routes [ 0 ] } );
	} );

	it ( "matches a path that contains sub route but not contain root route", () => {
		let param = {},
			routes = Router.matchRoutes ( "/admin", param, routeTree );

		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 1 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "main", modulePath: "main.admin", parent: routes [ 0 ] } );
	} );

	it ( "matches a path that contains root route and empty sub route", () => {
		let param = {},
			routes = Router.matchRoutes ( "/settings/", param, routeTree );

		expect ( routes.length ).toBe ( 1 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu1", parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.account", parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer1", parent: routes [ 0 ] } );
	} );

	it ( "matches a path that has params", () => {
		let param = {},
			routes = Router.matchRoutes ( "/settings/testpage", param, routeTree );

		expect ( Object.keys ( param ).length ).toBe ( 1 );
		expect ( param.page ).toBe ( "testpage" );

		routes = Router.matchRoutes ( "/settings/account/name", param, routeTree );

		console.log(routes);
		expect ( Object.keys ( param ).length ).toBe ( 2 );
		expect ( param.a ).toBe ( "account" );
		expect ( param.b ).toBe ( "name" );
	} );
} );