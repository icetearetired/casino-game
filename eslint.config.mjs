import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
]
