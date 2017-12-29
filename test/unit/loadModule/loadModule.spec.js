import ice from "ice";

describe ( "ice test =>", () => {

	it ( "load a simple ice module", () => {
		document.body.innerHTML = `<div :module></div><div :module="tips"></div>`;

		window.ice = ice;
		ice.startRouter ( {
			history : ice.BROWSER,
			plugin : [ "demoPlugin" ],
			baseURL : {
				module : "module",
				component : "component",
				plugin : "plugin"
			},
			routes : function ( router ) {

				// default模块路由设置
				router.module ()
				.route ( [ "/debug", "/table" ], "index/table" )
				.route ( "/login", "login/login", childRouter => {
					childRouter.module ().route ( ":sub_sera", "login/sub_sera" );
				} )
				.route ( "/forget_pwd", "index/forget_pwd" )
				.route ( "/error404", "error/404" );


				// tips模块路由设置
				router.module ( "tips" )
				.route ( [ "/debug", "/table" ], "index/sera" );

				// 设置404页面路径
				router.error404 ( "/error404" );
			}
		} )
	} );
} );