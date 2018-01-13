import { type, foreach } from "../../../func/util";
import { noUnitHook } from "../../../var/const";

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
        const exprMatch = this.expr.match ( /^(.*?):(.*)$/ );

        this.attrName = exprMatch [ 1 ];
        this.expr = exprMatch [ 2 ];

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if ( /^{{\s*(\S+)\s*}}$/.test ( this.expr ) ) {
            this.expr = this.expr.replace ( /{{\s*(.*?)\s*}}/g, ( match, rep ) => rep );
        }

        // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
        else {
            this.expr = this.expr.replace ( /{{\s*(.*?)\s*}}/g, ( match, rep ) => `" + ${ rep } + "` );
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
        const 
            node = this.node,
            tval = type ( val );

        // 特殊处理
        // 绑定style属性时可传入对象，键为样式名的驼峰式，值为样式值
        if ( this.attrName === "style" ) {
            if ( tval === "object" ) {
                const styleArray = [];
                let num;

                foreach ( val, ( v, k ) => {
                    // 将驼峰式变量名转换为横杠式变量名
                    k = k.replace ( /[A-Z]/g, match => "-" + match.toLowerCase () );

                    // 如果值为数字并且不是NaN，并且属性名不在noUnitHook中的，需添加”px“
                    num = parseInt ( v );
                    v += type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( k ) === -1 ? "px" : "";
                    styleArray.push ( k + ":" + v );
                } );

                node.attr ( this.attrName, styleArray.join ( ";" ) );
            }
        }
        // 绑定元素的class时可传入数组，绑定渲染时会自动用空格隔开
        else if ( this.attrName === "class" ) {
            if ( tval === "array" ) {
                node.attr ( this.attrName, val.join ( " " ) );
            }
            else {
                node.attr ( this.attrName, ( val === undefined || val === null ? "" : val ).toString () );
            }
        }
        else {
            node.attr ( this.attrName, ( val === undefined || val === null ? "" : val ).toString () );
        }
    }
};