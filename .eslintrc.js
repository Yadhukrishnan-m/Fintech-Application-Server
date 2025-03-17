export default {
  env: {
    browser: true,
    node: true,
  },
  globals: {
    myCustomGlobal: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
};
