import { isEmpty, foreach, noop } from "../../func/util";
import { transformCompName, stringToVNode, trimHTML } from "../../func/private";
import { TYPE_COMPONENT, amAttr } from "../../var/const";
import { moduleErr } from "../../error";
import check from "../../check";
import configuration from "../../core/configuration/core";


function isEnd ( match ) {
	return /^}/.test ( match );
}

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
		if ( attrMatch && attrMatch [ 2 ] ) {
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
		viewMatch = rtemplate.exec ( moduleString );

	let view;
	if ( viewMatch ) {
		moduleString = moduleString.replace ( viewMatch [ 0 ], "" );
		view = ( viewMatch [ 1 ] || "" ).trim ();

		// 去除所有标签间的空格
		parses.view = trimHTML ( view );
	}

	return moduleString;
}

/**
	removeCssBlank ( css: String )

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
	parseSiblingCss ( css: String )

	Return Type:
	Array
	解析后的CSS AST数组

	Description:
	解析单层CSS样式
	当碰到@media时，将会递归调用此函数

	URL doc:
	http://amaple.org/######
*/

function parseSiblingCss ( css ) {
	const
		styles = [],
		rselector = /[^/@{}]+?/,
		rkeyframes = /@(?:-\w+-)?keyframes\s+\w+/,
		rmedia = /@media.*?/,
		rcssparser = new RegExp ( `\\s*(?:(${ rselector.source }|${ rkeyframes.source }|${ rmedia.source })\\s*{([\\s\\S]+?)}|})`, "g" );

	let selectorItem = {},
		atContext = "",
		hierarchy = 0;

	try {
		css.replace ( rcssparser, ( match, selector, content ) => {
			if ( !atContext ) {
				content = content.trim ();
	
				// css选择器为普通选择器时
				if ( new RegExp ( `^${ rselector.source }` ).test ( selector ) ) {
					styles.push ( {
						selector,
						content : removeCssBlank ( content )
					} );
				}
	
				// css选择器为@keyframes或@media时
				else {
					if ( rkeyframes.test ( selector ) ) {
						atContext = "keyframes";
					}
					else if ( rmedia.test ( selector ) ) {
						atContext = "media";
					}
	
					styles.push ( selectorItem );
					selectorItem.selector = selector;
					selectorItem.content = removeCssBlank ( content + "}" );
				}
			}
			else {
				match = match.trim ();
				if ( isEnd ( match ) ) {
					if ( hierarchy > 0 ) {
						selectorItem.content += match;
						hierarchy --;
					}
					else {
	
						// 当css项为@media时，需对它的内部选择器做范围样式的处理
						if ( /media/.test ( atContext ) ) {
							selectorItem.content = parseSiblingCss ( selectorItem.content );
						}
						atContext = "";
						selectorItem = {};
					}
					return "";
				}
	
				// 表示层次，当层级为内层时遇到结束符将不会结束
				if ( new RegExp ( `${ rkeyframes.source }|${ rmedia.source }` ).test ( selector ) ) {
					hierarchy ++;
				}
				selectorItem.content += removeCssBlank ( match );
			}
		} );
	}
	catch ( e ) {
		throw moduleErr ( "css-parse", "css解析错误，请检查模块css并确保其语法完全正确" );
	}

	return styles;
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
		rcssComment = /\/\*([\s\S]*?)\*\//g,
		styleMatch = rstyle.exec ( moduleString );

	if ( styleMatch ) {
		moduleString = moduleString.replace ( styleMatch [ 0 ], "" );

		let style;
    	if ( risScoped.test ( styleMatch [ 0 ] ) ) {
			style = ( styleMatch [ 1 ] || "" ).trim ().replace ( rcssComment, "" );

			// 解析每个css项并保存到parsers.style中
			parses.style = parseSiblingCss ( style );
        }
		else {

			// 去除所有标签间的空格
        	parses.style = removeCssBlank ( styleMatch [ 1 ] ).trim ();
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
		rnewModule = /new\s*am\s*\.\s*Module\s*\(/,
		rmoduleDef = new RegExp ( rnewModule.source + "\\s*([^\\s)]+)?" ),

		// 匹配模块生命周期对象为实体
		rlifeCycleEntity = new RegExp ( rnewModule.source + "\\s*{" ),

		// 匹配模块生命周期对象为一个变量或为空
		rlifeCycleVarOrEmpty = new RegExp ( rnewModule.source + "\\s*(.*)?\\s*\\)" ),
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
    			const depString = `depComponents:[${ deps.join ( "," ) }]`;
    			let lifeCycleMatch;
    			if ( lifeCycleMatch = parses.script.match ( rlifeCycleEntity ) ) {
    				parses.script = parses.script.replace ( lifeCycleMatch [ 0 ], match => match + depString + "," );
    			}
    			else if ( lifeCycleMatch = parses.script.match ( rlifeCycleVarOrEmpty ) ) {
    				if ( lifeCycleMatch [ 1 ] ) {
    					parses.script = parses.script.replace ( rlifeCycleVarOrEmpty, ( match, rep ) => {
    						return match.replace ( rep, `args.extend(${ rep }, {${ depString }})` );
    					} );
    				}
    				else {
    					parses.script = parses.script.replace ( rnewModule, match => `${ match }{${ depString }}` );
    				}
    			}
    		}
    	}

		parses.script = parses.script.replace ( rmoduleDef, ( match, rep ) => {
			if ( rep ) {

				// 适用于“new am.Module ( {...} )”的moduleNode增加
				return match.replace ( rep, `args.moduleNode,${ rep }` );
			}
			else {

				// 适用于“new am.Module ()”的moduleNode增加
				return `${ match }args.moduleNode`;
			}
		} );
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
	const 
		rmodule = /<module[\s\S]+<\/module>/i,
		scopedCssObject = {};

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
		moduleFragment = stringToVNode ( parses.view, parses.style, scopedCssObject );

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
				args.end();
			},${ TYPE_COMPONENT });`;
		}
		else {
			moduleString += `${ buildView }
			${ parses.script };
			args.end();`;
		}
	}

	const updateFn = new Function ( "am", "args", moduleString );
	updateFn.moduleFragment = moduleFragment;
	return { updateFn, title, scopedCssObject };
}