import Tmpl from "src/compiler/tmpl/core";
import { attr } from "src/func/node";
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
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                expr : "success",
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );
    	expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "success" );
        expect ( d.children [ 0 ].nextSibling ().children [ 0 ].nodeValue ).toBe ( "success123" );
        // 比较最小更新步骤并渲染到实际dom
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeValue ).toBe ( "success" );
        expect ( realDOM.childNodes.item ( 0 ).nextSibling.childNodes.item ( 0 ).nodeValue ).toBe ( "success123" );


        dBackup = d.clone ();
        vm.expr = "hello";
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello" );
        expect ( d.children [ 0 ].nextSibling ().children [ 0 ].nodeValue ).toBe ( "hello123" );
        // 比较最小更新步骤并渲染到实际dom
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeValue ).toBe ( "hello" );
        expect ( realDOM.childNodes.item ( 0 ).nextSibling.childNodes.item ( 0 ).nodeValue ).toBe ( "hello123" );
    } );
  
	it ( "directive expression will mount in attribute node", () => {
        d.appendChild ( VElement ( "p", { id: "{{ id }}" }, null, [ VTextNode ( "attr expr" ) ] ) );
        d.appendChild ( VElement ( "p", { id: "{{ id }}456" }, null, [ VTextNode ( "attr expr2" ) ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                id : "text",
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "text" );
        expect ( d.children [ 1 ].attr ( "id" ) ).toBe ( "text456" );
        // 比较最小更新步骤并渲染到实际dom
        d.diff ( dBackup ).patch ();
        expect ( attr ( realDOM.childNodes.item ( 0 ), "id" ) ).toBe ( "text" );
        expect ( attr ( realDOM.childNodes.item ( 1 ), "id" ) ).toBe ( "text456" );

        dBackup = d.clone ();
        vm.id = "success";
        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "success" );
        expect ( d.children [ 1 ].attr ( "id" ) ).toBe ( "success456" );
        // 比较最小更新步骤并渲染到实际dom
        d.diff ( dBackup ).patch ();
        expect ( attr ( realDOM.childNodes.item ( 0 ), "id" ) ).toBe ( "success" );
        expect ( attr ( realDOM.childNodes.item ( 1 ), "id" ) ).toBe ( "success456" );
    } );

    it ( "multiple directive expression in single attribute or single text", () => {
        d.appendChild ( VElement ( "p", { id : "{{ id }}{{ text }}" }, null, [ VTextNode ( "{{ hello }} {{ id }}" ) ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                id : "text",
                text : "222",
                hello : "hello",
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "id" ) ).toBe ( "text222" );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello text" );
        d.diff ( dBackup ).patch ();
        expect ( attr ( realDOM.childNodes.item ( 0 ), "id" ) ).toBe ( "text222" );
        expect ( realDOM.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeValue ).toBe ( "hello text" );
    } );

    it ( "Common treatment at attribute 'style' and 'class' when state isn't a object", () => {
        d.appendChild ( VElement ( "p", { class: "first-class{{ clazz }}", style: "margin-top:20px{{ color }}" }, null, [ VTextNode ( "hello icejs" ) ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                clazz: [ "a", "b", "c" ],
                color: {
                    background: "red",
                    color: "white",
                    fontSize: 20,
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "class" ) ).toBe ( "first-class a b c" );
        expect ( d.children [ 0 ].attr ( "style" ) ).toBe ( "margin-top:20px;background:red;color:white;font-size:20px;" );
        d.diff ( dBackup ).patch ();
        
        expect ( realDOM.querySelector ( ".first-class" ).nodeName ).toBe ( "P" );
        expect ( realDOM.querySelector ( ".a" ).nodeName ).toBe ( "P" );
        expect ( realDOM.querySelector ( ".b" ).nodeName ).toBe ( "P" );
        expect ( realDOM.querySelector ( ".c" ).nodeName ).toBe ( "P" );
        expect ( realDOM.firstChild.style.marginTop ).toBe ( "20px" );
        expect ( realDOM.firstChild.style.background ).toMatch ( /red/ );
        expect ( realDOM.firstChild.style.color ).toBe ( "white" );
        expect ( realDOM.firstChild.style.fontSize ).toBe ( "20px" );
    } );

    it ( "Special treatment at attribute 'style' and 'class' when state is a object", () => {
        d.appendChild ( VElement ( "p", { class: "{{ clazz }}", style: "{{ color }}" }, null, [ VTextNode ( "hello icejs" ) ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                clazz: [ "a", "b", "c" ],
                color: {
                    background: "red",
                    color: "white",
                    fontSize: 20,
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "class" ) ).toBe ( "a b c" );
        expect ( d.children [ 0 ].attr ( "style" ) ).toBe ( "background:red;color:white;font-size:20px;" );
        d.diff ( dBackup ).patch ();
        
        expect ( realDOM.querySelector ( ".a" ).nodeName ).toEqual ( "P" );
        expect ( realDOM.querySelector ( ".b" ).nodeName ).toEqual ( "P" );
        expect ( realDOM.querySelector ( ".c" ).nodeName ).toEqual ( "P" );
        expect ( realDOM.firstChild.style.background ).toMatch ( /red/ );
        expect ( realDOM.firstChild.style.color ).toBe ( "white" );
        expect ( realDOM.firstChild.style.fontSize ).toBe ( "20px" );
    } );

    it ( "Directive expression with calculation", () => {
        d.appendChild ( VElement ( "span", { id: "{{ expr ? 'new' : 'old' }}_id" }, null, [ VTextNode ( "{{ expr + ' amaple' }}" ) ] ) );
        d.appendChild ( VElement ( "span", {}, null, [ VTextNode ( "123{{ expr === 'hello' ? 'a' : 'b' }}" ) ] ) );
        d.appendChild ( VElement ( "span", {}, null, [ VTextNode ( "{{ expr !== 'hello' && 'a' || 'b' }}456" ) ] ) );
        d.appendChild ( VElement ( "span", {}, null, [ VTextNode ( "123{{ expr.substr ( 2 ) }}456" ) ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                expr : "hello",
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );
        expect ( d.children [ 0 ].children [ 0 ].nodeValue ).toBe ( "hello amaple" );
        expect ( d.children [ 0 ].attrs.id ).toBe ( "new_id" );
        expect ( d.children [ 1 ].children [ 0 ].nodeValue ).toBe ( "123a" );
        expect ( d.children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b456" );
        expect ( d.children [ 3 ].children [ 0 ].nodeValue ).toBe ( "123llo456" );
        // 比较最小更新步骤并渲染到实际dom
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeValue ).toBe ( "hello amaple" );
        expect ( realDOM.childNodes.item ( 1 ).childNodes.item ( 0 ).nodeValue ).toBe ( "123a" );
        expect ( realDOM.childNodes.item ( 2 ).childNodes.item ( 0 ).nodeValue ).toBe ( "b456" );
        expect ( realDOM.childNodes.item ( 3 ).childNodes.item ( 0 ).nodeValue ).toBe ( "123llo456" );
    } );
} );