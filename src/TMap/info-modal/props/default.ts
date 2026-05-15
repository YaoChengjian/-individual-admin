/**
 * 增加的属性
 */
export const proProps = {
	// 是否可以拖动
	// movable: {
	// 	type: Boolean,
	// 	default: true,
	// },
	// 是否可以拖出边界
	moveOut: {
		type: Boolean,
		default: false,
	},
	// 如果可以拖出边界是否只允许下右拖出
	moveOutPositive: {
		type: Boolean,
		default: false,
	},
	// 是否可以拉伸
	resizable: {
		type: [Boolean, String],
		default: () => false,
	},
	// 是否显示最大化切换按钮
	maxable: {
		type: Boolean,
		default: false,
	},
	// 是否支持打开多个
	multiple: {
		type: Boolean,
		default: false,
	},
	// 是否默认全屏
	fullscreen: Boolean,
	// 是否在弹窗关闭后重置位置和大小
	resetOnClose: {
		type: Boolean,
		default: true,
	},
	// 是否垂直居中
	centered: {
		type: Boolean,
		default: false,
	},
	// 遮罩层是否适配 keepAlive
	maskKeepAlive: {
		type: Boolean,
		default: true,
	},
	// 初始位置
	position: [String, Object],
};

export const elCommonProps = {
	// margin-top 值
	top: {
		type: String,
		default: '15vh',
	},
	// 是否需要遮罩层
	// modal: {
	//   type: Boolean,
	//   default: true
	// },
	// 遮罩层是否插入至 body 元素上
	// modalAppendToBody: {
	// 	type: Boolean,
	// 	default: true,
	// },
	// 是否插入至 body 元素上
	// appendToBody: Boolean,
	// 是否将 body 滚动锁定
	lockScroll: {
		type: Boolean,
		default: true,
	},
	// 为 Dialog 启用可拖拽功能
	// draggable: {
	//     type: Boolean,
	//     default: true
	// },
	// // 拖动范围可以超出可视区
	// overflow: {
	//     type: Boolean,
	//     default: true
	// },
	// 自定义类名
	customClass: String,
	// 是否可以通过点击 modal 关闭
	// closeOnClickModal: {
	// 	type: Boolean,
	// 	default: true,
	// },
	// // 是否可以通过按下 ESC 关闭
	// closeOnPressEscape: {
	// 	type: Boolean,
	// 	default: true,
	// },
	// 是否显示关闭按钮
	showClose: {
		type: Boolean,
		default: true,
	},
	// 关闭时销毁子元素
	destroyOnClose: Boolean,
};

export const elProps = {
	...elCommonProps,
	// 是否显示
	visible: Boolean,
	// 标题
	title: String,
	// 宽度
	width: {
		type: String,
		default: '50%',
	},
	// 关闭前的回调
	beforeClose: Function,
	// 是否对头部和底部采用居中布局
	center: Boolean,
};

export const commonProps = {
	...elCommonProps,
	...proProps,
};

export default {
	...elProps,
	...proProps,
};
