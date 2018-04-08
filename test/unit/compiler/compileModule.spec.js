import compileModule from "src/compiler/moduleCompiler/compileModule";

describe ( "Parse amaple module => ", () => {

	it ( "module contains <template>, <script> and <style>", () => {
		const 
			module = 
			`<module :title="amaple module">
				<template>
					<span>Hello Amaple</span>
					<button id="btn">Greet</button>
				</template>
				<script>
					new am.Module ();
				</script>
				<style scoped>
					span {
						font-size: 20px;
						color: red;
					}
					#btn {
						padding: 10px 15px;
						border: solid 1px #ddd;
					}
				</style>
			</module>`,
			{ updateFn, title, scopedCssObject } = compileModule ( module );

		expect ( updateFn ).toEqual ( jasmine.any ( Function ) );
		expect ( title ).toBe ( "amaple module" );
		expect ( scopedCssObject.selectors ).toEqual ( [ "span", "#btn" ] );
	} );

	it ( "module without <script> and <style>", () => {
		const module = 
			`<module :title="amaple module">
				<template>
					<span>Hello Amaple</span>
					<button id="btn">Greet</button>
				</template>
			</module>`;

		expect ( () => {
			compileModule ( module );
		} ).toThrow ();
	} );

	it ( "module template with inner <template> element", () => {
		const 
			module = 
			`<module :title="amaple module">
				<template>
					<template :if="show">
						<span>Hello Amaple</span>
						<button id="btn">Greet</button>
					</template>
				</template>
				<script>
					new am.Module ( {
						init: function () {
							return {
								show: true
							};
						}
					} );
				</script>
				<style scoped>
					span {
						font-size: 20px;
						color: red;
					}
					#btn {
						padding: 10px 15px;
						border: solid 1px #ddd;
					}
				</style>
			</module>`,
			{ updateFn, title, scopedCssObject } = compileModule ( module );

		expect ( updateFn ).toEqual ( jasmine.any ( Function ) );
		expect ( title ).toBe ( "amaple module" );
		expect ( scopedCssObject.selectors ).toEqual ( [ "span", "#btn" ] );
	} );

	it ( "module global style", () => {
		const 
			module = 
			`<module :title="amaple module">
				<template>
					<span>Hello Amaple</span>
					<button id="btn">Greet</button>
				</template>
				<script>
					new am.Module ( );
				</script>
				<style>
					span {
						font-size: 20px;
						color: red;
					}
					#btn {
						padding: 10px 15px;
						border: solid 1px #ddd;
					}
				</style>
			</module>`,
			{ updateFn, title, scopedCssObject } = compileModule ( module );

		expect ( updateFn ).toEqual ( jasmine.any ( Function ) );
		expect ( title ).toBe ( "amaple module" );

		// 全局样式时，scopedCssObject为空
		expect ( scopedCssObject ).toEqual ( {} );
	} );

	it ( "module scoped style contains '@keyframes' and '@media'", () => {
		const 
			module = 
			`<module :title="amaple module">
				<template>
					<span>Hello Amaple</span>
					<button id="btn">Greet</button>
				</template>
				<script>
					new am.Module ();
				</script>
				<style scoped>
					span {
						font-size: 20px;
						color: red;
						animation: am 1s;
					}
					@keyframes am {
						from {
							width: 100px;
						}
						to {
							width: 200px;
						}
					}
					@-webkit-keyframes am {
						from {
							width: 100px;
						}
						to {
							width: 200px;
						}
					}
					@media screen and (min-width: 768px) {
						span {
							color: green;
							animation: am 1s;
						}
						@-webkit-keyframes am {
							0% {
								width: 100px;
							}
							90% {
								width: 200px;
							}
						}
					}
				</style>
			</module>`,
			{ updateFn, title, scopedCssObject } = compileModule ( module );

		expect ( updateFn ).toEqual ( jasmine.any ( Function ) );
		expect ( scopedCssObject.selectors ).toEqual ( [ "span" ] );
	} );
} );