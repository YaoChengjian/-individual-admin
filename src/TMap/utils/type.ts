/**
 * 判断一个值是否是对象
 * @param value 
 * @returns boolean
 */
export function isPlainObject(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Object]';
}