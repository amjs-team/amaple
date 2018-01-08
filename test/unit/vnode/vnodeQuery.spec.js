import parseHTML from "src/compiler/htmlParser/parseHTML";

function getVElementLength ( velem, cb ) {
	if ( velem.nodeType === 1 ) {
		cb ( velem );

		if ( velem.children.length > 0 ) {
			velem.children.forEach ( child => {
				getVElementLength ( child, cb );
			} );
		}
	}
}

describe ( "vnode query => ", () => {

	let vnode;
	beforeEach ( () => {
		vnode = parseHTML ( `
			<div>
				<span class="selector1" custom-attr="sub1 sub2">.class</span>
				<span id="selector2" custom-attr="sub1-sub2">#id</span>
				<div custom-attr="sub1sub2">
					<p>element</p>
				</div>
				<input type="text" />
				<input type="password" />
				<a href="abc">btn</a>
			</div>
		` );
	} );

	it ( ".class", () => {
		const target = vnode.query ( ".selector1" );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].attr ( "class" ) ).toBe ( "selector1" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( ".class" );
	} );

	it ( "#id", () => {
		const target = vnode.query ( "#selector2" );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].attr ( "id" ) ).toBe ( "selector2" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "#id" );
	} );

	it ( "*", () => {
		const target = vnode.query ( "*" );

		let tagLength = 0;
		getVElementLength ( vnode, velem => {
			tagLength ++;
		} );

		expect ( target.length ).toBe ( tagLength );
	} );

	it ( "element", () => {
		let target = vnode.query ( "div" );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].parent ).toBeNull ();
		expect ( target [ 1 ].nodeName ).toBe ( "DIV" );
		expect ( target [ 1 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );

		const selector = [ "div", "span" ];
		target = vnode.query ( selector.join ( "," ) );

		let tagLength = 0;
		getVElementLength ( vnode, velem => {
			if ( selector.indexOf ( velem.nodeName.toLowerCase () ) > -1 ) {
				tagLength ++;
			}
		} );
		expect ( target.length ).toBe ( tagLength );
	} );

	it ( "element element", () => {
		const target = vnode.query ( "div p" );
		expect ( target [ 0 ].nodeName ).toBe ( "P" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );
	} );

	it ( "element>element", () => {
		const target = vnode.query ( "div>p" );
		expect ( target [ 0 ].nodeName ).toBe ( "P" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );
	} );

	it ( "element+element", () => {
		const target = vnode.query ( "span+div" );
		expect ( target [ 0 ].nodeName ).toBe ( "DIV" );
		expect ( target [ 0 ].children [ 0 ].nodeName ).toBe ( "P" );
	} );

	it ( "[attribute]", () => {
		let target = vnode.query ( "[type]" );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].nodeName ).toBe ( "INPUT" );
		expect ( target [ 1 ].nodeName ).toBe ( "INPUT" );

		target = vnode.query ( "[type=text]" );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "INPUT" );

		target = vnode.query ( "div[type=text]" );
		expect ( target.length ).toBe ( 0 );

		target = vnode.query ( "input[type=text]" );
		expect ( target.length ).toBe ( 1 );

		target = vnode.query ( "[custom-attr~=sub2]" );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( ".class" );

		target = vnode.query ( "[custom-attr|=sub1]" );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "#id" );

		target = vnode.query ( "[custom-attr^=sub]" );
		expect ( target.length ).toBe ( 3 );

		target = vnode.query ( "[custom-attr$=ub2]" );
		expect ( target.length ).toBe ( 3 );

		target = vnode.query ( "[custom-attr*=sub]" );
		expect ( target.length ).toBe ( 3 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 1 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 2 ].nodeName ).toBe ( "DIV" );
	} );

	it ( "pseudo", () => {
		const target = vnode.query ( "a:link" );
		expect ( target [ 0 ].nodeName ).toBe ( "A" );
	} );
} );