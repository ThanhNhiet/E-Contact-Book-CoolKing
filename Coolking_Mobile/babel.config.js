module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // hoặc "@babel/preset-env" nếu không dùng Expo
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
