import { argErr } from "./error";
import { type, extend } from "./func/util";

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
	this.target = variable;
    this.condition = [];

    this.code = "";
    this.text = "";

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
        this.bools.push ( "||" );

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
        let res = false;
        if ( this.condition.length === 0 ) {
            this.text = "没有设置检查条件";
        }
        else if ( /^\|\|$/.test ( this.condition [ this.condition.length - 1 ] ) ) {
            this.text = "\"or()\"应该需要紧跟条件，而不能作为最后的条件调用方法";
        }
        else if ( this.condition.length % 2 === 1 ) {
            res = this.condition [ 0 ];
            for ( let i = 0; this.condition [ i ]; i += 2 ) {
                switch ( this.condition [ i+1 ] ) {
                    case "&&":
                        res = res && this.condition [ i+2 ];
                        break;
                    case "||":
                        res = res || this.condition [ i+2 ];
                        break;
                }
            }
        }

        // 如果为res的值为false则抛出错误
        if ( !res ) {
            throw argErr ( this.code, this.text );
        }
    },

    /**
        toBe ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "===" 条件
    
        URL doc:
        http://icejs.org/######
    */
    toBe ( variable ) {
        Array.prototype.push.apply ( this.bools, 
            ( type ( this.bools [ length - 1 ] ) === "boolean" ? [ "&&" ] : [] )
            .concat ( [ variable === this.target ] ) 
        );

        return this;
    },

    /**
        toNotBe ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "!==" 条件
    
        URL doc:
        http://icejs.org/######
    */
    toNotBe ( variable ) {
        Array.prototype.push.apply ( this.bools, 
            ( type ( this.bools [ length - 1 ] ) === "boolean" ? [ "&&" ] : [] )
            .concat ( [ variable !== this.target ] ) 
        );

        return this;
    },

    /**
        toType ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型相等条件
    
        URL doc:
        http://icejs.org/######
    */
    toType ( string ) {
        Array.prototype.push.apply ( this.bools, 
            ( type ( this.bools [ length - 1 ] ) === "boolean" ? [ "&&" ] : [] )
            .concat ( [ string === type ( this.target ) ] ) 
        );

        return this;
    },

    /**
        toNotType ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型不相等条件
    
        URL doc:
        http://icejs.org/######
    */
    toNotType ( string ) {
        Array.prototype.push.apply ( this.bools, 
            ( type ( this.bools [ length - 1 ] ) === "boolean" ? [ "&&" ] : [] )
            .concat ( [ string !== type ( this.target ) ] ) 
        );

        return this;
    },
} );