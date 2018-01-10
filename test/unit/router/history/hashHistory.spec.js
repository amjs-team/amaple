import hashHistory from "src/router/history/hashHistory";

describe ( "hashHistory =>", () => {

	it ( "test the 'buildURL' function", () => {
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
} );