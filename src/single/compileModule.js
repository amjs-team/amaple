import singleAttr from "./singleAttr";
import check from "../check";

const 

	// 模块编译正则表达式
	rmodule 	= /^<Module[\s\S]+<\/Module>/,
	rmoduleAttr = /^\s*(<Module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/,
	rend 		= /^\s*>/,

	rtemplate 	= /<template>([\s\S]+)<\/template>/,
	rstyle 		= /<style(?:.*?)>([\s\S]*)<\/style>/,
	rscript 	= /<script(?:.*?)>([\s\S]+)<\/script>/,
    rvmName 	= /([a-zA-Z$_]{1}[\w$]*)\s*=\s*ice\s*\.\s*module/,

	rblank 		= />(\s+)</g,
	rtext 		= /["'\/&]/g,
    risScoped 	= /^<style(?:.*?)scoped(?:.*?)/i,
    raddScoped 	= /\s*([^/@%{}]+)\s*{[^{}]+}/g,
	rnoscoped 	= /^(from|to)\s*$/i,
	rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g,
	raddModuleName = /ice\s*\.\s*module\s*\(/,

	// 模块属性名
	attrBelong 	= ":belong",
	attrTitle 	= ":title";

/**
	compileModule ( moduleString: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://icejs.org/######
*/
export default function compileModule ( moduleString ) {
	if ( rmodule.test ( moduleString ) ) {
		let attrMatch, viewMatch, styleMatch, scriptMatch,
			attrs = {},
			view, style, script, vmName;

		// 匹配出Module标签内的属性
		while ( !rend.test ( moduleString ) ) {
			attrMatch = rmoduleAttr.exec ( moduleString );
			if ( attrMatch ) {
				attrs [ attrMatch [ 2 ] ] = attrMatch [ 3 ] || attrMatch [ 4 ] || "";
				moduleString = moduleString.substr ( attrMatch [ 0 ].length );
			}
			else {
				break;
			}
		}

		// 匹配模板
		viewMatch = rtemplate.exec ( moduleString );
		if ( viewMatch ) {
			moduleString = moduleString.replace ( viewMatch [ 0 ], "" );
			view = ( viewMatch [ 1 ] || "" ).trim ();

			// 去除所有标签间的空格，并转义"和'符号
			view = view.replace ( rblank, ( match, rep ) => match.replace ( rep, "" ) );
			view = view.replace ( rtext, match => "\\" + match );
		}

		// 匹配样式
		styleMatch = rstyle.exec ( moduleString );
		if ( styleMatch ) {
			moduleString = moduleString.replace ( styleMatch [ 0 ], "" );

        	if ( risScoped.test ( styleMatch [ 0 ] ) ) {
            	const placeholder = "{{style}}";

				style = ( styleMatch [ 1 ] || "" ).trim ();
				styleMatch [ 0 ] = styleMatch [ 0 ].replace ( styleMatch [ 1 ], placeholder );

				// 为每个样式添加模块前缀以达到控制范围的作用
				style = style.replace ( raddScoped, ( match, rep ) => match.replace (rep, rnoscoped.test ( rep ) ? rep : `[${ singleAttr.aModule }=${ attrs [ attrBelong ] }] ` + rep ) );

				style = styleMatch [ 0 ].replace ( placeholder, style );
            }
			else {
            	style = styleMatch [ 0 ];
            }

            // 去除所有标签间的空格
            style = style.replace ( rstyleblank, match => match.replace ( /\s+/g, "" ) );
		}

		// 匹配js脚本
		scriptMatch = rscript.exec ( moduleString );
		if ( scriptMatch ) {

			script = ( scriptMatch [ 1 ] || "" ).trim ();
        	vmName = rvmName.exec ( script ) [ 1 ];
			script = script.replace ( raddModuleName, match => `${ match }"${ attrs [ attrBelong ] }",` );
		}

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check ( attrs [ "belong" ] ).notBe ( "", null, undefined ).ifNot ( "module:belong", "<Module>内的belong为必须属性，它代表所属的模块名" ).do ();
		check ( view ).notBe ( "" ).ifNot ( "module:template", "<Module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局" ).do ();
		check ( script ).notBe ( "" ).ifNot ( "module:script", "<Module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局" ).do ();

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		moduleString = `var belong="${ attrs [ attrBelong ] }",title="${ attrs [ attrTitle ] || "" }",view="${ view }${ style }";html(module, view, function(){${ script };cache.pushDirection(directionKey,{vm:${ vmName },title:title});});return title;`;
	}
  
	return new Function ( "ice", "module", "html", "cache", "directionKey", moduleString );
}