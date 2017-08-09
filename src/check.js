import { argErr, checkErr } from "./error";
import { type, extend, foreach } from "./func/util";

/**
    check ( variable: Any )

    Return Type:
    Object(check)|null

    Description:
    检查参数错误
    如果错误则抛出error

    URL doc:
    http://icejs.org/######
*/
export default function check ( variable ) {
    if ( this ) {
        this.target = variable;
        this.condition = [];

        this.code = "";
        this.text = "";
    }

    return this instanceof check ? null : new check ( variable );
}

extend ( check.prototype, {

    /**
        or ()
    
        Return Type:
        Object(check)
    
        Description:
        "||"条件连接符（默认为"&"条件连接符）
    
        URL doc:
        http://icejs.org/######
    */
    or () {
      	if ( /^\|\|$/.test ( this.condition [ this.condition.length - 1 ] ) ) {
            throw checkErr ( "condition", "不能连续调用“or()”" );
        }
        this.condition.push ( "||" );

        return this;
    },
	
	/**
        prior ( priorCb:Function )
    
        Return Type:
        Object(check)
    
        Description:
        优先判断的条件，相当于“()”
    
        URL doc:
        http://icejs.org/######
    */
	prior ( priorCb ) {
    	let i = this.condition.push ( "prior" ) - 1,
            priorCondition;
    	priorCb ( this );
		priorCondition = this.condition.splice ( i, this.condition.length - i );

    	check.compare.call ( this, [ check.calculate ( priorCondition.slice ( 1 ) ) ], _var => _var );

        return this;
    },

    /**
        ifNot ( code: String, text: String )
    
        Return Type:
        Object(check)
    
        Description:
        设置条件不成立时抛出的错误信息
    
        URL doc:
        http://icejs.org/######
    */
    ifNot ( code, text ) {
        this.code = code;
        this.text = text;

        return this;
    },

    /**
        check ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        改变条件判断变量
    
        URL doc:
        http://icejs.org/######
    */
    check ( variable ) {
        this.target = variable;

        return this;
    },

    /**
        do ()
    
        Return Type:
        Object(check)
    
        Description:
        执行判断
        如果判断不通过则抛出ifNot设置的提示
    
        URL doc:
        http://icejs.org/######
    */
    // [true, "&&", false, "||", true]
    do () {
        
        // 如果值为false则抛出错误
        if ( !check.calculate ( this.condition ) ) {
            throw argErr ( this.code, this.text );
        }
    },

    /**
        be ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "===" 条件
    
        URL doc:
        http://icejs.org/######
    */
    be ( ...vars ) {
        check.compare.call ( this, vars, _var => {
			return this.target === _var;
        } );
		
        return this;
    },

    /**
        notBe ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "!==" 条件
    
        URL doc:
        http://icejs.org/######
    */
    notBe ( ...vars ) {
        check.compare.call ( this, vars, _var => {
			return this.target !== _var;
        } );

        return this;
    },

    /**
        type ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型相等条件
    
        URL doc:
        http://icejs.org/######
    */
    type ( ...strs ) {
        check.compare.call ( this, strs, str => {
			return type ( this.target ) === str;
        } );

        return this;
    },

    /**
        notType ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型不相等条件
    
        URL doc:
        http://icejs.org/######
    */
    notType ( ...strs ) {
        check.compare.call ( this, strs, _var => {
			return type ( this.target ) !== _var;
        } );

        return this;
    },
} );

extend ( check, {
	compare ( vars, compareFn ) {
		Array.prototype.push.apply ( this.condition, 
            ( type ( this.condition [ this.condition.length - 1 ] ) === "boolean" ? [ "&&" ] : [] )
            .concat ( ( () => {
          		let res;
                foreach ( vars, _var => {
                    res = res || compareFn ( _var );
                } );

                return res;
        	} ) () ) 
        );
    },

	calculate ( condition ) {
        if ( condition.length === 0 ) {
        	throw checkErr ( "condition", "没有设置检查条件" );
        }
        else if ( /^\|\|$/.test ( condition [ condition.length - 1 ] ) ) {
        	throw checkErr ( "condition", "\"or()\"应该需要紧跟条件，而不能作为最后的条件调用方法" );
        }
        else if ( condition.length % 2 === 1 ) {
            let res = condition [ 0 ];
            for ( let i = 0; condition [ i ] !== undefined; i += 2 ) {
                switch ( condition [ i+1 ] ) {
                    case "&&":
                        res = res && condition [ i+2 ];
                        break;
                    case "||":
                        res = res || condition [ i+2 ];
                        break;
                }
            }
          	
          	return res;
        }
    }
} );