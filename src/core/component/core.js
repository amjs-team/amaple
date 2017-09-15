import { extend } from "../../func/util";


export default function Component () {
	
}

extend ( Component.prototype, {
	__render__ () {
    	
    },
	
	__initLifeCycle__ () {
    
    },
	
	__initAction__ () {
    	
    },
	
	
} );

extend ( Component, {
	globalClass : {},

	defineGlobal ( componentDerivative ) {
		globalClass [ componentDerivative.name ] = componentDerivative;
	},

	getGlobal ( name ) {
		return this.globalClass [ name ];
	}
} );