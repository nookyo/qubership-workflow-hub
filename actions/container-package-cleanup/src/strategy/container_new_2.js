const core = require("@actions/core");
const AbstractPackageStrategy = require("./abstractPackageStrategy");
const WildcardMatcher = require("../utils/wildcardMatcher");

class ContainerStrategy extends AbstractPackageStrategy {
  constructor() {
    super();
    this.name = "Container Strategy";
    this.wildcardMatcher = new WildcardMatcher();
  }

  async parse(raw) {
    try {
      const data = Array.isArray(raw) ? raw : JSON.parse(raw);

      const packages = data.map(({ package: pkg, versions }) => ({
        id: pkg.id,
        name: pkg.name,
        packageType: pkg.package_type,
        repository: pkg.repository.full_name,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,

        // Версии — массив объектов с id, digest (имя) и тегами
        versions: versions.map((v) => ({
          id: v.id,
          digest: v.name,
          // Если tags придут не массивом, ниже в execute мы дополнительно нормализуем
          tags:
            (v.metadata && v.metadata.container && v.metadata.container.tags) ||
            [],
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        })),
      }));

      return packages;
    } catch (err) {
      core.setFailed(`Action failed: ${err.message}`);
    }
  }

  /**
   * @param {Object} params
   * @param {Array<{ package: Object, versions: Array }>|string} params.packagesWithVersions
   * @param {string[]} params.excludedPatterns
   * @param {string[]} params.includedPatterns
   * @param {Date} params.thresholdDate
   * @param {Object} params.wrapper - octokit or docker registry wrapper (должен иметь getManifestDigests)
   * @param {string} params.owner
   * @param {boolean} params.isOrganization
   * @param {boolean} [params.debug=false]
   * @returns {Promise<Array<{package:{id,name,type},versions:Array}>>}
   */
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
    // Оставляем на будущее — для этой задачи (dangling) паттерны обычно не нужны
    const excluded = (excludedPatterns || []).map((p) => p.toLowerCase());
    const included = (includedPatterns || []).map((p) => p.toLowerCase());

    core.info(
      `Executing ContainerStrategy with ${Array.isArray(packagesWithVersions) ? packagesWithVersions.length : "unknown"} packages.`,
    );

    // 1) Распарсим вход (может быть строкой JSON или уже массивом)
    const packages = await this.parse(packagesWithVersions);
    console.log("Parsed packages:", JSON.stringify(packages, null, 2));

    const result = [];

    // 2) Для каждого пакета собираем «защищённые» дайджесты:
    //    - дайджесты самих тегнутых версий (single-arch или manifest-list)
    //    - плюс платформенные дайджесты из manifest-list по каждому тегу
    for (const pkg of packages) {
      const archDigests = new Set();
      const uniqueTags = new Set();

      // Защитим сами тегнутые манифесты и соберём список уникальных тегов
      for (const v of pkg.versions) {
        const tags = Array.isArray(v.tags) ? v.tags : [];
        if (tags.length > 0) {
          // защищаем digest тега (single-arch или сам список manifest-list)
          archDigests.add(v.digest);
          tags.forEach((t) => uniqueTags.add(t));
        }
      }

      core.info(`archDigests for ${archDigests}}`);
      core.info(`archDigests for ${Array.from(archDigests).join(", ")}`);
      core.info(`uniqueTags for ${Array.from(uniqueTags).join(", ")}`);

      // Получим платформенные дайджесты из manifest-list для каждого уникального тега
      for (const tag of uniqueTags) {
        try {
          const ds = await wrapper.getManifestDigests(owner, pkg.name, tag);
          if (Array.isArray(ds)) {
            ds.forEach((d) => archDigests.add(d));
          } else if (ds) {
            archDigests.add(ds);
          }
          debug &&
            core.info(`[digests] ${pkg.name}:${tag} -> ${JSON.stringify(ds)}`);
        } catch (e) {
          core.warning(
            `Failed to fetch manifests for ${pkg.name}:${tag} — ${e.message}`,
          );
        }
      }

      // 3) Кандидаты на удаление: версии без тегов, чей digest НЕ в archDigests
      let dangling = pkg.versions.filter((v) => {
        const tags = Array.isArray(v.tags) ? v.tags : [];
        const isUntagged = tags.length === 0;
        const isReferencedByActiveTag = archDigests.has(v.digest);
        return isUntagged && !isReferencedByActiveTag;
      });

      if (dangling.length > 0) {
        result.push({
          package: {
            id: pkg.id,
            name: pkg.name,
            type: pkg.packageType,
          },
          versions: dangling,
        });

        debug &&
          core.info(
            `[dangling] ${pkg.name}: ${dangling.length} -> ` +
              dangling.map((v) => v.digest).join(", "),
          );
      }

      core.info(`result: ${JSON.stringify(result, null, 2)}`);
    }

    // Возвращаем список пакетов с версиями-кандидатами на удаление
    return result;
  }

  isValidMetadata(version) {
    return Array.isArray(version?.metadata?.container?.tags);
  }

  toString() {
    return this.name;
  }
}

module.exports = ContainerStrategy;
