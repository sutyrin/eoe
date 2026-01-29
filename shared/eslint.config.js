export default [
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },
  {
    ignores: ['node_modules/', 'dist/', '.planning/']
  }
];
