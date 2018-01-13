import { isEmpty, foreach } from "../../func/util";
import { transformCompName, stringToScopedVNode } from "../../func/private";
import { TYPE_COMPONENT, amAttr } from "../../var/const";
import { moduleErr } from "../../error";
import check from "../../check";
import configuration from "../../core/configuration/core";


/**
	parseModuleAttr ( moduleStrng: String, parses: Object )

	Return Type:
	String
	解析后的模块字符串

	Description:
	解析出模板根节点的属性值

	URL doc:
	http://amaple.org/######
*/
function parseModuleAttr ( moduleString, parses ) {
	const
		rend = /^\s*>/,
		rmoduleAttr = /^\s*(<module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/i;

	let attrMatch;

	parses.attrs = {};

	// 匹配出module标签内的属性
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
	http://amaple.org/######
*/
function parseTemplate ( moduleString, parses ) {
	const 
		rtemplate = /<template>([\s\S]+)<\/template>/i,
		rblank = />(\s+)</g,
		rtext = /"/g,
		rwrap = /\r?\n\s*/g,

		viewMatch = rtemplate.exec ( moduleString );

	let view;
	if ( viewMatch ) {
		moduleString = moduleString.replace ( viewMatch [ 0 ], "" );
		view = ( viewMatch [ 1 ] || "" ).trim ();

		// 去除所有标签间的空格，并将"转换为'符号
		view = view
		.replace ( rblank, ( match, rep ) => match
			.replace ( rep, "" ) )
		.replace ( rtext, match => "'" )
		.replace ( rwrap, match => "" );

		parses.view = view;
	}

	return moduleString;
}

/**
	parseStyle ( css: String )

	Return Type:
	String
	处理后的css字符串

	Description:
	移除css空白符

	URL doc:
	http://amaple.org/######
*/
function removeCssBlank ( css ) {
	const rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g;
	return css.replace ( rstyleblank, match => match.replace ( /\s+/g, "" ) );
}


/**
	parseStyle ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板样式

	URL doc:
	http://amaple.org/######
*/
function parseStyle ( moduleString, parses ) {

	const
		rstyle = /<style(?:.*?)>([\s\S]*)<\/style>/i,
		risScoped = /^<style(?:.*?)scoped(?:.*?)/i,
		rselector = /[^/@{}]+?/,
		rkeyframes = /@(?:-\w+-)?keyframes\s+\w+/,
		rcssparser = new RegExp ( `\\s*(${ rselector.source }|${ rkeyframes.source })\\s*{([\\s\\S]+?)}`, "g" ),
		ranimateScoped = /^(from|to|\d+%)\s*$/i,

		styleMatch = rstyle.exec ( moduleString );

	if ( styleMatch ) {
		moduleString = moduleString.replace ( styleMatch [ 0 ], "" );

		let style;
    	if ( risScoped.test ( styleMatch [ 0 ] ) ) {
			style = ( styleMatch [ 1 ] || "" ).trim ();

			// 解析每个css项并保存到parsers.style中
			parses.style = [];
			let keyframesItem;
			style = style.replace ( rcssparser, ( match, selector, content ) => {
				content = content.trim ();

				// css选择器为普通选择器时
				if ( new RegExp ( `^${ rselector.source }` ).test ( selector ) ) {
					if ( ranimateScoped.test ( selector ) ) {
						keyframesItem.content += `${ selector }{${ removeCssBlank ( content ) }}`;
					}
					else {
						if ( keyframesItem ) {
							parses.style.push ( keyframesItem );
							keyframesItem = undefined;
						}
						parses.style.push ( {
							selector,
							content : removeCssBlank ( content )
						} );
					}
				}

				// css选择器为@keyframes时
				else if ( rkeyframes.test ( selector ) ) {
					if ( keyframesItem ) {
						parses.style.push ( keyframesItem );
					}
					keyframesItem = {
						selector, 
						content : removeCssBlank ( content + "}" )
					};
				}
			} );
        }
		else {

			// 去除所有标签间的空格
        	style = removeCssBlank ( styleMatch [ 1 ] );
        }
	}
	else {
		parses.style = "";
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
	http://amaple.org/######
*/
function parseScript ( moduleString, scriptPaths, scriptNames, parses ) {

	const 
		rscript = /<script(?:.*?)>([\s\S]+)<\/script>/i,
		rscriptComment = /\/\/(.*?)\r?\n|\/\*([\s\S]*?)\*\//g,
		rimport = /\s*(?:(?:(?:var|let|const)\s+)?(.+?)\s*=\s*)?import\s*\(\s*["'](.*?)["']\s*\)(?:\s*[,;])?/g,
		rcomponent = /\s*(?:(?:(?:var|let|const)\s+)?(.+?)\s*=\s*)?am\s*\.\s*class\s*\(\s*["'`].+?["'`]\s*\)\s*\.\s*extends\s*\(\s*am\s*\.\s*Component\s*\)/,
		rhtmlComment = /<!--(.*?)-->/g,
		rmoduleDef 	= /new\s*am\s*\.\s*Module\s*\(/,
		raddComponents = new RegExp ( rmoduleDef.source + "\\s*\\{" ),

		scriptMatch = rscript.exec ( moduleString ),
		scripts = {};


	if ( scriptMatch ) {
		const matchScript = ( scriptMatch [ 1 ] || "" ).replace ( rscriptComment, match => "" );

		// 获取import的script
		parses.script = matchScript.replace ( rimport, ( match, scriptName, scriptPath ) => {
			if ( !scriptName ) {
				throw moduleErr ( "import", `import("${ scriptPath }")返回的组件衍生类需被一个变量接收，否则可能因获取不到此组件而导致执行出错` );
			}
			// scripts [ scriptName ] = scriptPath;
			scriptNames.import.push ( scriptName );
			scriptPaths.push ( scriptPath );
			return "";
		} ).trim ();

		parses.script = parses.script.replace ( rcomponent, ( match, rep ) => {
			scriptNames.native.push ( rep );
			return match.replace ( rep, `${ rep }=window.${ rep }` );
		} );

		// 如果有引入组件则将组件传入new am.Module中
		const allScriptNames = scriptNames.native.concat ( scriptNames.import );
    	if ( !isEmpty ( allScriptNames ) ) {

    		// 去掉注释的html的代码
    		const matchView = parses.view.replace ( rhtmlComment, match => "" );
    		const deps = [];
    		foreach ( allScriptNames, name => {

    			// 只有在view中有使用的component才会被此module依赖
    			if ( new RegExp ( "<\s*" + transformCompName ( name, true ) ).test ( matchView ) ) {
    				deps.push ( name );
    			}
    		} );

    		// 需要组件时才将组件添加到对应模块中
    		if ( !isEmpty ( deps ) ) {
    			parses.script = parses.script.replace ( raddComponents, match => match + `depComponents:[${ deps.join ( "," ) }],` );
    		}
    	}

		parses.script = parses.script.replace ( rmoduleDef, match => `${ match }args.moduleNode,` );
	}
	else {
		parses.script = "";
	}

	return moduleString;
}


/**
	compileModule ( moduleString: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://amaple.org/######
*/
export default function compileModule ( moduleString ) {

	// 模块编译正则表达式
	const rmodule = /^<module[\s\S]+<\/module>/i;
	let title = "",
		moduleFragment;
	if ( rmodule.test ( moduleString ) ) {
		
		const
			parses = {},
			scriptNames = { native: [], import: [] },
			scriptPaths = [];

		// 解析出Module标签内的属性
		moduleString = parseModuleAttr ( moduleString, parses );

		// 解析模板
		moduleString = parseTemplate ( moduleString, parses );
		title = parses.attrs [ amAttr.title ] || "";

		// 解析样式
		moduleString = parseStyle ( moduleString, parses );

		// 解析js脚本
		moduleString = parseScript ( moduleString, scriptPaths, scriptNames, parses );
		

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check ( parses.view )
			.notBe ( "" )
			.ifNot ( "module:template", "<module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局" )
			.do ();

		check ( parses.script )
			.notBe ( "" )
			.ifNot ( "module:script", "<module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局" )
			.do ();

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 编译局部样式
		moduleFragment = stringToScopedVNode ( parses.view, parses.style );

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		const buildView = `args.signCurrentRender();
			var nt=new args.NodeTransaction().start ();
			nt.collect(args.moduleNode);
			args.moduleNode.html(args.moduleFragment);`;
		moduleString = "";
		if ( !isEmpty ( scriptPaths ) ) {
			let addToWindow = "",
				delFromWindow = "";
			foreach ( scriptNames.import, name => {
				addToWindow += `window.${ name }=${ name };`;
			} );
			foreach ( scriptNames.native.concat ( scriptNames.import ), name => {
				delFromWindow += `delete window.${ name };`;
			} );

			const componentBaseURL = configuration.getConfigure ( "baseURL" ).component;
			foreach ( scriptPaths, ( path, i ) => {
				scriptPaths [ i ] = `"${ componentBaseURL + path }"`;
			} );

			moduleString += `args.require([${ scriptPaths.join ( "," ) }],function(${ scriptNames.import.join ( "," ) }){
				${ addToWindow }
				${ buildView }
				${ parses.script };
				${ delFromWindow }
				nt.commit();
				args.flushChildren();
			},${ TYPE_COMPONENT });`;
		}
		else {
			moduleString += `${ buildView }
			${ parses.script };
			nt.commit();
			args.flushChildren();`;
		}
	}

	const updateFn = new Function ( "am", "args", moduleString );
	updateFn.moduleFragment = moduleFragment;
	return { updateFn, title };
}