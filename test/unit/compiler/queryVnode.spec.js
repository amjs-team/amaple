import parseHTML from "src/compiler/htmlParser/parseHTML";
import query from "src/compiler/cssParser/core";

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
				<span id="selector2" custom-attr="sub1-sub2" custom-attr2="sub">#id</span>
				<div custom-attr="sub1sub2" custom-attr2="sub">
					<p>element</p>
					<p class="selector1">element2</p>
				</div>
				<input type="text" />
				<input type="password" />
				<a href="abc">btn</a>
			</div>
		` );
	} );

	it ( ".class", () => {
		const target = query ( ".selector1", vnode );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].attr ( "class" ) ).toBe ( "selector1" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( ".class" );
		expect ( target [ 1 ].nodeName ).toBe ( "P" );
	} );

	it ( "#id", () => {
		const target = query ( "#selector2", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].attr ( "id" ) ).toBe ( "selector2" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "#id" );
	} );

	it ( "*", () => {
		const target = query ( "*", vnode );

		let tagLength = 0;
		getVElementLength ( vnode, velem => {
			tagLength ++;
		} );

		expect ( target.length ).toBe ( tagLength );
	} );

	it ( "element", () => {
		let target = query ( "div", vnode );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].parent ).toBeNull ();
		expect ( target [ 1 ].nodeName ).toBe ( "DIV" );
		expect ( target [ 1 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );

		const selector = [ "div", "span" ];
		target = query ( selector.join ( "," ), vnode );

		let tagLength = 0;
		getVElementLength ( vnode, velem => {
			if ( selector.indexOf ( velem.nodeName.toLowerCase () ) > -1 ) {
				tagLength ++;
			}
		} );
		expect ( target.length ).toBe ( tagLength );
	} );

	it ( "selectorA selectorB", () => {
		let target = query ( "div p", vnode );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].nodeName ).toBe ( "P" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );
		expect ( target [ 1 ].children [ 0 ].nodeValue ).toBe ( "element2" );

		target = query ( "[custom-attr2=sub] p.selector1", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "P" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "element2" );
	} );

	it ( "selectorA>selectorB", () => {
		const target = query ( "div>p", vnode );
		expect ( target [ 0 ].nodeName ).toBe ( "P" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "element" );
	} );

	it ( "selectorA+selectorB", () => {
		const target = query ( "span+div", vnode );
		expect ( target [ 0 ].nodeName ).toBe ( "DIV" );
		expect ( target [ 0 ].children [ 0 ].nodeName ).toBe ( "P" );
	} );

	it ( "[attribute]", () => {
		let target = query ( "[type]", vnode );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].nodeName ).toBe ( "INPUT" );
		expect ( target [ 1 ].nodeName ).toBe ( "INPUT" );

		target = query ( "[type=text]", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "INPUT" );

		target = query ( "div[type=text]", vnode );
		expect ( target.length ).toBe ( 0 );

		target = query ( "input[type=text]", vnode );
		expect ( target.length ).toBe ( 1 );

		target = query ( "[custom-attr~=sub2]", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( ".class" );

		target = query ( "[custom-attr|=sub1]", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 0 ].children [ 0 ].nodeValue ).toBe ( "#id" );

		target = query ( "[custom-attr^=sub]", vnode );
		expect ( target.length ).toBe ( 3 );

		target = query ( "[custom-attr$=ub2]", vnode );
		expect ( target.length ).toBe ( 3 );

		target = query ( "[custom-attr*=sub]", vnode );
		expect ( target.length ).toBe ( 3 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 1 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 2 ].nodeName ).toBe ( "DIV" );
	} );

	it ( "selectorA~selectorB", () => {
		let target = query ( "input~input", vnode );
		expect ( target.length ).toBe ( 1 );
		expect ( target [ 0 ].nodeName ).toBe ( "INPUT" );

		target = query ( "span[custom-attr=sub1-sub2]~span", vnode );
		expect ( target.length ).toBe ( 0 );

		target = query ( ".selector1~[custom-attr2=sub]", vnode );
		expect ( target.length ).toBe ( 2 );
		expect ( target [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( target [ 1 ].nodeName ).toBe ( "DIV" );
	} );

	// 伪类不会被当做选择器采用
	// 如“a:empty”会查找所有的a标签
	it ( "pseudo", () => {
		let target = query ( "a:link", vnode );
		expect ( target [ 0 ].nodeName ).toBe ( "A" );

		target = query ( "span:empty, input:checked", vnode );
		expect ( target.length ).toBe ( 4 );

		target = query ( "::selection", vnode );
		expect ( target.length ).toBe ( 9 );
	} );
} );