import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

xdescribe ( "directive if => ", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive :if in element attribute with single variable", () => {
        d.innerHTML = '<p :if="show">hello icejs</p>';

        let vm = new ViewModel ( {
                show: 0
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );

        expect ( d.querySelector ( "p" ) ).toBeNull ();

        vm.show = 1;
        expect ( d.querySelector ( "p" ).firstChild.nodeValue ).toBe ( "hello icejs" );
    } );

    it ( "directive :if in element attribute with comparison symbol", () => {
        d.innerHTML = '<p :if="show1 > 1">hello icejs1</p><p :if="show2 === 1">hello icejs2</p><p :if="show3 <= 0">hello icejs3</p>';

        let vm = new ViewModel ( {
                show1: 2,
                show2: 0,
                show3: -1,
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs1" );
        expect ( d.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello icejs3" );

        vm.show1 = 0;
        vm.show2 = 1;
        expect ( d.firstChild.nodeValue ).toBe ( "" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
    } );

    it ( "directive :if in element attribute with functions fire", () => {
        d.innerHTML = '<p :if="show.toString() == \'1,2,3\'">hello icejs</p>';

        let vm = new ViewModel ( {
                show : [1, 2, 3]
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );
        
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs" );

        vm.show = "1";
        expect ( d.firstChild.nodeValue ).toBe ( "" );
    } );

    it ( "directive :if,:else-if,:else in element attribute", () => {
        d.innerHTML = `<p :if="show > 1">hello icejs1</p><p :else-if="show === 1">hello icejs2</p><p :else>hello icejs3</p><p :if="show2 === 'aa'">hello icejs4</p><p :else-if="show2 === 'bb'">hello icejs5</p>`;

        let vm = new ViewModel ( {
                show: 2,
                show2: "aa"
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );
        expect ( d.childNodes.length ).toBe ( 2 );
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs1" );

        vm.show = 1;
        expect ( d.childNodes.length ).toBe ( 2 );
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs2" );

        vm.show = 0;
        expect ( d.childNodes.length ).toBe ( 2 );
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs3" );

        vm.show2 = "bb";
        expect ( d.childNodes.length ).toBe ( 2 );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs5" );

        vm.show2 = "cc";
        expect ( d.firstChild.nextElementSibling ).toBeNull ();
    } );

    it ( "directive :if,:else-if,:else with nesting", () => {
        d.innerHTML = `<div :if="show > 1"><p :if="show2">hello icejs1</p></div><div :else-if="show === 1"><p :if="show3 === 'a'">hello icejs2</p><p :else-if="show3 === 'b'">hello icejs3</p></div><div :else>hello icejs4</div>`;

        let vm = new ViewModel ( {
                show: 2,
                show2: "aa",
                show3: 'a'
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );

        expect ( d.firstChild.firstChild.firstChild.nodeValue ).toBe ( "hello icejs1" );
        expect ( d.firstChild.nextSibling ).toBeNull ();

        vm.show2 = false;
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "" );

        vm.show = 1;
        expect ( d.firstChild.firstChild.firstChild.nodeValue ).toBe ( "hello icejs2" );

        vm.show3 = 'b'
        expect ( d.firstChild.firstChild.firstChild.nodeValue ).toBe ( "hello icejs3" );

        vm.show3 = 'c';
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "" );

        vm.show = 0
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs4" );
    } );

    it ( "directive :if,:else-if,:else in template node", () => {
        d.innerHTML = `<template :if="show == 1"><span>{{ num }}</span><span>666</span></template><template :else-if="show == 2"><span>{{ num }}</span><span>888</span></template><div :else>999</div>`;

        let vm = new ViewModel ( {
                show: 1,
                num: 555,
            } ),
            t = new Tmpl ( vm ),
            children;
        t.mount ( d, true, true );

        children = d.children;
        expect ( children.length ).toBe ( 2 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "555" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "666" );

        vm.show = 2;
        expect ( children.length ).toBe ( 2 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "555" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "888" );

        vm.show = 3;
        expect ( children.length ).toBe ( 1 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "999" );
    } );
} );