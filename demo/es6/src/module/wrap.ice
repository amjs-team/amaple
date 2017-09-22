<Module :title="首页">
	<template>
		<div ice-module="header" ice-src="header.index"></div>
		<div ice-module="main" ice-src="main.index" :onrequest="reqBefore" :onresponse="reqAfter"></div>
		<div ice-module="footer" ice-src="footer.index"></div>
	</template>

	<style scoped>
		[ice-module=header] {
			background: #fff;
		}
		[ice-module=root] [ice-module=footer] {
			background: #000;
		}
	</style>

	<script>
		new ice.Module ();
	</script>
</Module>