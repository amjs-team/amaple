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
		router.module ( "table" ).route ( "/edit", "/edit", function ( childRouter ) {
			childRouter.module ().route ( "edit_tr", "tr" );
			childRouter.module ( "td" ).route ( "edit_td", "td" );
		} );
	} );

	it ( "matches a path that contains root route and sub route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/profile", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 2 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.profile", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 1 ].name ).toBe ( "table" );
		expect ( routes [ 1 ].modulePath ).toBeNull ();
	} );

	it ( "matches a path that contains sub route but not contain root route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/admin", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 2 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 1 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "main", modulePath: "main.admin", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 1 ].name ).toBe ( "table" );
		expect ( routes [ 1 ].modulePath ).toBeNull ();
	} );

	it ( "matches a path that contains root route and empty sub route", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 2 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routes [ 0 ].children.length ).toBe ( 3 );
		expect ( routes [ 0 ].children [ 0 ] ).toEqual ( { name: "menu", modulePath: "menu", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 1 ] ).toEqual ( { name: "main", modulePath: "main.profile", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 0 ].children [ 2 ] ).toEqual ( { name: "footer", modulePath: "footer", moduleNode: null, module: null, parent: routes [ 0 ] } );
		expect ( routes [ 1 ].name ).toBe ( "table" );
		expect ( routes [ 1 ].modulePath ).toBeNull ();
	} );

	it ( "matches a path that has params", () => {
		let param = {},
			structure = Router.matchRoutes ( "/settings/testpage", param, routeTree ),
			routes = structure.entity;

		expect ( Object.keys ( param ).length ).toBe ( 1 );
		expect ( Object.keys ( param.default.data ).length ).toBe ( 0 );
		expect ( Object.keys ( param.default.children ).length ).toBe ( 1 );
		expect ( Object.keys ( param.default.children.menu.data ).length ).toBe ( 1 );
		expect ( param.default.children.menu.data.page ).toBe ( "testpage" );

		structure = Router.matchRoutes ( "/settings/account/name", param, routeTree ),
		routes = structure.entity;
		
		expect ( Object.keys ( param ).length ).toBe ( 1 );
		expect ( Object.keys ( param.default.data ).length ).toBe ( 0 );
		expect ( Object.keys ( param.default.children.menu ).length ).toBe ( 1 );
		expect ( param.default.children.menu.data.page ).toBe ( "account" );
		expect ( Object.keys ( param.default.children.footer.data ).length ).toBe ( 2 );
		expect ( param.default.children.footer.data.a ).toBe ( "account" );
		expect ( param.default.children.footer.data.b ).toBe ( "name" );
	} );

	it ( "matches a path that can not match routes", () => {
		let param = {},
			structure = Router.matchRoutes ( "/edit/edit_tr", param, routeTree ),
			routes = structure.entity;

		expect ( routes.length ).toBe ( 2 );
		expect ( routes [ 0 ].name ).toBe ( "default" );
		expect ( routes [ 0 ].modulePath ).toBeNull ();
		expect ( routes [ 1 ].name ).toBe ( "table" );
		expect ( routes [ 1 ].modulePath ).toBe ( "/edit" );
		expect ( routes [ 1 ].children.length ).toBe ( 2 );
		expect ( routes [ 1 ].children [ 0 ] ).toEqual ( { name: "default", modulePath: "tr", moduleNode: null, module: null, parent: routes [ 1 ] } );
		expect ( routes [ 1 ].children [ 1 ] ).toEqual ( { name: "td", modulePath: null, moduleNode: null, module: null, parent: routes [ 1 ] } );
	} );
} );