import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import event from "src/event/core";

describe ( "directive :model", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive :model will mount in text input node", () => {
        d.innerHTML = '<input type="text" :model="text" />';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                text : "hello icejs"
            } );
        t.mount ( vm );
    	expect ( d.firstChild.value ).toBe ( "hello icejs" );
      
		vm.text = "hello world";
		expect ( d.firstChild.value ).toBe ( "hello world" );
      
		d.firstChild.value = "hello icejs2";
        event.emit ( d.firstChild, "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
    } );
	
	it ( "directive :model will mount in textarea node", () => {
        d.innerHTML = '<textarea :model="text"></textarea>';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                text : "hello icejs"
            } );
        t.mount ( vm );
    	expect ( d.firstChild.value ).toBe ( "hello icejs" );
      
		vm.text = "hello world";
		expect ( d.firstChild.value ).toBe ( "hello world" );
      
		d.firstChild.value = "hello icejs2";
        event.emit ( d.firstChild, "input" );
		expect ( vm.text ).toBe ( "hello icejs2" );
    } );

	it ( "directive :model will mount in radio input node", () => {
        d.innerHTML = '<input type="radio" :model="text" value="a" /><input type="radio" :model="text" value="b" />';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                text : "a"
            } );
        t.mount ( vm );
    	expect ( d.firstChild.checked ).toBe ( true );
    	expect ( d.firstChild.nextSibling.checked ).toBe ( false );
      
		vm.text = "b";
    	expect ( d.firstChild.checked ).toBe ( false );
		expect ( d.firstChild.nextSibling.checked ).toBe ( true );
      
		vm.text = "c";
    	expect ( d.firstChild.checked ).toBe ( false );
		expect ( d.firstChild.nextSibling.checked ).toBe ( false );

        event.emit ( d.firstChild, "change" );
        expect ( vm.text ).toBe ( "a" );
    } );
	
	it ( "directive :model will in checkbox input node", () => {
		d.innerHTML = '<input type="checkbox" :model="arr" value="a" /><input type="checkbox" :model="arr" value="b" /><input type="checkbox" :model="arr" value="c" />';
    	
    	let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                arr : [ "b" ]
            } );
        t.mount ( vm );
    	
    	expect ( d.childNodes [ 0 ].checked ).toBe ( false );
    	expect ( d.childNodes [ 1 ].checked ).toBe ( true );
    	expect ( d.childNodes [ 2 ].checked ).toBe ( false );
    	
        d.childNodes [ 0 ].checked = true;
        event.emit ( d.childNodes [ 0 ], "change" );
    	expect ( d.childNodes [ 0 ].checked ).toBe ( true );
    	expect ( d.childNodes [ 1 ].checked ).toBe ( true );
    	expect ( d.childNodes [ 2 ].checked ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "b,a" );

        d.childNodes [ 1 ].checked = false;
        event.emit ( d.childNodes [ 1 ], "change" );
        expect ( d.childNodes [ 0 ].checked ).toBe ( true );
        expect ( d.childNodes [ 1 ].checked ).toBe ( false );
        expect ( d.childNodes [ 2 ].checked ).toBe ( false );
        expect ( vm.arr.toString () ).toBe ( "a" );
    
    	vm.arr.push ( "c" );
    	expect ( d.childNodes [ 0 ].checked ).toBe ( true );
    	expect ( d.childNodes [ 1 ].checked ).toBe ( false );
    	expect ( d.childNodes [ 2 ].checked ).toBe ( true );

        vm.arr.shift ();
        expect ( d.childNodes [ 0 ].checked ).toBe ( false );
        expect ( d.childNodes [ 1 ].checked ).toBe ( false );
        expect ( d.childNodes [ 2 ].checked ).toBe ( true );
    } );
} );