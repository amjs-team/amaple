import { attr } from "../../../func/node";
import { type, foreach } from "../../../func/util";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( "expr", {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
	before () {

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if ( /^{{\s*(\S+)\s*}}$/.test ( this.expr ) ) {
            this.expr = this.expr.replace ( /{{\s*(.*?)\s*}}/g, ( match, rep ) => rep );
        }

        // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
        else {
            this.expr = this.expr.replace ( /{{\s*(.*?)\s*}}/g, ( match, rep ) => "\" + " + rep + " + \"" );
            this.expr = "\"" + this.expr + "\"";
        }
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        “{{ express }}”表达式对应的视图更新方法
        该表达式可用于标签属性与文本中
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( val ) {
        let nodeName = this.node.nodeName.toLowerCase (),
            tval = type ( val );

        if ( tval !== "object" && tval !== "array" ) {
            this.node.nodeValue = val;
        }
        else {

            // 特殊处理
            // 绑定style属性时可传入对象，键为样式名的驼峰式，值为样式值
            if ( nodeName === "style" ) {
                if ( tval === "object" ) {
                    let noUnitHook = [ "z-index" ],
                        styleArray = [], num;
                    foreach ( val, ( v, k ) => {
                        // 将驼峰式变量名转换为横杠式变量名
                        k = k.replace ( /[A-Z]/g, match => "-" + match.toLowerCase () );

                        // 如果值为数字并且不是NaN，并且属性名不在noUnitHook中的，需添加”px“
                        num = parseInt ( v );
                        v += type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( k ) === -1 ? "px" : "";
                        styleArray.push ( k + ":" + v );
                    } );

                    this.node.nodeValue = styleArray.join ( ";" );
                }
            }
            // 绑定元素的class时可传入数组，绑定渲染时会自动用空格隔开
            else if ( nodeName === "class" ) {
                if ( tval === "array" ) {
                    this.node.nodeValue = val.join ( " " );
                }
            }
        }
    }
} );