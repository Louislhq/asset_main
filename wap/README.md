### xxx项目

	/ 根目录
	|_ dest 发行目录
	|_ dev 开发目录
		|_ img
			|_ default 不合并图片
			|_ sprite 合并图片
		|_ js
			|_ default 不合并js
			|_ merge 合并js
		|_ less
			|_ app 不合并js
				|_ mod 组件化css
				|_ page	页面css
			|_ core 雪碧图
			|_ lib 通用和混合less
	|_ doc 静态文档
	|_ demo.html 页面模板
	|_ package.json 依赖管理

	项目中dev/img可以删除demo.png