module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  // Give plugins unique names to avoid conflicts
  plugins.push(['react-native-worklets/plugin', {}, 'worklets']);
  // Reanimated plugin must be last
  plugins.push(['react-native-reanimated/plugin', {}, 'reanimated']);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
