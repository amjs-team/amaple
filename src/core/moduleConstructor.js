import slice from "../var/slice";
import { rexpr, rvar } from "../../var/const";

export default {
	initProps ( componentNode, moduleVm ) {
    	const props = {};
    	
    	let match;
    	foreach ( slice.call ( componentNode.attributes ), attr => {
        	
        	// 属性名需符合变量的命名规则
        	if ( rvar.test ( attr.name ) ) {
            	if ( match = attr.value.match ( rexpr ) ) {
                	props [ attr.name ] = moduleVm [ match [ 1 ] ];
                }
                else {
            		props [ attr.name ] = attr.value;
                }
            }
        } );
      
    	return props;
    },
	
	initLifeCycle () {
    	
    },
	
	initAction () {
    	
    }
};