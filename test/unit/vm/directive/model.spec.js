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

        let vm = new ViewModel ( {
                text : "hello icejs"
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        d.render ();

    	expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs" );
        expect ( d.children [ 0 ].node.value ).toBe ( "hello icejs" );
      
		vm.text = "hello world";
		expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello world" );
        //缺少变量修改后应用到实际dom的测试
      
		d.children [ 0 ].node.value = "hello icejs2";
        event.emit ( d.children [ 0 ].node, "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
    } );
	
	it ( "directive :model will mount in textarea node", () => {
        d.appendChild ( VElement ( "textarea", { ":model" : "text" } ) );

        let vm = new ViewModel ( {
                text : "hello icejs"
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        d.render ();

    	expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello icejs" );
        expect ( d.children [ 0 ].node.value ).toBe ( "hello icejs" );
      
		vm.text = "hello world";
		expect ( d.children [ 0 ].attr ( "value" ) ).toBe ( "hello world" );
        //缺少变量修改后应用到实际dom的测试
      
		d.children [ 0 ].node.value = "hello icejs2";
        event.emit ( d.children [ 0 ].node, "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
    } );

	it ( "directive :model will mount in radio input node", () => {
        d.appendChild ( VElement ( "input", { type : "radio", ":model" : "text", value : "a" } ) );
        d.appendChild ( VElement ( "input", { type : "radio", ":model" : "text", value : "b" } ) );

        let vm = new ViewModel ( {
                text : "a"
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        d.render ();

    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
        expect ( d.children [ 0 ].node.checked ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].node.checked ).toBe ( false );
      
		vm.text = "b";
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
        //缺少变量修改后应用到实际dom的测试
      
		vm.text = "c";
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        //缺少变量修改后应用到实际dom的测试

        event.emit ( d.children [ 0 ].node, "change" );
        expect ( vm.text ).toBe ( "a" );
    } );
	
	it ( "directive :model will in checkbox input node", () => {
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "a" } ) );
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "b" } ) );
        d.appendChild ( VElement ( "input", { type : "checkbox", ":model" : "arr", value : "c" } ) );
    	
    	let vm = new ViewModel ( {
                arr : [ "b" ]
            } ),
            t = new Tmpl ( { state : vm } );
        t.mount ( d, true );
        d.render ();
    	
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 0 ].node.checked ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].node.checked ).toBe ( true );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
    	expect ( d.children [ 2 ].node.checked ).toBe ( false );
    	
        d.children [ 0 ].node.checked = true;
        event.emit ( d.children [ 0 ].node, "change" );
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "b,a" );
        //缺少变量修改后应用到实际dom的测试

        d.children [ 1 ].node.checked = false;
        event.emit ( d.children [ 1 ].node, "change" );
        expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "a" );
        //缺少变量修改后应用到实际dom的测试
    
    	vm.arr.push ( "c" );
    	expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( true );
    	expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
    	expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( true );
        //缺少变量修改后应用到实际dom的测试

        vm.arr.shift ();
        expect ( d.children [ 0 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 1 ].attr ( "checked" ) ).toBe ( false );
        expect ( d.children [ 2 ].attr ( "checked" ) ).toBe ( true );
        //缺少变量修改后应用到实际dom的测试
        
    } );
} );