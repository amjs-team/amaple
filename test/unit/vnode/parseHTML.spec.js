import parseHTML from "src/core/vnode/parseHTML";

describe ( "parse HTML string to vnodes => ", () => {

	it ( "parse a common html string", () => {
		const 
			html = `<div><ul id="l"><li :for="item in list">{{ item }}</li></ul><a href="aa.html">link</a></div>`,
			vdiv = parseHTML ( html );

		expect ( vdiv.nodeName ).toBe ( "DIV" );
		expect ( vdiv.children.length ).toBe ( 2 );
		expect ( vdiv.children [ 0 ].attrs.id ).toBe ( "l" );

		const vli = vdiv.children [ 0 ].children [ 0 ];
		expect ( vli.nodeName ).toBe ( "LI" );
		expect ( vli.attrs [ ":for" ] ).toBe ( "item in list" );
		expect ( vli.children [ 0 ].nodeValue ).toBe ( "{{ item }}" );

		const va = vdiv.children [ 1 ];
		expect ( va.nodeName ).toBe ( "A" );
		expect ( va.attrs.href ).toBe ( "aa.html" );
		expect ( va.children [ 0 ].nodeValue ).toBe ( "link" );
	} );

	it ( "parse some plain node", () => {
		const 
			html = `<style>
			.cls { border: "solid 1px #555" }
			</style><script>consoleo.log("wow");</script><textarea>content</textarea>`,
			vf = parseHTML ( html );

		console.log ( vf );
	} );

	it ( "parse a plain text", () => {
		const 
			text = "<span>hello icejs</span>",
			vnode = parseHTML ( text );
	} );

	it ( "parse pre node", () => {
		const 
			html = `<pre>
				var a = 1;
				var b = 2;
				console.log ( a + b );
				<span>
					hello icejs
				</span></pre>
			<span>
				hello icejs2
			</span>`,
			vpre = parseHTML ( html );

		console.log ( vpre );
	} );

	it ( "parse svg node", () => {

		const 
			html = `<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:1; stroke:rgb(0,0,0)"/>
			</svg>`,
			vnode = parseHTML ( html );

		console.log ( vnode );
	} );

	it ( "parse unary node", () => {
		const 
			html = "<div><br/><input type='text' value='name'><hr /></div>",
			vnode = parseHTML ( html );

		console.log ( vnode );
	} );
} );