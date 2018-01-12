import Promise from "src/promise/core";

describe ( "Promise =>", () => {

	let timerCallback;
	beforeEach ( () => {
		jasmine.clock ().install ();
		timerCallback = jasmine.createSpy ( "timerCallback" );
	} );

	afterEach ( () => {
		jasmine.clock ().uninstall ();
	} );

	it ( "use the function 'then' to finish promise work without callback function param", done => {
		const promise = new Promise ( ( resolve, reject ) => {
			setTimeout ( () => {
				timerCallback ();
				resolve ();
			}, 100 );
		} );

		promise.then ( () => {
			done ();
		} );

		expect ( timerCallback ).not.toHaveBeenCalled ();
		jasmine.clock ().tick ( 101 );

		expect ( timerCallback ).toHaveBeenCalled ();
	} );

	it ( "multiple call the function 'then' without callback function param", () => {

		new Promise ( ( resolve, reject ) => {
			setTimeout ( () => {
				resolve ();
			}, 100 );
		} )
		.then ( () => {
			timerCallback ();

			return new Promise ( ( resolve, reject ) => {
				setTimeout ( () => {
					resolve ();
				}, 200 );
			} );
		} )
		.then ( () => {
			timerCallback ();
		} );

		expect ( timerCallback.calls.count () ).toBe ( 0 );

		jasmine.clock ().tick ( 101 );
		expect ( timerCallback.calls.count () ).toBe ( 1 );

		jasmine.clock ().tick ( 200 );
		expect ( timerCallback.calls.count () ).toBe ( 2 );
	} );

	it ( "multiple call the function 'then' in the same hierarchy", () => {

		const promise1 = new Promise ( ( resolve, reject ) => {
			setTimeout ( () => {
				resolve ();
			}, 100 );
		} );

		promise1.then ( () => {
			timerCallback ();
		} );

		const promise2 = new Promise ( ( resolve, reject ) => {
			setTimeout ( () => {
				resolve ();
			}, 200 );
		} );

		promise2.then ( () => {
			timerCallback ();
		} );

		expect ( timerCallback.calls.count () ).toBe ( 0 );

		jasmine.clock ().tick ( 101 );
		expect ( timerCallback.calls.count () ).toBe ( 1 );

		jasmine.clock ().tick ( 101 );
		expect ( timerCallback.calls.count () ).toBe ( 2 );
	} );

} );