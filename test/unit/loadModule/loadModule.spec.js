import ice from "ice";

describe ( "ice test =>", () => {

	it ( "load a simple ice module", () => {
		document.body.innerHTML = `<div :module></div><div :module="tips"><div :module></div></div>`;

		ice.startRouter ( {
			// history : ice.HASH_HISTORY,
			module : {
				cache : true,
				expired : 3000
			},
			moduleSuffix: ".html",
			baseURL : "module",
			routes : function ( Router ) {
				Router.module ().route ( [ "/debug", "/table" ], "test/table" ).route( "/login", "test/login" );
				Router.module ( "tips" ).route ( "/debug", "test/sera", childRouter => {
					childRouter.module ().defaultRoute ( "test/sub_sera" );
				} );
			}
		} )
	} );
} );