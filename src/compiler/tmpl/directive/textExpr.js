import { type, foreach } from "../../../func/util";
import VTextNode from "../../../core/vnode/VTextNode";

export default {
	
	name : "textExpr",

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
        const rexpr = /{{\s*(.*?)\s*}}/g;

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if ( /^{{\s*(\S+)\s*}}$/.test ( this.expr ) ) {
            this.expr = this.expr.replace ( rexpr, ( match, rep ) => rep );
        }
        else {

            // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
            // 拼接前先过滤换行符为空格，防止解析出错
            const exprArray = this.expr
                    .replace ( /[\r\n]/g, " " )
                    .replace ( rexpr, ( match, rep ) => `",${ rep },"` );

            // 当组件设置了subElements，且在模板中在同一个文本节点连续输出两个subElements，或subElements与普通文本一起使用时，需按subElements进行分割，然后遍历插入其中
            this.expr = `(function(arr){
                var arr=arr,tempArr=[],ret=[];
                for(var i=0;i<arr.length;i++){
                    if(!arr[i].nodeType){
                        tempArr.push(arr[i]);
                    }
                    else{
                        ret.push(tempArr.join(""),arr[i]);
                        tempArr=[];
                    }
                }
                if(tempArr.length>0) {
                    ret.push(tempArr.join(""));
                }
                return ret.length===1?ret[0]:ret;
            })(["${ exprArray }"])`;
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
        http://amaple.org/######
    */
	update ( val ) {
        const node = this.node;

        if ( type ( val ) !== "array" ) {

            // 定义了组件子元素时，需将组件表达式（nodeType为3）替换为实际传入的dom结构
            if ( val && val.nodeType > 0 && node.nodeType === 3 ) {
                node.parent.replaceChild ( val, node );
            }
            else {
                node.nodeValue = val;
            }
        }
        else {
            const p = node.parent;
            p.clear ();

            foreach ( val, item => {
                item = item.nodeType ? item : VTextNode ( item );
                p.appendChild ( item );
            } );
        }
    }
};