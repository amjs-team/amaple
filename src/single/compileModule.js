import { isEmpty, foreach } from "../func/util";
import { transformCompName } from "../func/private";
import iceAttr from "./iceAttr";
import { attr } from "../func/node";
import Module from "../core/Module";
import check from "../check";


/**
	parseModuleAttr ( moduleStrng: String, parses: Object )

	Return Type:
	String
	解析后的模块字符串

	Description:
	解析出模板根节点的属性值

	URL doc:
	http://icejs.org/######
*/
function parseModuleAttr ( moduleString, parses ) {
	const
		rend = /^\s*>/,
		rmoduleAttr = /^\s*(<Module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/;

	let attrMatch;

	parses.attrs = {};

	// 匹配出Module标签内的属性
	while ( !rend.test ( moduleString ) ) {
		attrMatch = rmoduleAttr.exec ( moduleString );
		if ( attrMatch ) {
			parses.attrs [ attrMatch [ 2 ] ] = attrMatch [ 3 ] || attrMatch [ 4 ] || "";
			moduleString = moduleString.substr ( attrMatch [ 0 ].length );
		}
		else {
			break;
		}
	}

	return moduleString;
}


/**
	parseTemplate ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板内容

	URL doc:
	http://icejs.org/######
*/
function parseTemplate ( moduleString, parses ) {
	const 
		rtemplate = /<template>([\s\S]+)<\/template>/,
		rblank = />(\s+)</g,
		rtext = /["'\/&]/g,

		viewMatch = rtemplate.exec ( moduleString );


	if ( viewMatch ) {
		moduleString = moduleString.replace ( viewMatch [ 0 ], "" );
		parses.view = ( viewMatch [ 1 ] || "" ).trim ();

		// 去除所有标签间的空格，并转义"和'符号
		parses.view = parses.view.replace ( rblank, ( match, rep ) => match.replace ( rep, "" ) ).replace ( rtext, match => "\\" + match );
	}

	return moduleString;
}


/**
	parseStyle ( moduleString: String, identifier: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板样式

	URL doc:
	http://icejs.org/######
*/
function parseStyle ( moduleString, identifier, parses ) {

	const
		rstyle = /<style(?:.*?)>([\s\S]*)<\/style>/,
		risScoped = /^<style(?:.*?)scoped(?:.*?)/i,
		raddScoped = /\s*([^/@%{}]+)\s*{[^{}]+}/g,
		rnoscoped = /^(from|to)\s*$/i,
		rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g,

		styleMatch = rstyle.exec ( moduleString );

	if ( styleMatch ) {
		moduleString = moduleString.replace ( styleMatch [ 0 ], "" );

    	if ( risScoped.test ( styleMatch [ 0 ] ) ) {
        	const placeholder = "{{style}}";

			parses.style = ( styleMatch [ 1 ] || "" ).trim ();
			styleMatch [ 0 ] = styleMatch [ 0 ].replace ( styleMatch [ 1 ], placeholder );

			// 为每个样式添加模块前缀以达到控制范围的作用
			parses.style = parses.style.replace ( raddScoped, ( match, rep ) => match.replace (rep, rnoscoped.test ( rep ) ? rep : `[${ Module.identifier }=${ identifier }] ` + rep ) );

			parses.style = styleMatch [ 0 ].replace ( placeholder, parses.style );
        }
		else {
        	parses.style = styleMatch [ 0 ];
        }

        // 去除所有标签间的空格
        parses.style = parses.style.replace ( rstyleblank, match => match.replace ( /\s+/g, "" ) );
	}

	return moduleString;
}


/**
	parseScript ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板脚本

	URL doc:
	http://icejs.org/######
*/
function parseScript ( moduleString, scriptPaths, scriptNames, parses ) {

	const 
		rscript = /<script(?:.*?)>([\s\S]+)<\/script>/,
		rscriptComment = /\/\/(.*?)\n|\/\*([\s\S]*?)\*\//g,
		rimport = /(?:(?:var|let|const)\s+)?([A-Za-z$_][\w$]+)\s*=\s*import\s*\(\s*"(.*?)"\s*\)\s*(?:,|;)/g,
		rhtmlComment = /<!--(.*?)-->/g,
		rmoduleDef 	= /new\s*ice\s*\.\s*Module\s*\(/,
		raddComponents = new RegExp ( rmoduleDef.source + "\\s*\\{" ),

		scriptMatch = rscript.exec ( moduleString ),
		scripts = {};


	if ( scriptMatch ) {

		const matchScript = ( scriptMatch [ 1 ] || "" ).replace ( rscriptComment, match => "" );

		// 获取import的script
		parses.script = matchScript.replace ( rimport, ( match, rep1, rep2 ) => {
			scripts [ rep1 ] = rep2;
			return "";
		} ).trim ();

		// 如果有引入组件则将组件传入new ice.Module中
    	if ( !isEmpty ( scripts ) ) {

    		// 去掉注释的html的代码
    		const matchView = parses.view.replace ( rhtmlComment, match => "" );

    		foreach ( scripts, ( path, name ) => {

    			// 只有在view中有使用的component才会被使用
    			if ( new RegExp ( "<\s*" + transformCompName ( name, true ) ).test ( matchView ) ) {
    				scriptPaths.push ( `"${ path }"` );
    				scriptNames.push ( name );
    			}
    		} );

    		// 需要组件时才将组件添加到对应模块中
    		if ( !isEmpty ( scriptNames ) ) {
    			parses.script = parses.script.replace ( raddComponents, match => match + `depComponents:function(){return [${ scriptNames.join( "," ) }];},` );
    		}
    	}

		parses.script = parses.script.replace ( rmoduleDef, match => `${ match }fragment,` );
	}

	return moduleString;
}



/**
	compileModule ( moduleString: String, identifier: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://icejs.org/######
*/
export default function compileModule ( moduleString, identifier ) {

	// 模块编译正则表达式
	const rmodule = /^<Module[\s\S]+<\/Module>/;
	if ( rmodule.test ( moduleString ) ) {
		
		const
			parses = {},
			scriptNames = [],
			scriptPaths = [];

		// 解析出Module标签内的属性
		moduleString = parseModuleAttr ( moduleString, parses );

		// 解析模板
		moduleString = parseTemplate ( moduleString, parses );

		// 解析样式
		moduleString = parseStyle ( moduleString, identifier, parses );

		// 解析js脚本
		moduleString = parseScript ( moduleString, scriptPaths, scriptNames, parses );
		

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check ( parses.view )
			.notBe ( "" )
			.ifNot ( "module:template", "<Module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局" )
			.do ();

		check ( parses.script )
			.notBe ( "" )
			.ifNot ( "module:script", "<Module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局" )
			.do ();

		const buildView = `var div=document.createElement("div"),fragment=document.createDocumentFragment(),nodes=[];div.innerHTML=view;nodes=Array.prototype.slice.call(div.childNodes);for(var i=0;i<nodes.length;i++){fragment.appendChild(nodes[i]);}`;

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		moduleString = `var title="${ parses.attrs [ iceAttr.title ] || "" }",view="${ parses.view }${ parses.style }";`;

		if ( !isEmpty ( scriptPaths ) ) {
			moduleString += `require([${ scriptPaths.join ( "," ) }], function(${ scriptNames.join ( "," ) }){${ buildView }${ parses.script };html(moduleNode,fragment);});`;
		}
		else {
			moduleString += `${ buildView }${ parses.script };html(moduleNode,fragment);`
		}

		moduleString += "return title;";
	}
  
	return new Function ( "ice", "moduleNode", "html", "require", moduleString );
}