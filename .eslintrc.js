// 查询相关eslint rules => http://eslint.cn/docs/rules/
module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    // "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "array-callback-return": "error",
        "arrow-spacing": [
            "error",
            {
                "after": true,
                "before": true
            }
        ],
        "block-scoped-var": "error",
        "block-spacing": [
            "error",
            "always"
        ],
        "brace-style": [ 
            "error",
            "stroustrup",
        ],
        "camelcase": [
            "error",
            {
                "properties": "always"
            }
        ],
        "comma-spacing": [
            "error",
            {
                "after": true,
                "before": false
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "computed-property-spacing": [
            "error",
            "always"
        ],
        "curly": "error",
        "eqeqeq": "error",
        "for-direction": "error",
        "func-call-spacing": [
            "error",
            "always"
        ],
        "func-name-matching": "error",
        "func-names": [
            "error",
            "never"
        ],
        "generator-star-spacing": "error",
        "getter-return": "error",
        "keyword-spacing": [
            "error",
            {
                "after": true,
                "before": true
            }
        ],
        "new-parens": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-await-in-loop": "error",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-catch-shadow": "error",
        "no-duplicate-imports": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-floating-decimal": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-multi-str": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-path-concat": "error",
        "no-process-exit": "error",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-properties": "error",
        "no-restricted-syntax": "error",
        "no-return-await": "error",
        "no-self-compare": "error",
        "no-shadow-restricted-names": "error",
        "no-sync": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-undef-init": "error",
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "no-void": "error",
        "no-warning-comments": "error",
        "nonblock-statement-body-position": "error",
        "operator-assignment": [
            "error",
            "always"
        ],
        "padding-line-between-statements": "error",
        "prefer-numeric-literals": "error",
        "quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "radix": [
            "error",
            "as-needed"
        ],
        "require-await": "error",
        "rest-spread-spacing": [
            "error",
            "never"
        ],
        "semi": [
            "error",
            "always",
        ],
        "semi-spacing": [
            "error",
            {
                "after": true,
                "before": false
            }
        ],
        "semi-style": [
            "error",
            "last"
        ],
        "space-infix-ops": "error",
        "strict": "error",
        "symbol-description": "error",
        "template-tag-spacing": "error",
        "unicode-bom": [
            "error",
            "never"
        ],
        "yield-star-spacing": "error",
        "yoda": [
            "error",
            "never"
        ]
    }
};