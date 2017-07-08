import { type, foreach } from "./func/util";

const types = [ "string", "number", "boolean", "object", "null", "undefined", "array" ];

export default function correctParam ( ...params ) {
	return {
    	to ( ...condition ) {
        	let offset = 0,
                _params = [],
                res;
			foreach ( params, ( param, i ) => {
            	condition [ i + offset ] || return false;

            	res = false;
            	for ( let j = i + offset; j < condition.length; j ++ ) {
            	
            		// 统一为数组
            		item = type ( item ) !== "array" ? [ item ] : item;
            		
            		foreach ( item, s => {
              			res = res || ( () => {
                        	return types.indexOf ( s ) !== -1 ? type ( param ) === s : s instanceof RegExp ? s.test ( param ) : param === s;
                        } ) ();
                	}
                  
                	if ( res ) {
                    	_params.push ( param );
                    	break;
                    }
                	else {
                    	_params.push ( undefined );
                    	offset ++;
                    }
            	} );
            } );
          
        	return _params;
        }
    };
}