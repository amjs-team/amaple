import { attr } from "../../../func/node";
import { type } from "../../../func/util";
import event from "../../../event/core";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	
	name : "model",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
	before () {
        const 
        	support = {
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
            vm = this.tmpl.getViewModel (),
            nodeName = elem.nodeName,
            inputType = ( elem.attr ( "type" ) || "" ).toLowerCase (),

            // 如果是复选框则数据要以数组的形式表现
            handler = nodeName === "INPUT" && inputType === "checkbox" ? function () {
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
        if ( ( nodeName === "INPUT" && support.input.type.indexOf ( inputType ) !== -1 ) || support.input.nodeName.indexOf ( nodeName ) !== -1 ) {
            elem.bindEvent ( "input", handler );
        }
        else if ( ( nodeName === "INPUT" && support.change.inputType.indexOf ( inputType ) !== -1 ) || support.change.nodeName.indexOf ( nodeName ) !== -1 ) {

        	// 将相同model的radio控件分为一组
        	if ( inputType === "radio" ) {
            	elem.attr ( "name", expr );
            }
          
            elem.bindEvent ( "change", handler );
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
    	const
        	tval = type ( val ),
            elem = this.node,
        	nodeName = elem.nodeName,
            inputType = ( elem.attr ( "type" ) || "" ).toLowerCase ();

		// 对radio的处理
    	if ( tval === "string" && nodeName === "INPUT" && inputType === "radio" ) {
        	if ( elem.attr ( "value" ) === val ) {
                elem.attr ( "checked", true );
            }
            else {
                elem.attr ( "checked", false );
            }
        }
    	
    	// 对checkbox的处理
    	else if ( tval === "array" && nodeName === "INPUT" && inputType === "checkbox" ) {
        	if ( val.indexOf ( elem.attr ( "value" ) !== -1 ) {
            	elem.attr ( "checked", true );
            }
        	else {
            	elem.attr ( "checked", false );
            }
        }
    	
    	// 其他控件的处理
    	else {
        	elem.attr ( "value", val );
        }
    }
} );