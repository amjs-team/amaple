import parseHTML from "src/compiler/htmlParser/parseHTML";

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
			html = `<style>.cls { border: "solid 1px #555" }</style><script>consoleo.log("wow");</script><textarea>content</textarea>`,
			vf = parseHTML ( html );

		expect ( vf.nodeType ).toBe ( 11 );
		expect ( vf.children.length ).toBe ( 3 );

		const style = vf.children [ 0 ];
		expect ( style.nodeName ).toBe ( "STYLE" );
		expect ( style.children [ 0 ].nodeValue ).toBe ( ".cls { border: \"solid 1px #555\" }" );

		const script = vf.children [ 1 ];
		expect ( script.nodeName ).toBe ( "SCRIPT" );
		expect ( script.children [ 0 ].nodeValue ).toBe ( "consoleo.log(\"wow\");" );

		const textarea = vf.children [ 2 ];
		expect ( textarea.nodeName ).toBe ( "TEXTAREA" );
		expect ( textarea.children [ 0 ].nodeValue ).toBe ( "content" );
	} );

	it ( "parse a plain text", () => {
		let text = "hello icejs",
			vnode = parseHTML ( text );

		expect ( vnode.nodeType ).toBe ( 3 );
		expect ( vnode.nodeValue ).toBe ( "hello icejs" );

		text = "hello icejs<span>123</span>";
		vnode = parseHTML ( text );
		expect ( vnode.nodeType ).toBe ( 11 );
		expect ( vnode.children.length ).toBe ( 2 );

		const vtext = vnode.children [ 0 ];
		expect ( vtext.nodeValue ).toBe ( "hello icejs" );
		
		const vspan = vnode.children [ 1 ];
		expect ( vspan.nodeName ).toBe ( "SPAN" );
		expect ( vspan.children [ 0 ].nodeValue ).toBe ( "123" );
	} );

	it ( "parse pre node", () => {
		const 
			html = `<pre>
				var a = 1;
				var b = 2;
				console.log ( a + b );
				<span>
					hello icejs
				</span>
				</pre>`,
			vpre = parseHTML ( html );

		const vwrap = vpre.children [ 2 ];

		// pre节点内的节点与节点间的空格与换行会保留下来
		expect ( vwrap.nodeValue ).toMatch ( /^\r?\n\s*$/ );
	} );

	it ( "parse svg node", () => {

		// 会自动转换ie ns bug，但目前还没找到此bug，所以它只会被当做普通node解析
		const 
			html = `<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:1; stroke:rgb(0,0,0)"/>
			</svg>`,
			vsvg = parseHTML ( html );

		expect ( vsvg.nodeName ).toBe ( "SVG" );
		expect ( vsvg.children [ 0 ].nodeName ).toBe ( "RECT" );
	} );

	it ( "parse unary node", () => {
		const 
			html = "<div><br/><input type='text' value='name'><hr /></div>",
			vnode = parseHTML ( html );

		expect ( vnode.children.length ).toBe ( 3 );
		expect ( vnode.children [ 0 ].nodeName ).toBe ( "BR" );
		expect ( vnode.children [ 1 ].nodeName ).toBe ( "INPUT" );
		expect ( vnode.children [ 2 ].nodeName ).toBe ( "HR" );
	} );
} );