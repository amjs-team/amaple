import { attr } from "../../../func/node";
import { type } from "../../../func/util";
import event from "../../../event/core";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	
	name : "model",

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
            vm = this.tmpl.getViewModel (),
            nodeName = elem.nodeName.toUpperCase (),
            inputType = ( attr ( elem, "type" ) || "" ).toLowerCase (),

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
            event.on ( elem, "input", handler );
        }
        else if ( ( nodeName === "INPUT" && support.change.inputType.indexOf ( inputType ) !== -1 ) || support.change.nodeName.indexOf ( nodeName ) !== -1 ) {

        	// 将相同model的radio控件分为一组
        	if ( inputType === "radio" ) {
            	attr ( elem, "name", expr );
            }
            event.on ( elem, "change", handler );
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
    	let tval = type ( val ),
            elem = this.node,
        	nodeName = elem.nodeName.toUpperCase (),
            inputType = ( attr ( elem, "type" ) || "" ).toLowerCase ();

		// 对radio的处理
    	if ( tval === "string" && nodeName === "INPUT" && inputType === "radio" ) {
        	if ( elem.value === val ) {
                elem.checked = true;
            }
            else {
                elem.checked = false;
            }
        }
    	
    	// 对checkbox的处理
    	else if ( tval === "array" && nodeName === "INPUT" && inputType === "checkbox" ) {
        	if ( val.indexOf ( elem.value ) !== -1 ) {
            	elem.checked = true;
            }
        	else {
            	elem.checked = false;
            }
        }
    	
    	// 其他控件的处理
    	else {
        	elem.value = val;
        }
    }
} );