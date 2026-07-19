// babel.config.js — Babel configuration for Gym Progress Tracker
// Includes react-native-reanimated plugin (must be listed last)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
