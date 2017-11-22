import hashHistory from "src/single/history/hashHistory";

describe ( "hashHistory =>", () => {

	it ( "test the 'buildURL' function", () => {
		const 
			path = "aa/bb?ee=1",
			buildedURL = hashHistory.buildURL ( path ),
			pathAnchor = document.createElement ( "a" );

		pathAnchor.href = path;
		expect ( buildedURL.host ).toBe ( pathAnchor.host );
		expect ( buildedURL.pathname ).toBe ( pathAnchor.pathname );
		expect ( buildedURL.search ).toBe ( pathAnchor.search );
	} );
} );