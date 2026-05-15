import { defineComponent, inject, onMounted, onUnmounted, h, PropType, Ref, toRaw, ref, isVue2 } from 'vue-demi';
import { prefix } from './config';

const props = {
	// 图层id
	id: {
		type: String,
		default: 'canvasGroundLayer',
	},
	index: {
		type: Number,
		default: 0,
	},
	// 中心点
	center: {
		type: Array as PropType<Array<number>>,
		required: true,
	},
	// 其他初始化配置
	options: {
		type: Object as PropType<TMap.CanvasGroundLayer>,
		default: () => ({}),
	},
};

if (!isVue2) {
	// @ts-ignore
	props.class = {
		type: String,
		default: '',
	};
	// @ts-ignore
	props.style = {
		type: Object as PropType<Record<string, never>>,
		default: () => ({}),
	};
}

export default defineComponent({
	name: `${prefix}CanvasGroundLayer`,
	props,
	emits: ['init_canvasDom'],
	setup(props, context) {
		const map = inject<Ref<TMap.Map>>('map') as Ref<TMap.Map>;
		const ele = ref<HTMLCanvasElement | null>(null);
		let canvasGroundLayerInstance: TMap.CanvasGroundLayer;
		if (!map) return;

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		onMounted(async () => {
			if (ele.value) {
				// 初始化自定义贴图实例
				canvasGroundLayerInstance = new TMap.CanvasGroundLayer({
					...props.options,
					map: toRaw(map.value),
					canvas: ele.value,
					bounds: getBoundsFromCenter(props.center || [], 50),
				});
				context.emit('init_canvasDom', ele.value, canvasGroundLayerInstance, props.index);
				canvasGroundLayerInstance.setCanvas(ele.value);
			}
		});

		// 调用图层销毁方法
		onUnmounted(() => {
			destroy();
		});

		// 图层销毁方法
		function destroy() {
			canvasGroundLayerInstance?.setMap(null);
		}

		// 围绕某中心点生成LatLngBounds
		function getBoundsFromCenter(center: Array<number>, radiusInMeters: number) {
			const [lat, lng] = center;
			const deltaLat = radiusInMeters / 111000; // 1 deg ≈ 111km
			const deltaLng = radiusInMeters / (111000 * Math.cos((lat * Math.PI) / 180));
			// 获取LatLngBounds地理坐标范围
			return new TMap.LatLngBounds(new TMap.LatLng(lat - deltaLat, lng - deltaLng), new TMap.LatLng(lat + deltaLat, lng + deltaLng));
		}

		// 提供给ref实例使用
		return {
			ele,
			map,
		};
	},
	render() {
		const props = isVue2
			? { ref: `ele` }
			: {
					ref: 'ele',
					// @ts-ignore
					class: this.class,
					// @ts-ignore
					style: this.style,
				};
		return h(
			'canvas',
			{
				...props,
				width: 300,
				height: 300,
			},
			// eslint-disable-next-line no-nested-ternary
			// @ts-ignore
			this.$slots.default && this.map ? (isVue2 ? this.$slots.default : this.$slots.default()) : []
		);
	},
});
