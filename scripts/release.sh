#!/usr/bin/env bash
set -e

if [[ -z $1 ]]; then
	read -p "请输入发布版本号: " version
else
	version=$1
fi

if [[ $version =~ ^[0-9]\.[0-9]\.[0-9]$ ]]; then
	echo "v${version}正在发布中..."

	echo "正在检查代码..."
	# 校验
	npm run lint

	echo "正在构建发布版本库..."
	# 构建
	rollup -c scripts/build.js --environment VERSION:$version

	echo "正在提交发布版本到GitHub..."
	# 提交版本
	# git add -A
	# git commit -m "build: release v$version"
	npm version $version --message "build: release v$version"

	echo "正在发布版本..."
	# 发布到npm
	git push --tag
	git push origin master
	npm publish

	# 生成版本信息
	node ./scripts/createReleaseMsg.js $version
	echo "发布完成！"
else
	echo "版本号格式错误，它应该为'[Major].[Minor].[Revision]'"
fi