/* eslint-disable no-loss-of-precision */
import proj4 from 'proj4';
import gcoord from 'gcoord';
import coordtransform from 'coordtransform';

// Define WGS-84 and CGCS2000 coordinate systems
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:4534', '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4535', '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4536', '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4537', '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4538', '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4539', '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4540', '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4541', '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4542', '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4543', '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4544', '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4545', '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4546', '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4547', '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4548', '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4549', '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4550', '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4551', '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4552', '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4553', '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4554', '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:2435', '+proj=tmerc +lat_0=0 +lon_0=113.3333333333333 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');

// 广州2000
const gz2000 = proj4('+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +towgs84=15.8,-154.4,-82.3 +ellps=krass +units=m +no_defs');
// GZ2000 与 2435 的转换参数
const GZ2000_TO_2435 = {
	x: 385455.970368639,
	y: 2330057.18710631,
	m: 3.58872253802822e-6,
	r: -0.00484909724489578,
};

const T2345_TO_GZ2000 = {
	x: -374151.464765618,
	y: -2331890.52174604,
	m: -3.59216301315524e-6,
	r: 0.00484909724486718,
};

export default function useConversion() {
	/**
	 * WGS84 坐标（EPSG:4326）转换为 CGCS2000 高斯投影坐标
	 *
	 * @param coordsArr - 输入坐标数组，格式为：
	 *   [
	 *     { lat: number, lng: number },
	 *     { lat: number, lng: number }
	 *   ]
	 *
	 * @returns 转换后的坐标数组，格式为：
	 *   [
	 *     { lng: number, lat: number, epsg: string },
	 *     { lng: number, lat: number, epsg: string }
	 *   ]
	 *
	 * @description
	 * - 自动根据经度计算所属 **3°投影带**，匹配对应 EPSG 代码 (EPSG:4534 ~ EPSG:4554)。
	 * - 内部使用 `proj4` 进行坐标系转换。
	 * - 返回值包含：投影坐标 (lng, lat) 以及所使用的 EPSG 编码。
	 * - 如果输入点超出 CGCS2000 范围，返回 `null`。
	 *
	 * @example
	 * const input = [
	 *   { lat: 39.9042, lng: 116.4074 }, // 北京
	 *   { lat: 31.2304, lng: 121.4737 }  // 上海
	 * ];
	 */
	const wgs84ToCgcs2000 = (coordsArr: { lat: number; lng: number }[]) => {
		const wgs84 = 'EPSG:4326'; // 用字符串，不用 defs()

		const cgcsCoords = coordsArr
			.map((point) => {
				let { lat, lng } = point;
				if (isNaN(lat) || !isFinite(lat) || isNaN(lng) || !isFinite(lng)) return null;

				// 计算 3 度带号
				const NN: number = Math.floor((lng + 1.5) / 3);
				let cgcsSystem = '';
				switch (NN) {
					case 25:
						cgcsSystem = 'EPSG:4534';
						break;
					case 26:
						cgcsSystem = 'EPSG:4535';
						break;
					case 27:
						cgcsSystem = 'EPSG:4536';
						break;
					case 28:
						cgcsSystem = 'EPSG:4537';
						break;
					case 29:
						cgcsSystem = 'EPSG:4538';
						break;
					case 30:
						cgcsSystem = 'EPSG:4539';
						break;
					case 31:
						cgcsSystem = 'EPSG:4540';
						break;
					case 32:
						cgcsSystem = 'EPSG:4541';
						break;
					case 33:
						cgcsSystem = 'EPSG:4542';
						break;
					case 34:
						cgcsSystem = 'EPSG:4543';
						break;
					case 35:
						cgcsSystem = 'EPSG:4544';
						break;
					case 36:
						cgcsSystem = 'EPSG:4545';
						break;
					case 37:
						cgcsSystem = 'EPSG:4546';
						break;
					case 38:
						cgcsSystem = 'EPSG:4547';
						break;
					case 39:
						cgcsSystem = 'EPSG:4548';
						break;
					case 40:
						cgcsSystem = 'EPSG:4549';
						break;
					case 41:
						cgcsSystem = 'EPSG:4550';
						break;
					case 42:
						cgcsSystem = 'EPSG:4551';
						break;
					case 43:
						cgcsSystem = 'EPSG:4552';
						break;
					case 44:
						cgcsSystem = 'EPSG:4553';
						break;
					case 45:
						cgcsSystem = 'EPSG:4554';
						break;
					default:
						cgcsSystem = 'NULL';
				}

				if (cgcsSystem === 'NULL') return null;

				// 直接用字符串作为坐标系
				const result = proj4(wgs84, cgcsSystem, [lng, lat]);
				return { lng: result[0], lat: result[1], epsg: cgcsSystem };
			})
			.filter((pt) => pt !== null);

		return cgcsCoords;
	};

	/**
	 * @description WGS84 转 广州2000
	 * @param {Array<{ lat: number, lng: number }>} coordsArr 坐标数组
	 * @returns {Array<{ lat: number, lng: number }>} 转换后的广州2000坐标
	 */
	function wgs84ToGz2000(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr.map((item) => {
			const point: [number, number] = [item.lng, item.lat];
			const gisPoint = wgs84ToChina(point);

			const x = T2345_TO_GZ2000.x + (1 + T2345_TO_GZ2000.m) * (Math.cos(T2345_TO_GZ2000.r) * gisPoint[0] - Math.sin(T2345_TO_GZ2000.r) * gisPoint[1]);
			const y = T2345_TO_GZ2000.y + (1 + T2345_TO_GZ2000.m) * (Math.sin(T2345_TO_GZ2000.r) * gisPoint[0] + Math.cos(T2345_TO_GZ2000.r) * gisPoint[1]);

			return { lng: x, lat: y };
		});
	}

	/**
	 * @description WGS84 转 GCJ02
	 * @param coordsArr 坐标数组 [{ lat, lng }]
	 * @returns 转换后的 GCJ02 坐标数组 [{ lat, lng }]
	 */
	function wgs84ToGcj02(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || !isFinite(lat) || isNaN(lng) || !isFinite(lng)) {
					return null; // 无效坐标过滤掉
				}

				// gcoord.transform([lng, lat], WGS84, GCJ02)
				const [outLng, outLat] = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.GCJ02);
				return { lat: outLat, lng: outLng };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null); // 类型守卫
	}

	/**
	 * WGS84 -> BD09 坐标转换
	 * @param coordsArr 输入坐标数组 [{ lat, lng }]
	 * @returns 输出坐标数组 [{ lat, lng }]
	 */
	function wgs84ToBd09(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lng) || !isFinite(lng) || isNaN(lat) || !isFinite(lat)) {
					return null;
				}
				const [outLng, outLat] = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.BD09);
				return { lng: outLng, lat: outLat };
			})
			.filter(Boolean) as { lat: number; lng: number }[];
	}

	/**
	 * 将 CGCS2000 投影坐标（EPSG:4547，第 38 带）转换为 WGS84 经纬度坐标
	 *
	 * @param coordsArr - 输入的坐标数组，每个元素为 { lat, lng }。
	 *   - lat: 北坐标 (Northing)，单位：米
	 *   - lng: 东坐标 (Easting)，单位：米
	 *
	 * @returns 转换后的坐标数组，每个元素为：
	 *   - { lng, lat, epsg }
	 *     - lng: 转换后的经度
	 *     - lat: 转换后的纬度
	 *     - epsg: 使用的投影坐标系（此处固定为 EPSG:4547）
	 *
	 * @example
	 * const cgcsCoords = [
	 *   { lat: 3400000, lng: 500000 }, // CGCS2000 东北坐标
	 * ];
	 * const result = cgcs2000ToWgs84(cgcsCoords);
	 * result = [{ lng: 113.123, lat: 34.456, epsg: 'EPSG:4547' }]
	 */
	function cgcs2000ToWgs84(coordsArr: { lat: number; lng: number }[]) {
		const cgcs = 'EPSG:4547'; // 用字符串而不是 proj4.defs
		const wgs84 = 'EPSG:4326';
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lng) || !isFinite(lng) || isNaN(lat) || !isFinite(lat)) {
					return null;
				}
				const [outLng, outLat] = proj4(cgcs, wgs84, [lng, lat]);
				return { lng: outLng, lat: outLat, epsg: 'EPSG:4547' };
			})
			.filter(Boolean);
	}

	/**
	 * @description CGCS2000 转 GZ2000。先转换 WGS84，再转换 GZ2000
	 * @param coordsArr CGCS2000坐标数组
	 */
	function cgcs2000ToGz2000(coordsArr: { lat: number; lng: number }[]) {
		const wgsCoords = cgcs2000ToWgs84(coordsArr); // 这里返回 { lat, lng }[]
		return wgs84ToGz2000(wgsCoords as { lat: number; lng: number }[]);
	}

	/**
	 * @description 将 CGCS2000 坐标数组转换为 GCJ02 坐标
	 * @param coordsArr - 输入的 CGCS2000 坐标数组，格式为 [{ lat: number; lng: number }]
	 * @returns 转换后的 GCJ02 坐标数组，格式为 [{ lat: number; lng: number }]
	 */
	function cgcs2000toGcj02(coordsArr: { lat: number; lng: number }[]) {
		return wgs84ToGcj02(cgcs2000ToWgs84(coordsArr) as { lat: number; lng: number }[]);
	}

	/**
	 * @description CGCS2000 转 BD09
	 * @param coordsArr 输入 CGCS2000 坐标数组 [{ lat, lng }]
	 * @returns 转换后的 BD09 坐标数组 [{ lat, lng }]
	 */
	function cgcs2000ToBd09(coordsArr: { lat: number; lng: number }[]) {
		const wgs84Coords = cgcs2000ToWgs84(coordsArr)
			.filter((c): c is { lat: number; lng: number; epsg: string } => c !== null)
			.map((c) => ({ lat: c.lat, lng: c.lng })); // 去掉 epsg 字段

		return wgs84ToBd09(wgs84Coords);
	}

	/**
	 * @description 广州2000 坐标数组 转 WGS84 坐标数组
	 * @param coordsArr 广州2000 坐标数组 [{ lat, lng }]
	 * @returns WGS84 坐标数组 [{ lat, lng }]
	 */
	function gz2000ToWgs84(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || isNaN(lng)) return null;

				let x: number, y: number;

				// 判断坐标顺序
				if (!identifyCoordinates([lng, lat])) {
					x = GZ2000_TO_2435.x + (1 + GZ2000_TO_2435.m) * (Math.cos(GZ2000_TO_2435.r) * lat - Math.sin(GZ2000_TO_2435.r) * lng);
					y = GZ2000_TO_2435.y + (1 + GZ2000_TO_2435.m) * (Math.sin(GZ2000_TO_2435.r) * lat + Math.cos(GZ2000_TO_2435.r) * lng);
				} else {
					x = GZ2000_TO_2435.x + (1 + GZ2000_TO_2435.m) * (Math.cos(GZ2000_TO_2435.r) * lng - Math.sin(GZ2000_TO_2435.r) * lat);
					y = GZ2000_TO_2435.y + (1 + GZ2000_TO_2435.m) * (Math.sin(GZ2000_TO_2435.r) * lng + Math.cos(GZ2000_TO_2435.r) * lat);
				}

				const wgs = chinaToWgs84([x, y]);
				return { lat: wgs[1], lng: wgs[0] };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null);
	}

	/**
	 * @description 广州2000 坐标数组 转 CGCS2000 坐标数组
	 *              广州2000 → WGS84 → CGCS2000
	 * @param coordsArr 广州2000 坐标数组 [{ lat, lng }]
	 * @returns CGCS2000 坐标数组 [{ lat, lng }]
	 */
	function gz2000ToCgcs2000(coordsArr: { lat: number; lng: number }[]) {
		// 先转 WGS84
		const wgs84Coords = gz2000ToWgs84(coordsArr);

		// 再转 CGCS2000
		const cgcs2000Coords = wgs84ToCgcs2000(wgs84Coords);

		return cgcs2000Coords;
	}

	/**
	 * @description 广州2000 转 GCJ02。先转 Cgcs2000，再 Cgcs2000 转 GCJ02。
	 * @param coordsArr 广州2000坐标数组
	 */
	function gz2000ToGcj02(coordsArr: { lat: number; lng: number }[]) {
		// 先转 CGCS2000
		const cgcs2000Coords = gz2000ToCgcs2000(coordsArr);

		// 再转 GCJ02
		return cgcs2000toGcj02(cgcs2000Coords as { lat: number; lng: number }[]);
	}

	/**
	 * @description 广州2000 转 BD09。先转 Cgcs2000，再 Cgcs2000 转 BD09。
	 * @param coordsArr 广州2000坐标数组
	 */
	function gz2000ToBd09(coordsArr: { lat: number; lng: number }[]) {
		// 1. 先转 CGCS2000
		const cgcs2000Coords = gz2000ToCgcs2000(coordsArr);

		// 2. 再转 BD09
		return cgcs2000ToBd09(cgcs2000Coords as { lat: number; lng: number }[]);
	}

	/**
	 * @description GCJ02 坐标数组 转换为 WGS84 坐标数组
	 * @param coordsArr GCJ02 坐标数组 [{ lat, lng }]
	 * @returns WGS84 坐标数组 [{ lat, lng }]
	 */
	function gcj02ToWgs84(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || isNaN(lng)) return null; // 无效坐标过滤掉

				// 使用 coordtransform 转换
				const [wgsLng, wgsLat] = coordtransform.gcj02towgs84(lng, lat);
				return { lat: wgsLat, lng: wgsLng };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null); // 类型守卫，去掉 null
	}

	/**
	 * @description GCJ02 坐标数组转换为 CGCS2000 坐标数组
	 *              先转换为 WGS84，再转换为 CGCS2000
	 * @param coordsArr GCJ02 坐标数组 [{ lat, lng }]
	 * @returns CGCS2000 坐标数组 [{ lat, lng }]
	 */
	function gcj02ToCgcs2000(coordsArr: { lat: number; lng: number }[]) {
		// 先转换为 WGS84
		const wgs84Coords = gcj02ToWgs84(coordsArr);

		// 再转换为 CGCS2000
		const cgcs2000Coords = wgs84ToCgcs2000(wgs84Coords);

		return cgcs2000Coords;
	}

	/**
	 * @description GCJ02 转 GZ2000。先转换 WGS84，再转换 GZ2000
	 * @param coordsArr GCJ02坐标数组
	 */
	function gcj02ToGz2000(coordsArr: { lat: number; lng: number }[]) {
		const wgsCoords = gcj02ToWgs84(coordsArr);
		return wgs84ToGz2000(wgsCoords);
	}

	/**
	 * @description GCJ02 坐标数组 转换为 BD09 坐标数组
	 * @param coordsArr GCJ02 坐标数组 [{ lat, lng }]
	 * @returns BD09 坐标数组 [{ lat, lng }]
	 */
	function gcj02ToBd09(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || isNaN(lng)) return null; // 无效坐标过滤掉

				const [bdLng, bdLat] = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.BD09);
				return { lat: bdLat, lng: bdLng };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null); // 类型守卫
	}

	/**
	 * @description BD-09 坐标数组 转换为 WGS84 坐标数组
	 * @param coordsArr BD-09 坐标数组 [{ lat, lng }]
	 * @returns WGS84 坐标数组 [{ lat, lng }]
	 */
	function bd09ToWgs84(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || isNaN(lng)) return null; // 无效坐标过滤掉

				const [wgsLng, wgsLat] = gcoord.transform([lng, lat], gcoord.BD09, gcoord.WGS84);
				return { lat: wgsLat, lng: wgsLng };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null); // 类型守卫
	}

	/**
	 * @description BD-09 坐标数组转换为 CGCS2000 坐标数组
	 *              先转换为 WGS84，再转换为 CGCS2000
	 * @param coordsArr BD-09 坐标数组 [{ lat, lng }]
	 * @returns CGCS2000 坐标数组 [{ lat, lng }]
	 */
	function bd09ToCgcs2000(coordsArr: { lat: number; lng: number }[]) {
		// 先转换为 WGS84
		const wgs84Coords = bd09ToWgs84(coordsArr);

		// 再转换为 CGCS2000
		const cgcs2000Coords = wgs84ToCgcs2000(wgs84Coords);

		return cgcs2000Coords;
	}

	/**
	 * @description BD09 转 GZ2000。先转换 WGS84，再转换 GZ2000
	 * @param coordsArr BD09坐标数组
	 */
	function bd09ToGz2000(coordsArr: { lat: number; lng: number }[]) {
		const wgsCoords = bd09ToWgs84(coordsArr);
		return wgs84ToGz2000(wgsCoords);
	}

	/**
	 * @description BD-09 坐标数组 转换为 GCJ02 坐标数组
	 * @param coordsArr BD-09 坐标数组 [{ lat, lng }]
	 * @returns GCJ02 坐标数组 [{ lat, lng }]
	 */
	function bd09ToGcj02(coordsArr: { lat: number; lng: number }[]) {
		return coordsArr
			.map(({ lat, lng }) => {
				if (isNaN(lat) || isNaN(lng)) return null; // 无效坐标过滤掉

				const [gcjLng, gcjLat] = gcoord.transform([lng, lat], gcoord.BD09, gcoord.GCJ02);
				return { lat: gcjLat, lng: gcjLng };
			})
			.filter((coord): coord is { lat: number; lng: number } => coord !== null); // 类型守卫
	}

	return {
		wgs84ToCgcs2000,
		wgs84ToGz2000,
		wgs84ToGcj02,
		wgs84ToBd09,

		cgcs2000ToWgs84,
		cgcs2000ToGz2000,
		cgcs2000toGcj02,
		cgcs2000ToBd09,

		gz2000ToWgs84,
		gz2000ToCgcs2000,
		gz2000ToGcj02,
		gz2000ToBd09,

		gcj02ToWgs84,
		gcj02ToCgcs2000,
		gcj02ToGz2000,
		gcj02ToBd09,

		bd09ToWgs84,
		bd09ToCgcs2000,
		bd09ToGz2000,
		bd09ToGcj02,
	};
}

/**
 * 中国投影转 WGS84
 * @param {Array<number>} point [longitude, latitude]
 * @returns {Array<number>} [longitude, latitude]
 */
function chinaToWgs84(point: [number, number]) {
	const wgs84 = proj4.defs('EPSG:4326');
	// 第一个参数传 EPSG 字符串即可
	return proj4(gz2000, wgs84, point);
}

/**
 * WGS84 转中国投影（广州2000）
 * @param point [longitude, latitude]
 * @returns [longitude, latitude]
 */
function wgs84ToChina(point: [number, number]): [number, number] {
	const wgs84 = proj4.defs('EPSG:4326'); // WGS84
	return proj4(wgs84, gz2000, point);
}

/**
 * @description 假设你有一个坐标值为 [424520.2365566101, 2550935.735797668]，判断哪个是 Easting
 */
function identifyCoordinates(coords: Array<any>) {
	const [x, y] = coords; // x 是第一个值，y 是第二个值

	// 判断哪个是 Easting（东坐标），哪个是 Northing（北坐标）
	if (x > y) {
		return false;
	} else {
		return true;
	}
}
