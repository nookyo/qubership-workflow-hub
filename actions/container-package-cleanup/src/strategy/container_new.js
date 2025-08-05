const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
    this.wildcardMatcher = new WildcardMatcher();
  }

  async execute({
    packagesWithVersions,
    excludedPatterns,
    includedPatterns,
    thresholdDate,
    wrapper,
    owner,
    isOrganization,
    debug = false,
  }) {
    const excluded = excludedPatterns.map((p) => p.toLowerCase());
    const included = includedPatterns.map((p) => p.toLowerCase());

    const result = [];

    for (const { package: pkg, versions } of packagesWithVersions) {
      if (!Array.isArray(versions)) {
        core.warning(`Package ${pkg.name} has no versions array`);
        continue;
      }

      if (versions.length <= 1) {
        debug &&
          core.info(
            `Skipping package: ${pkg.name} — only ${versions.length} version(s).`,
          );
        continue;
      }

      // Группируем версии по времени создания (в пределах минуты считаем одним пушем)
      const groupedVersions = this.groupVersionsByTime(versions, debug);

      const versionsToDelete = [];

      for (const group of groupedVersions) {
        // Проверяем, что группа достаточно старая
        const groupTime = new Date(group[0].created_at);
        if (groupTime > thresholdDate) {
          debug &&
            core.info(
              `Skipping group for ${pkg.name} - too recent: ${groupTime}`,
            );
          continue;
        }

        // Ищем версию с тегами в группе
        const taggedVersion = group.find(
          (v) =>
            Array.isArray(v.metadata?.container?.tags) &&
            v.metadata.container.tags.length > 0,
        );

        if (!taggedVersion) {
          debug &&
            core.info(
              `Skipping group for ${pkg.name} - no tagged version found`,
            );
          continue;
        }

        const tags = taggedVersion.metadata.container.tags;

        // Проверяем исключения
        const shouldExclude =
          excluded.some((pattern) =>
            tags.some((tag) => this.wildcardMatcher.match(tag, pattern)),
          ) || tags.includes("latest");

        if (shouldExclude) {
          debug &&
            core.info(
              `Excluding group for ${pkg.name} - tags: ${tags.join(", ")}`,
            );
          continue;
        }

        // Проверяем включения (если заданы)
        const shouldInclude =
          included.length === 0 ||
          included.some((pattern) =>
            tags.some((tag) => this.wildcardMatcher.match(tag, pattern)),
          );

        if (!shouldInclude) {
          debug &&
            core.info(
              `Not including group for ${pkg.name} - tags: ${tags.join(", ")}`,
            );
          continue;
        }

        // Добавляем всю группу для удаления
        versionsToDelete.push(...group);
        debug &&
          core.info(
            `Adding group for deletion: ${pkg.name} - tags: ${tags.join(", ")}, versions: ${group.length}`,
          );
      }

      if (versionsToDelete.length > 0) {
        // Сортируем по времени создания (самые новые первыми)
        versionsToDelete.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        result.push({
          package: {
            id: pkg.id,
            name: pkg.name,
            type: pkg.package_type,
          },
          versions: versionsToDelete,
        });
        debug &&
          core.info(
            `Versions to delete for package ${pkg.name}: ${versionsToDelete.map((v) => v.id + " (" + (v.metadata?.container?.tags?.join(", ") || "untagged") + ")").join(", ")}`,
          );
      }
    }

    return result;
  }

  // Группирует версии по времени создания (версии созданные в течение минуты считаются одним пушем)
  groupVersionsByTime(versions, debug = false) {
    if (!versions || versions.length === 0) return [];

    // Сортируем по времени создания
    const sorted = [...versions].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );

    const groups = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i].created_at);
      const previous = new Date(sorted[i - 1].created_at);
      const diffMinutes = (current - previous) / (1000 * 60);

      // Если разница меньше минуты, добавляем в текущую группу
      if (diffMinutes < 1) {
        currentGroup.push(sorted[i]);
      } else {
        // Иначе начинаем новую группу
        groups.push(currentGroup);
        currentGroup = [sorted[i]];
      }
    }

    // Добавляем последнюю группу
    groups.push(currentGroup);

    debug &&
      groups.forEach((group, i) => {
        const taggedVersion = group.find(
          (v) => v.metadata?.container?.tags?.length > 0,
        );
        const tags = taggedVersion?.metadata?.container?.tags || ["untagged"];
        core.info(
          `Group ${i}: ${group.length} versions, tags: ${tags.join(", ")}, time: ${group[0].created_at}`,
        );
      });

    return groups;
  }

  isValidMetadata(version) {
    return Array.isArray(version?.metadata?.container?.tags);
  }

  toString() {
    return this.name;
  }
}

module.exports = ContainerStrategy;
