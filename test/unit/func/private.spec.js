import * as p from "func/private";

describe ( "Function trimHTML =>", () => {
	it ( "Function trimHTML will trim the blank between two common elements", () => {
		let html = `<div>
			<span>hello Amaple</span>
			<ul>
				<li>1<li>
				<li>2<li>
				<li>3<li>
			</ul>
		</div>`;

		console.log ( p.trimHTML ( html ) );
		expect ( p.trimHTML ( html ) ).toBe ( "<div><span>hello Amaple</span><ul><li>1<li><li>2<li><li>3<li></ul></div>" )
	} );

	it ( "Function trimHTML do not trim blank in <pre>", () => {
		let html = `<div>
<span>hello Amaple</span>
<pre>
<code class="javascript">
var a = 1;
</code>
</pre>
</div>`;

		expect ( p.trimHTML ( html ) ).toBe ( `<div><span>hello Amaple</span><pre>
<code class="javascript">
var a = 1;
</code>
</pre></div>` );
	} );
} );