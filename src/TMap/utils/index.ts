/**
 * 递归合并两个对象，确保嵌套对象的属性不会被直接覆盖，而是逐层合并。
 * @param target - 目标对象，最终会被修改并返回
 * @param source - 需要合并的对象，其中的属性将合并到 target 中
 * @returns 返回合并后的 target 对象
 */
export function deepMerge<T extends Record<string, any>>(target: any, source: Partial<T>): T {
	for (const key in source) {
		if (
			Object.prototype.hasOwnProperty.call(source, key) && // 确保 key 属于 source 而非原型链
			typeof source[key] === 'object' && // 确保是对象
			!Array.isArray(source[key]) && // 排除数组
			source[key] !== null // 排除 null 值
		) {
			// 如果 target[key] 不是对象，则初始化为空对象
			if (typeof target[key] !== 'object' || target[key] === null) {
				target[key] = {} as T[typeof key];
			}
			// 递归合并对象
			target[key] = deepMerge(target[key], source[key]);
		} else {
			// 直接赋值（覆盖已有的 key）
			target[key] = source[key];
		}
	}
	return target;
}

// 获取Geometries数据
export function getGeometries(geometries: TMap.PointGeometry[]) {
	return geometries
		.filter((item): item is TMap.PointGeometry => Boolean(item?.position))
		.map((item) => ({
			...item,
			position: new TMap.LatLng(item.position.lat, item.position.lng),
		}));
}
