import { type, foreach } from "./func/util";

const types = [ "string", "number", "function", "boolean", "object", "null", "undefined", "array" ];

export default function correctParam ( ...params ) {
	return {

        /**
            to ( condition1: any, condition2?: any, condition3?: any, ... )
        
            Return Type:
            Object
            链式调用对象
        
            Description:
            匹配参数期望条件
            通过后向匹配纠正参数位置
        
            URL doc:
            http://amaple.org/######
        */
    	to ( ...condition ) {
        	let offset = 0,
                _params = [],
                res, item, j;
			foreach ( params, ( param, i ) => {

            	res = null;
            	for ( j = i + offset; j < condition.length; j ++ ) {
            	
            		// 统一为数组
            		item = type ( condition [ j ] ) !== "array" ? [ condition [ j ] ] : condition [ j ];
            		
                    res = false;
            		foreach ( item, s => {
              			res = res || ( () => {
                        	return types.indexOf ( s ) !== -1 ? type ( param ) === s : s instanceof RegExp ? s.test ( param ) : param === s;
                        } ) ();
                	} );
                    
                    // 已匹配成功
                	if ( res ) {
                    	_params.push ( param );
                    	break;
                    }

                    // 匹配失败，继续匹配
                	else {
                    	_params.push ( undefined );
                    	offset ++;
                    }
            	}

                // 未进入匹配操作，直接继承原顺序
                if ( res === null ) {
                    _params.push ( param );
                }
            } );
          
        	this._params = _params.slice ( 0, params.length );
            return this;
        },

        /**
            done ( callback: Function )
        
            Return Type:
            void
        
            Description:
            回调函数返回纠正后参数
            如果开发者传入的回调函数的参数与纠正参数数量不同，则会以一个数组的形式传入回调函数
            如果开发者传入的回调函数的参数与纠正参数数量相同，则会直接将参数按顺序传入回调函数
            如果开发者没有传入回调函数参数，则通过this对象的$1、$2、$3...去按顺序获取纠正后的参数
        
            URL doc:
            http://amaple.org/######
        */
        done ( callback ) {
            let args = ( /^function\s*\((.*?)\)/.exec ( callback.toString () ) || /^\(?(.*?)\)?\s*=>/.exec ( callback.toString () ) ) [ 1 ],
                l = args ? args.split ( "," ).length : 0,
                _this = {};

            if ( params.length === l ) {
                callback.apply ( null, this._params );
            }
            else if ( l === 1 ) {
                callback ( this._params );
            }
            else {
                foreach ( this._params, ( p, i ) => {
                    _this [ "$" + ( i + 1 ) ] = p;
                } );

                callback.call ( _this );
            }
        }
    };
}