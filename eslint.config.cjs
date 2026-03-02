const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["node_modules/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        crypto: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        XMLHttpRequest: "readonly",
        // Node globals (if needed)
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // ===== COMPLEXITY & CODE QUALITY =====
      "complexity": ["warn", 10],
      "max-depth": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 5],
      "max-statements": ["warn", 50],

      // ===== MODERN JS PRACTICES =====
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "prefer-destructuring": ["warn", { "array": true, "object": true }],
      "prefer-spread": "warn",
      "prefer-rest-params": "warn",
      "prefer-exponentiation-operator": "warn",

      // ===== AVOID OBSOLETE/DEPRECATED FEATURES =====
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-with": "error",
      "no-octal": "error",
      "no-octal-escape": "error",
      "no-prototype-builtins": "warn",
      "no-caller": "error",
      "no-extend-native": "error",

      // ===== ROBUSTNESS & SAFETY =====
      "eqeqeq": ["error", "always"],
      "no-implicit-coercion": "warn",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-unused-expressions": "error",
      "no-constant-condition": "warn",
      "no-unreachable": "error",
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-shadow": ["warn", { "builtinGlobals": false }],
      "use-isnan": "error",
      "no-func-assign": "error",
      "no-obj-calls": "error",
      "no-sparse-arrays": "error",

      // ===== PERFORMANCE & EFFICIENCY =====
      "no-loop-func": "warn",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-sequences": "error",

      // ===== CODE STYLE & CONSISTENCY =====
      "indent": ["warn", 2],
      "semi": ["error", "always"],
      "comma-dangle": ["warn", "only-multiline"],
      "no-multiple-empty-lines": ["warn", { "max": 2, "maxEOF": 1 }],
      "no-trailing-spaces": "warn",
      "space-before-function-paren": ["warn", { "anonymous": "always", "named": "never" }],
      "keyword-spacing": "warn",
      "space-infix-ops": "warn",
      "space-unary-ops": "warn",

      // ===== BEST PRACTICES =====
      "no-multi-spaces": "warn",
      "no-multi-str": "error",
      "consistent-return": "warn",
      "default-case": "warn",
      "no-param-reassign": ["warn", { "props": false }],
      "no-void": "error",
      "no-continue": "off",
      "radix": ["warn", "always"],
      "require-await": "warn",
    },
  },
];