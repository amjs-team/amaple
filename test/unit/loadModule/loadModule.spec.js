import ice from "ice";

describe ( "ice test =>", () => {

	it ( "load a simple ice module", () => {
		document.body.innerHTML = `<div :module></div><div :module="tips"></div>`;

		ice.startRouter ( {
			history : ice.BROWSER,
			module : {
				cache : true,
				expired : 3000
			},
			// moduleSuffix: ".html",
			baseURL : "module",
			routes : function ( router ) {
				router.module ()
				.route ( [ "/debug", "/table" ], "index/table" )
				.route ( "/login", "login/login", childRouter => {
					childRouter.module ().route ( ":sub_sera", "login/sub_sera" );
				} )
				.route ( "/forget_pwd", "index/forget_pwd" )
				.route ( "/error404", "error/404" );

				router.module ( "tips" )
				.route ( [ "/debug", "/table" ], "index/sera" );

				// 设置404页面路径
				router.error404 ( "/error404" );
			}
		} )
	} );
} );