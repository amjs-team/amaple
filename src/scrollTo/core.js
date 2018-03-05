import { SCROLL_INITIALIZATION, MODULELOADER_EXECUTING } from "./scrollStatus";

let status = SCROLL_INITIALIZATION,
	execting = false,
	position = 0;

/**
	executeScrollStatus ()

	Return Type:
	void

	Description:
	将状态更改为模块执行状态


	URL doc:
	http://amaple.org/######
*/
export function executeScrollStatus () {
	status = MODULELOADER_EXECUTING;
}

/**
	flushScroll ( scrollPosition: Number )

	Return Type:
	void

	Description:
	刷新窗口滚动位置


	URL doc:
	http://amaple.org/######
*/
export function flushScroll ( scrollPosition ) {
	if ( scrollPosition === undefined ) {
		status = SCROLL_INITIALIZATION;
		execting = false;
	}

	scrollPosition = window.parseInt ( scrollPosition || position ) || 0;
	document.documentElement.scrollTop = scrollPosition;
	document.body.scrollTop = scrollPosition;
}

/**
	scrollTo ( position: Number )

	Return Type:
	void

	Description:
	滚动窗口位置
	滚动窗口分别有两种状态：


	URL doc:
	http://amaple.org/######
*/
export default function scrollTo ( scrollPosition ) {
	if ( status === MODULELOADER_EXECUTING ) {
		if ( execting === false ) {
			execting = true;
			position = scrollPosition;
		}
	}

	if ( status === SCROLL_INITIALIZATION ) {
		flushScroll ( scrollPosition );
	}
}