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
    http://amaple.org/######
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
        http://amaple.org/######
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
        http://amaple.org/######
    */
	prior ( priorCb ) {
    	let conditionBackup = this.condition;
        this.condition = [];
    	
    	priorCb ( this );
    	
		Array.prototype.push.apply ( conditionBackup, /^(?:&&|\|\|)$/.test ( conditionBackup [ conditionBackup.length - 1 ] ) ? [ this.condition ] : [ "&&", this.condition ] );
    	this.condition = conditionBackup;

        return this;
    },

    /**
        ifNot ( code: String, text: String )
    
        Return Type:
        Object(check)
    
        Description:
        设置条件不成立时抛出的错误信息
    
        URL doc:
        http://amaple.org/######
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
        http://amaple.org/######
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
        http://amaple.org/######
    */
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
        http://amaple.org/######
    */
    be ( ...vars ) {
        check.compare.call ( this, vars, ( target, _var ) => {
			return target === _var;
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
        http://amaple.org/######
    */
    notBe ( ...vars ) {
        check.compare.call ( this, vars, ( target, _var ) => {
			return target !== _var;
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
        http://amaple.org/######
    */
    type ( ...strs ) {
        check.compare.call ( this, strs, ( target, str ) => {
			return type ( target ) === str;
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
        http://amaple.org/######
    */
    notType ( ...strs ) {
        check.compare.call ( this, strs, ( target, str ) => {
			return type ( target ) !== str;
        } );

        return this;
    },
} );

extend ( check, {
	compare ( vars, compareFn ) {
    	let target = this.target;
		Array.prototype.push.apply ( this.condition, 
            ( type ( this.condition [ this.condition.length - 1 ] ) === "function" ? [ "&&" ] : [] )
            .concat ( () => {
          		let res;
                foreach ( vars, _var => {
                    res = res || compareFn ( target, _var );
                } );

                return res;
        	} )
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
            let res = false,
                symbol, titem, bool;
            foreach ( condition, item => {
            	titem = type ( item );
            	
            	if ( titem !== "string" ) {
            		if ( titem === "array" ) {
                		bool = check.calculate ( item );
                	}
            		else if ( titem === "function" ) {
                		bool = item ();
                	}
                	
                	switch ( symbol ) {
                    	case "&&":
                        	res = res && bool;
                        	break;
                    	case "||":
                        	res = res || bool;
                        	break;
                    	default:
                        	res = bool;
                    }
                }
            	else {
                	if ( ( item === "&&" && res === false ) || ( item === "||" && res === true ) ) {
                        return false;
                    }
                	else {
                		symbol = item;
                    }
                }
            } );
          	
          	return res;
        }
    }
} );