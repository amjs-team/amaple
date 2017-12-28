import Class from "src/Class";

describe ( "class =>", () => {
	it ( "define class without extends", () => {
		let p = Class ( "person" ) ( {
			constructor () {
				this.aa = 1;
			},
			statics : {
				bb : 2
			},
			cc () {
				console.log(this.aa);
			}
		} );

		expect ( p.prototype.constructor ).toBe ( p );
		expect ( p.bb ).toBe ( 2 );
		
		const p1 = new p ();
		expect ( p1.aa ).toBe ( 1 );
		expect ( p.prototype.cc ).toEqual ( jasmine.any ( Function ) );
	} );

	it ( "define class with extends", () => {
		let P = Class ( "People" ) ( {
			constructor () {
				this.handCount = 2;
				this.headCount = 1;
			},
			say ( something ) {
				return "say: " + something;
			}
		} );

		let G = Class ( "Grake" ).extends ( P ) ( {
			constructor () {
				this.__super ();
				this.name = "Grake";
			},
			introduce () {
				return `My name is ${ this.name }, I have ${ this.handCount } hands, and I have ${ this.headCount } head`;
			}
		} );

		let g = new G ()
		expect ( g instanceof P ).toBeTruthy ( true );
		expect ( g.handCount ).toBe ( 2 );
		expect ( g.headCount ).toBe ( 1 );
		expect ( g.say ( "hello" ) ).toBe ( "say: hello" );
		expect ( g.introduce () ).toBe ( "My name is Grake, I have 2 hands, and I have 1 head" );
	} );

	it ( "define class with constructor args", () => {
		let People = Class ( "People" ) ( {
			constructor ( name, age ) {
				this.name = name;
				this.age = age;
			},
			introduce () {
				return `My name is ${ this.name }, my age is ${ this.age } years old`;
			}
		} );

		let p = new People ( "Grake", 18 );
		expect ( p.introduce () ).toBe ( "My name is Grake, my age is 18 years old" );
	} );
} );