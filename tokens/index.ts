import { primitives as tokenPrimitives } from './primitives.json';

export { tokenPrimitives };

export const parseColors = (obj: Record<string, any>) => {
  return Object.keys(obj).reduce((acc, key) => {
    // eg keyColors = { 100: {value: '#f5f5f5'} }
    const keyColors = obj[key];

    Object.keys(keyColors).forEach((colorKey) => {
      const color = keyColors[colorKey]?.value;
      // eg grey-100: '#f5f5f5'
      acc[`${key.toLowerCase()}-${colorKey.toLowerCase()}`] = color;
    });
    return acc;
  }, {});
};

export const colors = parseColors({
  ...tokenPrimitives.colors.solid,
  transparent: tokenPrimitives.colors.transparent,
  gradients: {
    primary: {
      value: 'linear-gradient(88deg, #F7C3A1 0%, #DF9BE8 100%)',
    },
    red: {
      value: 'linear-gradient(88deg, #FFB4B4 0%, #FF6C6C 100%)',
    },
  },
});
