<template>
	<y-modal
		ref="yModalRef"
		v-model:visible="props.visible"
		:modal="false"
		:movable="false"
		:multiple="props.multiple"
		:title="props.title"
		:position="state.position"
		:modalAppendToBody="true"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:appendToBody="true"
		:width="props.width"
		:showClose="props.showClose"
		@update:visible="updateVisible"
		@opened="opened"
		@closed="closed"
	>
		<slot></slot>
		<template v-slot:footer>
			<slot name="footer"></slot>
		</template>
	</y-modal>
</template>

<script lang="ts" setup name="tlbsInfoModal">
import { ref, defineProps, inject, Ref, reactive, nextTick, watch, PropType, defineEmits, defineExpose, onBeforeUnmount } from 'vue';

// 定义变量内容
const emits = defineEmits(['update:visible', 'opened', 'closed']);
const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		default: '提示',
	},
	// 地图中心点经纬度
	center: {
		type: Object as PropType<TMap.LatLng>,
		default: () => ({ lat: 23.080530450149343, lng: 113.25634499231897 }),
	},
	// 是否支持打开多个
	multiple: {
		type: Boolean,
		default: true,
	},
	// 宽度
	width: {
		type: String,
		default: '400px',
	},
	// 是否显示关闭按钮
	showClose: {
		type: Boolean,
		default: true,
	},
});
const state = reactive({
	position: {
		top: '0',
		left: '0',
	},
	modalId: 'xx',
});
const map = inject<Ref<TMap.Map>>('map');
const yModalRef = ref();
let el = null as HTMLElement | null;

watch(
	() => props.visible,
	() => {
		if (props.visible) {
			updateDOM();
			moveMapDrag();
			mapZoom();
			mapResize();
		} else {
			destroyedMapDrag();
			destroyedMapZoom();
			destroyedMapResize();
		}
	},
	{
		immediate: true,
	}
);

onBeforeUnmount(() => {
	const parentNode = el?.parentNode as HTMLElement;
	removeWithTransition(parentNode);
});

// methods
// 自定义信息窗口 - 继承DOMOverlay
function updateDOM() {
	nextTick(() => {
		if (!map?.value) return;
		if (!props.center) return;
		const el = yModalRef.value?.modal.dialogContentRef.$el;
		if (el) {
			// 经纬度坐标转容器像素坐标
			const pixel = map.value.projectToContainer(new TMap.LatLng(props.center.lat, props.center.lng));
			// 获取最内侧dialog弹窗可视高度可视宽度
			const clientWidth = el.clientWidth;
			const clientHeight = el.clientHeight;
			// 中心点对齐经纬度坐标点
			const left = pixel.getX() - clientWidth / 2 + 13 + 'px';
			const top = pixel.getY() - clientHeight - 12 + 'px';
			state.position = {
				top,
				left,
			};
		}
	});
}

// 地图容器大小发生变化时触发
function mapResize() {
	map?.value.on('resize', () => {
		updateDOM();
	});
}

function destroyedMapResize() {
	map?.value.off('resize', () => {});
}

// 地图缩放事件
function mapZoom() {
	map?.value.on('zoom', () => {
		updateDOM();
	});
}

// 销毁缩放事件
function destroyedMapZoom() {
	map?.value.off('zoom', () => {});
}

// 地图移动事件
function moveMapDrag() {
	map?.value.on('drag', () => {
		// alert(1);
		updateDOM();
	});
}

// 销毁地图移动事件
function destroyedMapDrag() {
	map?.value.off('drag', () => {});
}
// 手动删除dialog动画
function removeWithTransition(el: HTMLElement, duration = 300) {
	if (!el) return;

	// 添加淡出 class，触发动画
	el.style.transition = `opacity ${duration}ms`;
	el.style.opacity = '1';

	// 触发重绘
	void el.offsetWidth;

	// 设置为透明（触发过渡）
	el.style.opacity = '0';

	// 等动画完成后再移除
	setTimeout(() => {
		el.parentNode?.removeChild(el);
	}, duration);
}

function updateVisible(visible: boolean) {
	emits('update:visible', visible);
}

function opened() {
	el = yModalRef.value?.modal.dialogContentRef.$el;
	state.modalId = el.parentNode.attributes['aria-describedby'].value;

	emits('opened');
}

function closed() {
	emits('closed');
}

defineExpose({
	yModalRef,
});
</script>
