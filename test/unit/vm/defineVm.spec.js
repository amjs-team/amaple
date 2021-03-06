import ViewModel from "core/ViewModel";

describe ( "define vm => ", () => {
	let vm;
	beforeEach ( () => {
		vm = new ViewModel ( {
			str : "hello",
			arr : [ 2, 1, 3, { bb: 2 } ],
			obj : {
				a : 4,
				b : 5,
				c : {
					d : 6
				}
			},
			computed : {
				comp1 () {
					return this.str + " world";
				},
				comp2 : {
					get: function () {
						return this.str + " amaple";
					},
					set: function (val) {
						this.str = val;
					}
				}
			}
		} );
	} );

	it ( "transform basic type data to vm data", () => {
		let str = Object.getOwnPropertyDescriptor ( vm, "str" );
		expect ( str ).toEqual ( jasmine.any ( Object ) );
	} );

	it ( "transform inner object to the instance of ViewModel", () => {
		expect ( vm.obj instanceof ViewModel ).toBe ( true );
		expect ( vm.obj.c instanceof ViewModel ).toBe ( true );
	} );

	it ( "transform some functions of array", () => {
		vm.arr.push ( { aa: 1 }, [ "str", { cc: 1 } ] );
		expect ( vm.arr [ 3 ] ).toEqual ( jasmine.any ( Object ) );
		expect ( Object.getOwnPropertyDescriptor ( vm.arr [ 4 ], "aa" ) ).toEqual ( jasmine.any ( Object ) );
		expect ( Object.getOwnPropertyDescriptor ( vm.arr [ 5 ] [ 1 ], "cc" ) ).toEqual ( jasmine.any ( Object ) );

		vm.arr.splice ( 0, 0, "add1", "add2", { add3: 666 } );
		expect ( vm.arr [ 2 ] ).toEqual ( jasmine.any ( Object ) );
		expect ( Object.getOwnPropertyDescriptor ( vm.arr [ 2 ], "add3" ) ).toEqual ( jasmine.any ( Object ) );
	} );

	it ( "transform the computed data which depend on vm data", () => {
		expect ( vm.comp1 ).toBe ( "hello world" );

		vm.str = "hel";
		expect ( vm.comp1 ).toBe ( "hel world" );

		vm.comp1 = "123";
		expect ( vm.comp1 ).toBe ( "hel world" );

		vm.comp2 = "123";
		expect ( vm.comp2 ).toBe ( "123 amaple" );
		expect ( vm.str ).toBe ( "123" );
	} );

	it ( "it will throw exception when computed isn't a plain object", () => {
		let vmData = { computed : "throw exception" };
		expect ( () => {
			new ViewModel ( vmData );
		} ).toThrow ();

		vmData = {
			obj : {
				computed: {
					comp3 () {
						return "throw exception too";
					}
				}
			}
		};
		expect ( () => {
			new ViewModel ( vmData );
		} ).toThrow ();
	} );
} );