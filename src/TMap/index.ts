// 从vue-demi导出App用于兼容不同vue版本
import { App } from 'vue-demi';
import BaseMap from './map';
import MultiMarker from './multi-marker';
import MultiPolygon from './multi-polygon';
import MultiPolyline from './multi-polyline';
import InfoWindow from './info-window';
import Heat from './heat';
import MarkerCluster from './marker-cluster';
import MultiCircle from './multi-circle';
import CanvasGroundLayer from './canvas-ground-layer';
import MultiLabel from './multi-label';
import InfoModal from './info-modal/index.vue';
import MultiMarkerImg from './multi-marker-img';

const components = [
	BaseMap,
	MultiMarker,
	MultiPolygon,
	MultiPolyline,
	InfoWindow,
	Heat,
	MarkerCluster,
	MultiCircle,
	CanvasGroundLayer,
	MultiLabel,
	InfoModal,
	MultiMarkerImg,
];
// 导出各个组件
export {
	BaseMap,
	MultiMarker,
	MultiPolygon,
	MultiPolyline,
	InfoWindow,
	Heat,
	MarkerCluster,
	MultiCircle,
	CanvasGroundLayer,
	MultiLabel,
	InfoModal,
	MultiMarkerImg,
};

// 提供安装方法
export default {
	install(app: App): void {
		components.forEach((component) => app.component(component.name as string, component));
	},
};
