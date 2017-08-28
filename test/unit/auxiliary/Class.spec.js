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
		expect ( new p ().aa ).toBe ( 1 );
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
				return "my name is " + this.name + ", I have " + this.handCount + " hands, and I have " + this.headCount + " head";
			}
		} );

		let g = new G ()
		expect ( g instanceof P ).toBeTruthy ( true );
		expect ( g.handCount ).toBe ( 2 );
		expect ( g.headCount ).toBe ( 1 );
		expect ( g.say ( "hello" ) ).toBe ( "say: hello" );
		expect ( g.introduce () ).toBe ( "my name is Grake, I have 2 hands, and I have 1 head" );
	} );
} );