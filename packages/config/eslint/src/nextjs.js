import { nextConfig } from "eslint-config-next";
import baseConfig from "./base.js";

export default [
  ...baseConfig,
  ...nextConfig,
];
