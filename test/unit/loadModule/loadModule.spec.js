import ice from "ice";

xdescribe ( "ice test =>", () => {

	it ( "load a simple ice module", () => {
		document.body.innerHTML = `<div ice-module></div><a href="#">444</a><div class="abc">{{ title }} {{ content }}</div>`;

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
			}
		} )
	} );
} );