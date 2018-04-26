import { type, foreach } from "../../../func/util";
import { rexpr, noUnitHook } from "../../../var/const";

/**
    toString ( val?:any )

    Return Type:
    String

    Description:
    将val变量转换为字符串，当val为undefined或null时转换为空字符串

    URL doc:
    http://amaple.org/######
*/
function toString ( val ) {
    return ( val === undefined || val === null ? "" : val ).toString ();
}

/**
    arrayToClass ( val?:any )

    Return Type:
    String

    Description:
    绑定元素的class时可传入数组，绑定渲染时会自动用空格隔开

    URL doc:
    http://amaple.org/######
*/
function arrayToClass ( val ) {
    if ( type ( val ) !== "array" ) {
        return ` ${ toString ( val ) } `;
    }
    return ` ${ val.join ( " " ) } `;
}

/**
    objectToStyle ( val?:any )

    Return Type:
    String

    Description:
    特殊处理
    绑定style属性时可传入对象，键为样式名的驼峰式，值为样式值

    URL doc:
    http://amaple.org/######
*/
function objectToStyle ( val ) {
    if ( type ( val ) !== "object" ) {
        return `;${ toString ( val ) }`;
    }
    
    
    const styleArray = [];
    let num;
    foreach ( val, ( v, k ) => {
        // 将驼峰式变量名转换为横杠式变量名
        k = k.replace ( /[A-Z]/g, match => "-" + match.toLowerCase () );

        // 如果值为数字并且不是NaN，并且属性名不在noUnitHook中的，需添加”px“
        num = parseInt ( v );
        v += type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( k ) === -1 ? "px" : "";
        styleArray.push ( `${ k }:${ v };` );
    } );

    return `;${ styleArray.join ( "" ) }`;
}

export default {
	
	name : "attrExpr",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
	before () {
        const 
            exprMatch = this.expr.match ( /^(.*?):(.*)$/ ),
            rexprMatch = new RegExp ( rexpr.source, "g" );

        this.attrName = exprMatch [ 1 ];
        this.expr = exprMatch [ 2 ];
        this.transformFn = this.attrName === "class" ? arrayToClass 
            : this.attrName === "style" ? objectToStyle : toString;

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if ( /^{{\s*(\S+)\s*}}$/.test ( this.expr ) ) {
            this.expr = this.expr.replace ( rexprMatch, ( match, rep ) => `this.transformFn ( ${ rep } )` );
        }

        // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
        else {

            // 每个字符串实体使用()括起来，否则在三元表达式等计算中会出错
            this.expr = this.expr.replace ( rexprMatch, ( match, rep ) => `" + (this.transformFn ( ${ rep } )) + "` );
            this.expr = `"${ this.expr }"`;
        }
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        “{{ express }}”表达式对应的视图更新方法
        该表达式用于元素属性表达式的更新
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://amaple.org/######
    */
	update ( val ) {

        // 去除多余的空格
        if ( this.attrName === "class" ) {
            val = val.trim ().replace ( /\s{2}/, " " );
        }
        
        // 去除多余的分号
        else if ( this.attrName === "style" ) {
            val = val.replace ( /^;/, "" ).replace ( /;{2}/, ";" );
        }
        
        this.node.attr ( this.attrName, val );
    }
};