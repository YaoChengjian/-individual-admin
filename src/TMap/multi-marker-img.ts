import { defineComponent, inject, Ref, isVue2, PropType, onMounted, onUnmounted } from 'vue-demi';
import { prefix } from './config';

const props = {
	height: {
		type: Number,
		default: 30,
	},
	width: {
		type: Number,
		default: 30,
	},
	url: {
		type: String,
		default: '',
	},
	position: {
		type: Object as PropType<TMap.LatLng>,
		default: () => ({ lat: 23.080530450149343, lng: 113.25634499231897 }),
	},
	offset: {
		type: Array<number>,
		default: () => [0, 0],
	},
	zIndex: {
		type: Number,
		default: 10,
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
	name: `${prefix}MultiMarkerImg`,
	props,
	setup(props) {
		// const ele = ref<HTMLImageElement | null>(null);
		const map = inject<Ref<TMap.Map>>('map');
		let img: HTMLImageElement;
		// 声明一个类，继承 DOMOverlay
		class MyOverlay extends TMap.DOMOverlay {
			constructor(options: any) {
				super(options); // 关键，必须调用父类构造器
			}

			onInit() {}

			createDOM() {
				img = document.createElement('img');
				img.src = props.url;
				img.style = `position:absolute;top:0px;left:0px;width:${props.width}px;height:${props.height}px;z-index:${props.zIndex}`;
				return img;
			}

			updateDOM() {
				if (!map?.value) return;
				// 经纬度坐标转转容器像素坐标
				const pixel = map.value.projectToContainer(new TMap.LatLng(props.position.lat, props.position.lng));
				// 使图中心点对齐经纬度坐标点
				const clientWidth = this.dom.clientWidth / 2 - props.offset[0];
				const clientHeight = this.dom.clientHeight / 2 - props.offset[1];
				const left = pixel.getX() - clientWidth + 'px';
				const top = pixel.getY() - clientHeight + 'px';
				const dom = this.dom as HTMLImageElement;
				dom.style.transform = `translate(${left}, ${top})`;
			}
		}

		onMounted(() => {
			new MyOverlay({
				map: map?.value,
				// collisionOptions: {
				// 	sameSource: true,
				// 	crossSource: true,
				// },
			});
		});

		onUnmounted(() => {
			const parentNode = img.parentNode;
			if (parentNode) {
				parentNode.removeChild(img);
			}
		});
		return {
			// ele,
		};
	},
});
