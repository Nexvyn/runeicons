module.exports = {
  extends: ['react-app', 'react-native-jest'],
  env: {
    'jest': true
  },
  rules: {
    'import/no-useless-path-segments': 'off',
    'no-unused-vars': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
  }
}