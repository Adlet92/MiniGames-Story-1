module.exports = {
  extends: ['@commitlint/config-conventional'],
  defaultIgnores: false,
  rules: {
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'docs',
        'style',
        'test',
        'perf',
        'build',
        'ci',
        'chore',
        'revert',
        'init',
      ],
    ],
  },
};
