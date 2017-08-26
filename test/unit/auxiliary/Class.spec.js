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
				console.log(111);
			}
		} );

		console.log(p());
	} );
} );