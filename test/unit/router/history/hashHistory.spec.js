import hashHistory from "src/router/history/hashHistory";

describe ( "hashHistory =>", () => {

	it ( "Test the 'buildURL' function", () => {
		const 
			path = "aa/bb?ee=1",
			buildedURL = hashHistory.buildURL ( path ),
			pathAnchor = document.createElement ( "a" );

		pathAnchor.href = path;
		expect ( buildedURL.host ).toBe ( window.location.host );

		// IE下的a标签的pathname属性开头没有"/"
		expect ( buildedURL.pathname ).toBe ( ( pathAnchor.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + pathAnchor.pathname );
		expect ( buildedURL.search ).toBe ( pathAnchor.search );
	} );

	it ( "Test the 'correctLocation' function", () => {
		let path = hashHistory.correctLocation ( {
			protocol: "http:",
			host: "localhost:8080",
			pathname: "/about",
			search: "?a=1"
		} );
		expect ( path ).toBe ( "http://localhost:8080/#/about?a=1" );


		path = hashHistory.correctLocation ( {
			protocol: "http:",
			host: "localhost:8080",
			pathname: "about",
			search: "?a=1"
		} );
		expect ( path ).toBe ( "http://localhost:8080/#/about?a=1" );


		path = hashHistory.correctLocation ( {
			protocol: "http:",
			host: "localhost:8080",
			pathname: "/about?b=2",
			search: "?a=1"
		} );
		expect ( path ).toBe ( "http://localhost:8080/#/about?b=2&a=1" );


		path = hashHistory.correctLocation ( {
			protocol: "http:",
			host: "localhost:8080",
			pathname: "/?b=2",
			search: "?a=1"
		} );
		expect ( path ).toBe ( "http://localhost:8080/#/?b=2&a=1" );

		path = hashHistory.correctLocation ( {
			protocol: "http:",
			host: "localhost:8080",
			pathname: "/about",
			hash: "console",
			search: "?a=1"
		} );
		expect ( path ).toBe ( "http://localhost:8080/#/about?a=1" );
	} );
} );