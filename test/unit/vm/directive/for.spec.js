import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive for => ", () => {
	let d;
	
	beforeEach ( () => {
        d = VElement ( "div" );
    } );
	
	it ( "directive :for in element attribute", () => {
        d.appendChild ( VElement ( "p", { ":for" : "item in list" }, null, [
            VTextNode ( "{{ item }}" )
        ] ) )

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ]
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;

        // 带有startNode、endNode两个标识节点，所以children为5
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "c" );
    } );

    it ( "directive :for in element attribute with :key", () => {
        d.appendChild ( VElement ( "p", { ":for" : "( item, k ) in list" }, null, [
            VTextNode ( "{{ item }}{{ k }}" ),
            VElement ( "span", {}, null, [
                VTextNode ( "{{ show }}" )
            ] )
        ] ) )

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                show: "hello icejs",
            } ),
            t = new Tmpl ( { state : vm } ),
            children, keyA, keyB, keyC, keyD;
        t.mount ( d, true );

        children = d.children;
        keyA = children [ 1 ].key;
        keyB = children [ 2 ].key;
        keyC = children [ 3 ].key;

        // 带有startNode、endNode两个标识节点，所以children为5
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a0" );
        expect ( children [ 1 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b1" );
        expect ( children [ 2 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "c2" );
        expect ( children [ 3 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );

        vm.show = "hello icejs2";
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 2 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 3 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 1 ].key ).toBe ( keyA );
        expect ( children [ 2 ].key ).toBe ( keyB );
        expect ( children [ 3 ].key ).toBe ( keyC );

        vm.list.push ( "d" );
        keyD = children [ 4 ].key;

        expect ( children.length ).toBe ( 6 );
        expect ( children [ 4 ].children [ 0 ].nodeValue ).toBe ( "d3" );
        expect ( children [ 4 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 1 ].key ).toBe ( keyA );
        expect ( children [ 2 ].key ).toBe ( keyB );
        expect ( children [ 3 ].key ).toBe ( keyC );

        vm.list.splice ( 1, 1, "e", "f" );
        expect ( children.length ).toBe ( 7 );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "e1" );
        expect ( children [ 2 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "f2" );
        expect ( children [ 3 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 4 ].children [ 0 ].nodeValue ).toBe ( "c3" );
        expect ( children [ 4 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs2" );
        expect ( children [ 1 ].key ).toBe ( keyA );
        expect ( children [ 4 ].key ).toBe ( keyC );
        expect ( children [ 5 ].key ).toBe ( keyD );
    } );

    it ( "directive :for with nesting directive", () => {
        d.innerHTML = `<p :for="item in list"><span :if="next === item">{{ item }}</span><span :else>{{ item }} else</span></p>`;
        d.appendChild ( VElement ( "p", { ":for" : "item in list" }, null, [
            VElement ( "span", { ":if" : "next === item" }, null, [
                VTextNode ( "{{ item }}" )
            ] ),
            VElement ( "span", { ":else" : "" }, null, [
                VTextNode ( "{{ item }} else" )
            ] )
        ] ) );

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "a",
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;
        expect ( children [ 1 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "b else" );
        expect ( children [ 3 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "c else" );

        vm.next = "b"
        expect ( children [ 1 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "a else" );
        expect ( children [ 2 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "b" );
        expect ( children [ 3 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "c else" );
    } );

    it ( "use directive :for and :if in the same node", () => {
        d.appendChild ( VElement ( "p", { ":if" : "next === item", ":for" : "item in list" }, null, [
            VTextNode ( "{{ item }}" )
        ] ) );

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "b",
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;

        // 带有startNode、endNode两个标识节点，所以children为5
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].nodeType ).toBe ( 3 );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b" );
        expect ( children [ 3 ].nodeType ).toBe ( 3 );

        vm.next = "a";
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].nodeType ).toBe ( 3 );
        expect ( children [ 3 ].nodeType ).toBe ( 3 );
    } );

    it ( "use directive :for and :if in the same node, and use :else-if,:else", () => {
        d.innerHTML = `<p :if="item === 'a'" :for="item in list">{{ item }}</p><p :else-if="item === next">{{ item }} elseif</p><p :else>{{ item }} else</p>`;
        d.appendChild ( VElement ( "p", { ":if" : "item === 'a'", ":for" : "item in list" }, null, [
            VTextNode ( "{{ item }}" )
        ] ) );
        d.appendChild ( VElement ( "p", { ":else-if" : "item === next" }, null, [
            VTextNode ( "{{ item }} elseif" )
        ] ) );
        d.appendChild ( VElement ( "p", { ":else" : "" }, null, [
            VTextNode ( "{{ item }} else" )
        ] ) );

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "b",
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;

        // 带有startNode、endNode两个标识节点，所以children为5
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b elseif" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "c else" );

        vm.next = "a";
        expect ( children.length ).toBe ( 5 );
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b else" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "c else" );
    } );

    it ( "directive :for in template node", () => {
        d.appendChild ( VElement ( "template", { ":for" : "item in list" }, null, [
            VElement ( "span", {}, null, [
                VTextNode ( "{{ item }}" )
            ] ),
            VElement ( "span", {}, null, [
                VTextNode ( "hello icejs" )
            ] )
        ] ) );

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;

        // 带有startNode、endNode两个标识节点
        expect ( children.length ).toBe ( 8 );
        expect ( children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
        expect ( children [ 3 ].children [ 0 ].nodeValue ).toBe ( "b" );
        expect ( children [ 5 ].children [ 0 ].nodeValue ).toBe ( "c" );

        vm.list.push ( "d" );
        expect ( children.length ).toBe ( 10 );
        expect ( children [ 7 ].children [ 0 ].nodeValue ).toBe ( "d" );
    } );

    it ( "use directive :for and :if in the same template node", () => {
        d.appendChild ( VElement ( "template", { ":if" : "item === next", ":for" : "item in list" }, null, [
            VElement ( "span", {}, null, [
                VTextNode ( "{{ item }}" )
            ] ),
            VElement ( "span", {}, null, [
                VTextNode ( "hello icejs" )
            ] )
        ] ) );
        d.appendChild ( VElement ( "template", { ":else" : "" }, null, [
            VElement ( "span", {}, null, [
                VTextNode ( "{{ item }} else" )
            ] ),
            VElement ( "span", {}, null, [
                VTextNode ( "hello icejs2" )
            ] )
        ] ) );

        let vm = new ViewModel ( {
                list: [ "a", "b", "c" ],
                next: "a",
            } ),
            t = new Tmpl ( { state : vm } ),
            children;
        t.mount ( d, true );

        children = d.children;

        // 调用list方法时会重新克隆元素，然后再进行渲染，此时相关监听变量会再次监听克隆出来的新的元素，但旧的监听已经需要删除了
        // vm.list.splice ( 0, 1 );
        // vm.next = "b";
    } );
} );