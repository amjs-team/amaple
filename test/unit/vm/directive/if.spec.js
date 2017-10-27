import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive if => ", () => {
	let d;
	
	beforeEach ( () => {
        d = VElement ( "div" );
    } );
	
	it ( "directive :if in element attribute with single variable", () => {
        d.appendChild ( VElement ( "p", { ":if" : "show" }, null, [ VTextNode ( "hello icejs" ) ] ) );

        let vm = new ViewModel ( {
                show: 0
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );

        // 隐藏时会有一个空文本节点代替位置
        expect ( d.children [ 0 ].nodeType ).toBe ( 3 );
        expect ( d.children [ 0 ].nodeValue ).toBe ( "" );

        vm.show = 1;
        expect ( d.children [ 0 ].nodeType ).toBe ( 1 );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );
    } );

    it ( "directive :if in element attribute with comparison symbol", () => {
        d.appendChild ( VElement ( "p", { ":if" : "show1 > 1" }, null, [ VTextNode ( "hello icejs1" ) ] ) );
        d.appendChild ( VElement ( "p", { ":if" : "show2 === 1" }, null, [ VTextNode ( "hello icejs2" ) ] ) );
        d.appendChild ( VElement ( "p", { ":if" : "show3 <= 0" }, null, [ VTextNode ( "hello icejs3" ) ] ) );

        let vm = new ViewModel ( {
                show1: 2,
                show2: 0,
                show3: -1,
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs1" );
        expect ( d.children [ 1 ].nodeType ).toBe ( 3 );
        expect ( d.children [ 1 ].nodeValue ).toBe ( "" );
        expect ( d.children [ 2 ].children [ 0 ].nodeValue ).toBe ( "hello icejs3" );

        vm.show1 = 0;
        vm.show2 = 1;
        expect ( d.children [ 0 ].nodeType ).toBe ( 3 );
        expect ( d.children [ 0 ].nodeValue ).toBe ( "" );
        expect ( d.children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( d.children [ 2 ].children [ 0 ].nodeValue ).toBe ( "hello icejs3" );
    } );

    it ( "directive :if in element attribute with functions fire", () => {
        d.appendChild ( VElement ( "p", { ":if" : "show.toString () === '1,2,3'" }, null, [ VTextNode ( "hello icejs" ) ] ) )

        let vm = new ViewModel ( {
                show : [1, 2, 3]
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );

        vm.show = "1";
        expect ( d.children [ 0 ].nodeValue ).toBe ( "" );
    } );

    it ( "directive :if,:else-if,:else in element attribute", () => {
        d.appendChild ( VElement ( "p", { ":if" : "show > 1" }, null, [ VTextNode ( "hello icejs1" ) ] ) );
        d.appendChild ( VElement ( "p", { ":else-if" : "show === 1" }, null, [ VTextNode ( "hello icejs2" ) ] ) );
        d.appendChild ( VElement ( "p", { ":else" : "" }, null, [ VTextNode ( "hello icejs3" ) ] ) );
        d.appendChild ( VElement ( "p", { ":if" : "show2 === 'aa'" }, null, [ VTextNode ( "hello icejs4" ) ] ) );
        d.appendChild ( VElement ( "p", { ":else-if" : "show2 === 'bb'" }, null, [ VTextNode ( "hello icejs5" ) ] ) );

        let vm = new ViewModel ( {
                show: 2,
                show2: "aa"
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        expect ( d.children.length ).toBe ( 2 );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs1" );

        vm.show = 1;
        expect ( d.children.length ).toBe ( 2 );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );

        vm.show = 0;
        expect ( d.children.length ).toBe ( 2 );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs3" );

        vm.show2 = "bb";
        expect ( d.children.length ).toBe ( 2 );
        expect ( d.children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs5" );

        vm.show2 = "cc";
        expect ( d.children [ 1 ].nodeType ).toBe ( 3 );
        expect ( d.children [ 1 ].nodeValue ).toBe ( "" );
    } );

    it ( "directive :if,:else-if,:else with nesting", () => {
        d.appendChild ( VElement ( "div", { ":if" : "show > 1" }, null, [ 
            VElement ( "p", { ":if" : "show2" }, null, [ 
                VTextNode ( "hello icejs1" )
            ] )
        ] ) );
        d.appendChild ( VElement ( "div", { ":else-if" : "show === 1" }, null, [ 
            VElement ( "p", { ":if" : "show3 === 'a'" }, null, [ 
                VTextNode ( "hello icejs2" )
            ] ),
            VElement ( "p", { ":else-if" : "show3 === 'b'" }, null, [ 
                VTextNode ( "hello icejs3" )
            ] )
        ] ) );
        d.appendChild ( VElement ( "div", { ":else" : undefined }, null, [ 
            VTextNode ( "hello icejs4" )
        ] ) );

        let vm = new ViewModel ( {
                show: 2,
                show2: "aa",
                show3: 'a'
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );

        expect ( d.children.length ).toBe ( 1 );
        expect ( d.children [ 0 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs1" );

        vm.show2 = false;
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "" );

        vm.show = 1;
        expect ( d.children [ 0 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );

        vm.show3 = 'b'
        expect ( d.children [ 0 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs3" );

        vm.show3 = 'c';
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "" );

        vm.show = 0
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello icejs4" );
    } );

    it ( "directive :if,:else-if,:else in template node", () => {
        d.appendChild ( VElement ( "template", { ":if" : "show === 1" }, null, [
            VElement ( "span", {}, null, [
                VTextNode ( "{{ num }}" ),
                VTextNode ( "666" )
            ] )
        ] ) );
        d.appendChild ( VElement ( "template", { ":else-if" : "show === 2" }, null, [
            VElement ( "span", {}, null, [
                VTextNode ( "{{ num }}123" ),
                VTextNode ( "888" )
            ] )
        ] ) );
        d.appendChild ( VElement ( "div", { ":else" : "" }, null, [ 
            VTextNode ( "999" )
        ] ) );

        let vm = new ViewModel ( {
                show: 1,
                num: 555,
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        // console.log (d);
        children = d.children;
        expect ( children.length ).toBe ( 1 );
        expect ( children [ 0 ].nodeName ).toBe ( "SPAN" );
        expect ( children [ 0 ].children [ 0 ].nodeValue ).toBe ( 555 );
        expect ( children [ 0 ].children [ 1 ].nodeValue ).toBe ( "666" );

        vm.show = 2;
        expect ( children.length ).toBe ( 1 );
        expect ( children [ 0 ].nodeName ).toBe ( "SPAN" );
        expect ( children [ 0 ].children [ 0 ].nodeValue ).toBe ( "555123" );
        expect ( children [ 0 ].children [ 1 ].nodeValue ).toBe ( "888" );

        vm.show = 3;
        expect ( children.length ).toBe ( 1 );
        expect ( children [ 0 ].children [ 0 ].nodeValue ).toBe ( "999" );
    } );
} );