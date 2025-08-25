const WildcardMatcher = require("../src/utils/wildcardMatcher");

describe("WildcardMatcher — tag exclusion logic", () => {
  let matcher;
  let excludedPatterns;

  beforeEach(() => {
    matcher = new WildcardMatcher();
    excludedPatterns = [
      "latest",
      "main",
      "release*",
      "*.*.*", // трёхкомпонентные версии типа 1.2.3
      "*.*.*-*", // с суффиксом типа 1.2.3-beta
      "v*",
      "0.*",
      "1.*",
    ];
  });

  const exclusionCases = [
    // должны быть исключены
    { tag: "0.23", expected: true },
    { tag: "0.23.0", expected: true },
    { tag: "1.62.0-3", expected: true },
    { tag: "v1.0.0", expected: true },
    { tag: "release-1.0", expected: true },
    { tag: "main", expected: true },
    { tag: "latest", expected: true },
    { tag: "release-2025.6.15", expected: true },
    { tag: "release-2025.6.15-94e641fa9a1", expected: true },
    { tag: "v2.0.0", expected: true },
    { tag: "v2.0.0-beta", expected: true },

    // не должны быть исключены
    {
      tag: "dependabot-pip-integration-tests-certifi-2025.6.15",
      expected: false,
    },
    {
      tag: "dependabot-pip-integration-tests-certifi-2025.6.15-94e641fa9a1",
      expected: false,
    },
    { tag: "94e641fa9a1", expected: false },
    { tag: "deb7cf5c8af", expected: false },
    { tag: "sha256:abc123", expected: false },
    { tag: "custom-release-123", expected: false },
    { tag: "feature-branch", expected: false },
  ];

  exclusionCases.forEach(({ tag, expected }) => {
    test(`exclude: tag "${tag}" → ${expected}`, () => {
      const isExcluded = excludedPatterns.some((pat) =>
        matcher.match(tag, pat),
      );
      expect(isExcluded).toBe(expected);
    });
  });
});

describe("WildcardMatcher — tag inclusion logic", () => {
  let matcher;
  let includePatterns;

  beforeEach(() => {
    matcher = new WildcardMatcher();
    includePatterns = [
      "dependabot-*", // все теги dependabot
      "sha256:*", // образы по sha256:
      "?*", // один символ + что угодно (короткие хэши)
      "*-tests-*", // ветки с "-tests-"
    ];
  });

  const inclusionCases = [
    // должны включаться
    {
      tag: "dependabot-pip-integration-tests-certifi-2025.6.15",
      expected: true,
    },
    {
      tag: "dependabot-pip-integration-tests-certifi-2025.6.15-94e641fa9a1",
      expected: true,
    },
    { tag: "sha256:abc123def456", expected: true },
    { tag: "a1b2c3", expected: true },
    { tag: "f1234567890", expected: true },
    { tag: "feature-tests-xyz", expected: true },

    // не должны включаться
    { tag: "latest", expected: false },
    { tag: "main", expected: false },
    { tag: "0.23.0", expected: false },
    { tag: "release-2025.6.15", expected: false },
    { tag: "custom-release-123", expected: false },
  ];

  inclusionCases.forEach(({ tag, expected }) => {
    test(`include: tag "${tag}" → ${expected}`, () => {
      const isIncluded = includePatterns.some((pat) => matcher.match(tag, pat));
      expect(isIncluded).toBe(expected);
    });
  });
});
