import Vm from "core/ViewModel";

describe ( "define vm", () => {
	let vm;
	beforeEach ( () => {
		vm = new Vm ( {
			str : "hello",
			arr : [ 1, 2, 3 ],
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
						return this.str + " ice";
					},
					set: function (val) {
						this.str = val;
					}
				}
			}
		} );
	} );

	it ( "It transform basic type data to vm data", () => {
		let str = Object.getOwnPropertyDescriptor ( vm, "str" );
		expect ( str ).toEqual ( jasmine.any ( Object ) );
	} );

	it ( "It transform inner object to the instance of ViewModel", () => {
		expect ( vm.obj instanceof Vm ).toBe ( true );
		expect ( vm.obj.c instanceof Vm ).toBe ( true );
	} );

	it ( "It transform some functions of array", () => {
		expect ( vm.obj instanceof Vm ).toBe ( true );
	} );

	it ( "It transform the computed data which depend on vm data", () => {
		expect ( vm.comp1 ).toBe ( "hello world" );

		vm.str = "hel";
		expect ( vm.comp1 ).toBe ( "hel world" );

		vm.comp1 = "123";
		expect ( vm.comp1 ).toBe ( "hel world" );

		vm.comp2 = "123";
		expect ( vm.comp2 ).toBe ( "123 ice" );
		expect ( vm.str ).toBe ( "123" );
	} );
} );