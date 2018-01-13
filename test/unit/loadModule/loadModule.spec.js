import am from "am";

describe ( "am test =>", () => {

	it ( "load a simple am module", () => {
		document.body.innerHTML = `<div :module></div><div :module="tips"></div>`;

		window.am = am;
		am.startRouter ( {
			history : am.BROWSER,
			plugin : [
				"demo1", 
				{
					format: "amd",
					name: "demo2",
					url: "demo2"
				},
				{
					format: "iife",
					name: "demo3",
					url: "demo3"
				},
				{ 
					name: "demo4", build ( demo1, demo2, demo3 ) {
						expect ( this ).toBe ( am );
						expect ( demo1.o ).toBe ( "demo1" );
						expect ( demo2.o ).toBe ( "demo2" );
						expect ( demo2.ext ).toBe ( "demo1" );
						expect ( demo3.o ).toBe ( "demo3" );

						return {o: "demo4"};
					}
				},
			],
			baseURL : {
				module : "module",
				component : "component",
				plugin : "plugin"
			},
			routes ( router ) {

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
		} );
	} );
} );