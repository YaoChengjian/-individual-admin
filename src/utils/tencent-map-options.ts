export const getTencentMapOptions = () => ({
  pitch: 0,
  rotation: 0,
  mapStyleId: (import.meta.env.VITE_TX_MAP_STYLE_ID || 'style2').trim(),
  baseMap: {
    type: 'vector',
    features: ['base', 'point', 'label']
  }
});
