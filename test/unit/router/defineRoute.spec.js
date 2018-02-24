import Router from "src/router/Router";

describe ( "router =>", () => {

	it ( "define the router structure", () => {
		let routeTree = [],
			router = new Router ( routeTree );
    	
    	router.module ().route ( "/settings/", "setting", function ( childRouter ) {
			childRouter.redirect ( "", "profile" ).redirect ( "doc", "doc/first" );
			childRouter.module ( "menu" ).route ( ":page", "menu" );
			// 或者可写成 childRouter.module ( "menu" ).route ( [ "profile", "admin", "keys" ... ], menu );
        	
			childRouter.module ( "main" ).route ( "profile", "main.profile" ).route ( "admin", "main.admin" );
			childRouter.module ( "footer" ).route ( [ "profile", "admin", "keys", ":a/:b(\\d+)" ], "footer" );
		} );

		expect ( routeTree.length ).toBe ( 1 );
		expect ( routeTree [ 0 ].name ).toBe ( "default" );
		expect ( routeTree [ 0 ].routes.length ).toBe ( 1 );
		expect ( routeTree [ 0 ].routes [ 0 ].modulePath ).toBe ( "setting" );
		expect ( routeTree [ 0 ].routes [ 0 ].path.regexp ).toEqual ( /^\/settings(?:\/)?/i );
		expect ( routeTree [ 0 ].routes [ 0 ].children.length ).toBe ( 4 );
		expect ( routeTree [ 0 ].routes [ 0 ].children [ 0 ] ).toEqual ( { redirect: [
			{ from: {regexp: /^(?:\/)?$/i, param: {}}, to: "profile" }, 
			{ from: {regexp: /^doc(?:\/)?$/i, param: {}}, to: "doc/first" }, 
		] } );
		expect ( routeTree [ 0 ].routes [ 0 ].children [ 1 ] ).toEqual ( { name: "menu", routes: [ { modulePath: "menu", path: { regexp: /^([^\/]+)(?:\/)?/i, param: { page: 1 } } } ] } );
		expect ( routeTree [ 0 ].routes [ 0 ].children [ 2 ] ).toEqual ( { name: "main", routes: [ { modulePath: "main.profile", path: { regexp: /^profile(?:\/)?/i, param: {} } }, { modulePath: "main.admin", path: { regexp: /^admin(?:\/)?/i, param: {} } } ] } );
		expect ( routeTree [ 0 ].routes [ 0 ].children [ 3 ] ).toEqual ( { name: "footer", routes: [ { modulePath: "footer", path: { regexp: /^(profile|admin|keys|([^\/]+)\/(\d+))(?:\/)?/i, param: { a: 2, b: 3 } } } ] } );

	} );
} );