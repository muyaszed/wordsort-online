import pluginReact from "eslint-plugin-react";
import globals from "globals";
import baseConfig from "./base.js";

export default [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
