import { defineComponent, inject, onUnmounted, PropType, Ref, toRaw, watch, render, h } from 'vue-demi';
import useEventListener from './composables/useEventListener';
import { prefix } from './config';

export default defineComponent({
	name: `${prefix}InfoWindow`,
	props: {
		visible: {
			type: Boolean,
			default: true,
		},
		position: {
			type: Object as PropType<TMap.LatLngData>,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		// 其他初始化配置
		options: {
			type: Object as PropType<TMap.InfoWindowOptions>,
			default: () => ({}),
		},
	},
	setup(props, context) {
		const map = inject<Ref<TMap.Map>>('map');
		if (!map) {
			return;
		}

		const infoWindow = new TMap.InfoWindow({
			...props.options,
			map: toRaw(map.value),
			position: new TMap.LatLng(props.position.lat, props.position.lng),
			content: props.content,
		});

		infoWindow.on('closeclick', () => {
			context.emit('close');
		});

		if (props.visible) {
			infoWindow.open();
			context.emit('open');
			renderSlotToHtml();
		} else {
			infoWindow.close();
			context.emit('close');
		}

		// 绑定图层事件
		useEventListener(infoWindow, context);
		// 调用图层销毁方法
		onUnmounted(() => {
			infoWindow.destroy();
		});

		watch(
			() => props.visible,
			(visible) => {
				if (visible) {
					context.emit('open');
					infoWindow.open();
					renderSlotToHtml();
				} else {
					context.emit('close');
					infoWindow.close();
				}
			}
		);

		watch(
			() => props.position,
			(position) => {
				infoWindow.setPosition(new TMap.LatLng(position.lat, position.lng));
			}
		);

		watch(
			() => props.content,
			(content) => {
				infoWindow.setContent(content);
			}
		);

		function renderSlotToHtml() {
			// 1. 获取默认插槽内容
			const vnodeDefault = context.slots?.default?.();
			// 2. 创建一个临时的 DOM 容器
			const container = document.createElement('div');
			// 3. 使用 Vue 的 render API，把 VNode 渲染成真实 DOM
			render(h('div', vnodeDefault), container);
			// 4. 获取 HTML 字符串
			const htmlContentDefault = container.innerHTML;
			infoWindow.setContent(htmlContentDefault || props.content);
		}

		// 提供给ref实例使用
		return {
			infoWindow,
		};
	},
	render() {
		return null;
	},
});
