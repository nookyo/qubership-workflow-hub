const WildcardMatcher = require('../src/utils/wildcardMatcher'); // путь подгони под свой проект

describe('WildcardMatcher — tag exclusion logic', () => {
  let matcher;
  let excludedPatterns;

  beforeEach(() => {
    matcher = new WildcardMatcher();
    excludedPatterns = [
      'latest',
      'main',
      'release*',
      '*.*',
      '*.*.*',
      '*.*.*-*',
      'v*',
      '0.*',
      '1.*'
    ];
  });

  const testCases = [

    { tag: '0.23', expected: true },
    { tag: '0.23.0', expected: true },
    { tag: '1.62.0-3', expected: true },
    { tag: 'v1.0.0', expected: true },
    { tag: 'release-1.0', expected: true },
    { tag: 'main', expected: true },
    { tag: 'latest', expected: true },

    { tag: 'dependabot-pip-integration-tests-certifi-2025.6.15', expected: false },
    { tag: 'dependabot-pip-integration-tests-certifi-2025.6.15-94e641fa9a1', expected: false },
    { tag: '94e641fa9a1', expected: false },
    { tag: 'deb7cf5c8af', expected: false },
    { tag: 'sha256:abc123', expected: false },
    { tag: 'custom-release-123', expected: false }, // не начинается с "release", а содержит "release" внутри
  ];

  testCases.forEach(({ tag, expected }) => {
    test(`tag "${tag}" should ${expected ? 'be excluded' : 'not be excluded'}`, () => {
      const isExcluded = excludedPatterns.some(pattern => matcher.match(tag, pattern));
      expect(isExcluded).toBe(expected);
    });
  });
});
