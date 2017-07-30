import { attr } from "../../../func/node";
import event from "../../../event/core";

export default {

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
        let support = {
            input : {
                nodeName : "TEXTAREA",
                type : "text, password, color, search, week, date, datetime-local, month, time, email, range, tel, url"
            },
            change : {
                nodeName : "SELECT",
                inputType : "radio, checkbox"
            }
        },
        elem = this.node,
        expr = this.expr,
        vm = this.vm,
        nodeName = elem.nodeName.toUpperCase (),
        type = attr ( elem, "type" ).toLowerCase (),

        // 如果是复选框则数据要以数组的形式表现
        handler = nodeName === "INPUT" && type === "checkbox" ? function () {
            vm [ expr ] = vm [ expr ] || [];
            if ( this.checked ) {
                vm [ expr ].push ( this.value );
            }
            else {
                vm [ expr ].splice ( vm [ expr ].indexOf ( this.value ), 1 );
            }
        } : 
        function () {
            vm [ expr ] = this.value;
        };

        // 判断支持input事件的元素名称或对应type的input元素
        if ( ( nodeName === "INPUT" && support.input.type.indexOf ( type ) !== -1 ) || nodeName.indexOf ( support.input.nodeName ) !== -1 ) {
            event ( elem, "input", handler );
        }
        else if ( ( nodeName === "INPUT" && support.change.type.indexOf ( type ) !== -1 ) || nodeName.indexOf ( support.change.nodeName ) !== -1 ) {
            event ( elem, "change", handler );
        }
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        表单元素双向绑定方法
    
        URL doc:
        http://icejs.org/######
    */
	update ( val ) {
        this.node.value = val;
    }
};