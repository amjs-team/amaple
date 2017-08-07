import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive for => ", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive :for in element attribute", () => {
        d.innerHTML = '<p :for="item in list">{{ item }}</p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ]
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children.length ).toBe ( 3 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "b" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "c" );
    } );

    it ( "directive :for in element attribute with :key", () => {
        d.innerHTML = '<p :for="item in list" :key="k">{{ item }}{{ k }}<span>{{ show }}</span></p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                show: "hello icejs",
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children.length ).toBe ( 3 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a0" );
        expect ( children [ 0 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "b1" );
        expect ( children [ 1 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "c2" );
        expect ( children [ 2 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs" );

        vm.show = "hello icejs2";
        expect ( children [ 0 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 1 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 2 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );

        vm.list.push ( "d" );
        expect ( children.length ).toBe ( 4 );
        expect ( children [ 3 ].firstChild.nodeValue ).toBe ( "d3" );
        expect ( children [ 3 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );

        vm.list.splice ( 1, 1, "e", "f" );
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "e1" );
        expect ( children [ 1 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "f2" );
        expect ( children [ 2 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 3 ].firstChild.nodeValue ).toBe ( "c3" );
        expect ( children [ 3 ].firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
    } );

    it ( "directive :for with nesting directive", () => {
        d.innerHTML = `<p :for="item in list"><span :if="next === item">{{ item }}</span><span :else>{{ item }} else</span></p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "a",
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children [ 0 ].firstChild.firstChild.nodeValue ).toBe ( "a" );
        expect ( children [ 1 ].firstChild.firstChild.nodeValue ).toBe ( "b else" );
        expect ( children [ 2 ].firstChild.firstChild.nodeValue ).toBe ( "c else" );

        vm.next = "b"
        expect ( children [ 0 ].firstChild.firstChild.nodeValue ).toBe ( "a else" );
        expect ( children [ 1 ].firstChild.firstChild.nodeValue ).toBe ( "b" );
        expect ( children [ 2 ].firstChild.firstChild.nodeValue ).toBe ( "c else" );
    } );

    it ( "use directive :for and :if in the same node", () => {
        d.innerHTML = `<p :if="next === item" :for="item in list">{{ item }}</p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "b",
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children.length ).toBe ( 1 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "b" );

        vm.next = "a";
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a" );
    } );

    it ( "use directive :for and :if in the same node, and use :else-if,:else", () => {
        d.innerHTML = `<p :if="item === 'a'" :for="item in list">{{ item }}</p><p :else-if="item === next">{{ item }} elseif</p><p :else>{{ item }} else</p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "b",
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children.length ).toBe ( 3 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "b elseif" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "c else" );

        vm.next = "a";
        expect ( children.length ).toBe ( 3 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a" );
        expect ( children [ 1 ].firstChild.nodeValue ).toBe ( "b else" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "c else" );
    } );

    it ( "directive :for in template node", () => {
        d.innerHTML = `<template :for="item in list"><span>{{ item }}</span><span>hello icejs</span></template>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        expect ( children.length ).toBe ( 6 );
        expect ( children [ 0 ].firstChild.nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].firstChild.nodeValue ).toBe ( "b" );
        expect ( children [ 4 ].firstChild.nodeValue ).toBe ( "c" );

        vm.list.push ( "d" );
        expect ( children.length ).toBe ( 8 );
        expect ( children [ 6 ].firstChild.nodeValue ).toBe ( "d" );
    } );

    it ( "use directive :for and :if in the same template node", () => {
        d.innerHTML = `<template :if="item === next" :for="item in list"><span>{{ item }}</span><span>hello icejs</span></template><template :else><span>{{ item }} else</span><span>hello icejs</span></template>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "a",
            } ),
            children;
        t.mount ( vm );

        children = d.children;
        // console.log(d);

        // 调用list方法时会重新克隆元素，然后再进行渲染，此时相关监听变量会再次监听克隆出来的新的元素，但旧的监听已经需要删除了

        vm.next = "b";
    } );
} );