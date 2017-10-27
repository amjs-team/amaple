import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive expr => ", () => {

	let d;
	beforeEach ( () => {
    	d = VElement ( "div" );
    } );
	
	it ( "directive expression will mount in text node", () => {
        d.appendChild ( VElement ( "span", {}, null, [ VTextNode ( "{{ expr }}" ) ] ) );
        d.appendChild ( VElement ( "span", {}, null, [ VTextNode ( "{{ expr }}123" ) ] ) );

        let vm = new ViewModel ( {
                expr : "success",
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
    	expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "success" );
        expect ( d.children [ 0 ].nextSibling ().children [ 0 ].nodeValue ).toBe ( "success123" );

        vm.expr = "hello";
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello" );
        expect ( d.children [ 0 ].nextSibling ().children [ 0 ].nodeValue ).toBe ( "hello123" );
    } );
  
	it ( "directive expression will mount in attribute node", () => {
        d.appendChild ( VElement ( "p", { id: "{{ id }}" }, null, [ VTextNode ( "attr expr" ) ] ) );
        d.appendChild ( VElement ( "p", { id: "{{ id }}456" }, null, [ VTextNode ( "attr expr2" ) ] ) );

        let vm = new ViewModel ( {
                id : "text",
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "text" );
        expect ( d.children [ 1 ].attr ( "id" ) ).toBe ( "text456" );

        vm.id = "success";
        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "success" );
        expect ( d.children [ 1 ].attr ( "id" ) ).toBe ( "success456" );
    } );

    it ( "multiple directive expression in single attribute or single text", () => {
        d.appendChild ( VElement ( "p", { id : "{{ id }}{{ text }}" }, null, [ VTextNode ( "{{ hello }} {{ id }}" ) ] ) );

        let vm = new ViewModel ( {
                id : "text",
                text : "222",
                hello : "hello",
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "text222" );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello text" );
    } );

    // 废弃
    // 节点属性”class“、”style“的特殊表现将在"vnode/patch.spec.js"中测试
    // it ( "Special treatment at attribute \"style\" and \"class\" with directive expression", () => {
    //     d.appendChild ( VElement ( "p", { class: "{{ clazz }}", style: "{{ color }}" }, null, [ VTextNode ( "hello icejs" ) ] ) );

    //     let vm = new ViewModel ( {
    //             clazz: [ "a", "b", "c" ],
    //             color: {
    //                 background: "red",
    //                 color: "white",
    //                 fontSize: 20,
    //             }
    //         } ),
    //         t = new Tmpl ( vm );
    //     t.mount ( d, true );

    //     expect ( d.querySelector ( ".a" ) ).toEqual ( jasmine.any ( Object ) );
    //     expect ( d.querySelector ( ".b" ) ).toEqual ( jasmine.any ( Object ) );
    //     expect ( d.querySelector ( ".c" ) ).toEqual ( jasmine.any ( Object ) );
    //     expect ( d.firstChild.style.background ).toBe ( "red" );
    //     expect ( d.firstChild.style.color ).toBe ( "white" );
    //     expect ( d.firstChild.style.fontSize ).toBe ( "20px" );
    // } );
} );