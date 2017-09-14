import { extend, foreach } from "../func/util";

export default function ModuleCaller ( opts ) {
	this.set ( opts );
}

extend ( ModuleCaller.prototype, {
	set ( opts ) {
		const propertyConstraint = [ "state", "props", "parent", "action", "param", "get", "post" ];
		    	
    	foreach ( opts, ( property, name ) => {
        	if ( propertyConstraint.indexOf ( name ) > -1 ) {
            	this [ name ] = property;
            }
        } );
	}
} );

