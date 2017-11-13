import ice from "ice";

describe ( "ice test =>", () => {

	it ( "load a simple ice module", () => {
		document.body.innerHTML = `<div :module></div><div :module="tips"></div>`;

		ice.startRouter ( {
			// history : ice.HASH_HISTORY,
			module : {
				cache : true,
				expired : 3000
			},
			moduleSuffix: ".html",
			baseURL : "module",
			routes : function ( router ) {
				router.module ()
				.route ( [ "/debug", "/table" ], "test/table" )
				.route ( "/login", "test/login", childRouter => {
					childRouter.module ().route ( ":sub_sera", "test/sub_sera" );
				} )
				.route ( "/forget_pwd", "test/forget_pwd" )
				.route ( "/error404", "error/404" );

				router.module ( "tips" )
				.route ( [ "/debug", "/table" ], "test/sera" );

				// 设置404页面路径
				router.error404 ( "/error404" );
			}
		} )
	} );
} );