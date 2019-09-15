module.exports = {
  "env": {
    "browser": true,
  },
  "extends": "google",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    /*
    * include rules you want to enforce/suppress/disable here
    * they can be set to "off"(0) or "warn"(1) or "error"(2)
    * for eg., "semi": "warn" or "semi": 1, that will display
    * warnings for all snippets where semicolons aren't used
    * but won't throw an error
    */

    /*
    * some rules have properties that can be modified for eg.,
    * "quotes": ["error", "double"], i.e., display errors(2)
    * (see above) ÿhen double quotes aren't used.
    */

    /* rules */
    "curly": ["error", "multi-line"],
    "brace-style": ["off", "1tbs", { "allowSingleLine": true }],
    "block-spacing": ["error", "always"],
    "no-var": 0,
    "new-cap": 0,
    "guard-for-in": 0,
    "max-len": ["warn", { "ignoreComments": true }],
    "prefer-const": 1,
    "valid-jsdoc": 0
  }
};
