import am from "am";

describe ( "plugin define =>", () => {

	it ( "define a plugin that uses a plain object", () => {
		const 
			div = document.createElement ( "div" ),
			caller = jasmine.createSpy ( "caller" );

		div.innerHTML = `<div :module="root">{{ count }}<button :onclick="addCount">{{ btnText }}</button></div>`;

		am.install ( {
			name : "counter",
			build () {
				let count = 0;

				return {
					addCount () {
						caller ();
						count ++;
					},
					getCount () {
						caller ();
						return count;
					}
				};
			}
		} );

		new am.Module ( div.firstChild, {
			init ( counter ) {
				return {
					count : counter.getCount (),
					btnText : "add count",
					addCount () {
						counter.addCount ();
						this.count = counter.getCount ();
						expect ( this.count ).toBe ( 2 );
					}
				};
			},
			mounted ( counter, util, http ) {
				counter.addCount ();
				caller ();
				expect ( util.type ( util ) ).toBe ( "object" );
			}
		} );

		div.querySelector ( "button" ).click ();
		expect ( caller.calls.count () ).toBe ( 5 );
	} );
} );