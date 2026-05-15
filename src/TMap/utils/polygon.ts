export function getCenterByBoundingBox(points: { lat: number; lng: number }[]) {
	let minLat = Infinity,
		maxLat = -Infinity;
	let minLng = Infinity,
		maxLng = -Infinity;

	for (const point of points) {
		minLat = Math.min(minLat, point.lat);
		maxLat = Math.max(maxLat, point.lat);
		minLng = Math.min(minLng, point.lng);
		maxLng = Math.max(maxLng, point.lng);
	}

	const centerLat = (minLat + maxLat) / 2;
	const centerLng = (minLng + maxLng) / 2;

	return new TMap.LatLng(centerLat, centerLng); // ✅ 适用于腾讯地图
}

const isLatLngPoint = (point: unknown): point is TMap.LatLng => {
	return Boolean(point && typeof (point as TMap.LatLng).getLat === 'function' && typeof (point as TMap.LatLng).getLng === 'function');
};

export function normalizePolygonPaths(paths?: TMap.LatLng[] | TMap.LatLng[][] | TMap.LatLng[][][]) {
	if (!Array.isArray(paths) || !paths.length) return [] as TMap.LatLng[];

	let flatPaths: unknown = paths;
	while (Array.isArray(flatPaths) && flatPaths.length && Array.isArray(flatPaths[0])) {
		flatPaths = flatPaths[0];
	}

	return Array.isArray(flatPaths) ? flatPaths.filter(isLatLngPoint) : [];
}

/**
 * 获取多边形的中心点
 * @param {TMap.LatLng[]} path - 多边形的点数组
 * @param {boolean} useCentroid - 是否使用几何质心算法（默认 false）
 * @returns {TMap.LatLng} 中心点
 */
export function getPolygonCenter(
	paths?: TMap.LatLng[] | TMap.LatLng[][] | TMap.LatLng[][][],
	useCentroid = false
): TMap.LatLng | undefined {
	const flatPaths = normalizePolygonPaths(paths);
	if (!flatPaths.length) return undefined;

	// --- 这里复用之前的计算逻辑 ---
	if (!useCentroid) {
		const bounds = new TMap.LatLngBounds();
		flatPaths.forEach((p) => bounds.extend(p));
		return bounds.getCenter();
	}

	let area = 0;
	let x = 0,
		y = 0;

	for (let i = 0, j = flatPaths.length - 1; i < flatPaths.length; j = i++) {
		const lat1 = flatPaths[j].getLat(),
			lng1 = flatPaths[j].getLng();
		const lat2 = flatPaths[i].getLat(),
			lng2 = flatPaths[i].getLng();
		const f = lng1 * lat2 - lng2 * lat1;
		x += (lng1 + lng2) * f;
		y += (lat1 + lat2) * f;
		area += f;
	}

	area *= 0.5;
	if (area === 0) {
		const bounds = new TMap.LatLngBounds();
		flatPaths.forEach((p) => bounds.extend(p));
		return bounds.getCenter();
	}

	const cx = x / (6 * area);
	const cy = y / (6 * area);

	return new TMap.LatLng(cy, cx);
}
