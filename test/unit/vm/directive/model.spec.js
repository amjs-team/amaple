import { attr } from "src/func/node";
import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import event from "src/event/core";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive model => ", () => {
	let d;
	
	beforeEach ( () => {
    	d = VElement ( "div" );
    } );
	
	it ( "directive :model will mount in text input node", () => {
        d.appendChild ( VElement ( "input", { type: "text", ":model": "text" } ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                text : "hello icejs"
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );


    	expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs" );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).value ).toBe ( "hello icejs" );
        
        dBackup = d.clone ();
		vm.text = "hello world";
		expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello world" );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).value ).toBe ( "hello world" );
      
		realDOM.childNodes.item ( 0 ).value = "hello icejs2";
        event.emit ( realDOM.childNodes.item ( 0 ), "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
        expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs2" );
    } );
	
	it ( "directive :model will mount in textarea node", () => {
        d.appendChild ( VElement ( "textarea", { ":model" : "text" } ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                text : "hello icejs"
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );
        d.render ();

    	expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs" );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).value ).toBe ( "hello icejs" );

        dBackup = d.clone ();
		vm.text = "hello world";
		expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello world" );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).value ).toBe ( "hello world" );
        
		d.children [ 0 ].node.value = "hello icejs2";
        event.emit ( d.children [ 0 ].node, "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
        expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs2" );
    } );

    it ( "the input node's value is always synced with the vm data which bind with ':model' ", () => {
        d.appendChild ( VElement ( "input", { type: "text", value: "hello icejs", ":model": "text" } ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                text : ""
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "" );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).value ).toBe ( "" );
    } );

	it ( "directive :model will mount in radio input node", () => {
        d.appendChild ( VElement ( "input", { type : "radio", ":model" : "text", value : "a" } ) );
        d.appendChild ( VElement ( "input", { type : "radio", ":model" : "text", value : "b" } ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                text : "a"
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( true );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( false );
        
        dBackup = d.clone ();
		vm.text = "b";
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( true );
        
        dBackup = d.clone ();
		vm.text = "c";
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( false );

        event.emit ( d.children [ 0 ].node, "change" );
        expect ( vm.text ).toBe ( "a" );
        expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    } );
	
	it ( "directive :model will in checkbox input node", () => {
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "a" } ) );
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "b" } ) );
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "c" } ) );
        const realDOM = d.render ();
    	
    	let dBackup = d.clone (),
            vm = new ViewModel ( {
                arr : [ "b" ]
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );
    	
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( true );
        expect ( realDOM.childNodes.item ( 2 ).checked ).toBe ( false );
    	
        d.children [ 0 ].node.checked = true;
        event.emit ( d.children [ 0 ].node, "change" );
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "b,a" );

        d.children [ 1 ].node.checked = false;
        event.emit ( d.children [ 1 ].node, "change" );
        expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "a" );
        
        dBackup = d.clone ();
    	vm.arr.push ( "c" );
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
    	expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( true );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( true );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 2 ).checked ).toBe ( true );

        dBackup = d.clone ();
        vm.arr.shift ();
        expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( true );
        d.diff ( dBackup ).patch ();
        expect ( realDOM.childNodes.item ( 0 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 1 ).checked ).toBe ( false );
        expect ( realDOM.childNodes.item ( 2 ).checked ).toBe ( true );
    } );
} );