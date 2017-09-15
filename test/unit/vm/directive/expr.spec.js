import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive expr", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive expression will mount in text node", () => {
        d.innerHTML = '<span>{{ expr }}</span><span>{{ expr }}123</span>';
        let vm = new ViewModel ( {
                expr : "success",
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );
    	expect ( d.firstChild.firstChild.nodeValue ).toBe ( "success" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "success123" );

        vm.expr = "hello";
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello123" );
    } );
  
	it ( "directive expression will mount in attribute node", () => {
        d.innerHTML = '<p id="{{ id }}">attr expr</p><p id="{{ id }}456">attr expr2</p>';
        let vm = new ViewModel ( {
                id : "text",
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );

    	expect ( d.firstChild.getAttribute ( "id" ) ).toBe ( "text" );
        expect ( d.querySelector ( "#text" ).firstChild.nodeValue ).toBe ( "attr expr" );
        expect ( d.querySelector ( "#text456" ).firstChild.nodeValue ).toBe ( "attr expr2" );

        vm.id = "success";
        expect ( d.firstChild.getAttribute ( "id" ) ).toBe ( "success" );
        expect ( d.querySelector ( "#success" ).firstChild.nodeValue ).toBe ( "attr expr" );
        expect ( d.querySelector ( "#success456" ).firstChild.nodeValue ).toBe ( "attr expr2" );
    } );

    it ( "multiple directive expression in single attribute or single text", () => {
        d.innerHTML = '<p id="{{ id }}{{ text }}">{{ hello }} {{ id }}</p>';
        let vm = new ViewModel ( {
                id : "text",
                text : "222",
                hello : "hello",
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );

        expect ( d.querySelector ( "#text222" ).firstChild.nodeValue ).toBe ( "hello text" );
    } );

    it ( "Special treatment at attribute \"style\" and \"class\" with directive expression", () => {
        d.innerHTML = '<p class="{{ clazz }}" style="{{ color }}">hello icejs</p>';
        let vm = new ViewModel ( {
                clazz: [ "a", "b", "c" ],
                color: {
                    background: "red",
                    color: "white",
                    fontSize: 20,
                }
            } ),
            t = new Tmpl ( vm );
        t.mount ( d, true, true );

        expect ( d.querySelector ( ".a" ) ).toEqual ( jasmine.any ( Object ) );
        expect ( d.querySelector ( ".b" ) ).toEqual ( jasmine.any ( Object ) );
        expect ( d.querySelector ( ".c" ) ).toEqual ( jasmine.any ( Object ) );
        expect ( d.firstChild.style.background ).toBe ( "red" );
        expect ( d.firstChild.style.color ).toBe ( "white" );
        expect ( d.firstChild.style.fontSize ).toBe ( "20px" );
    } );
} );