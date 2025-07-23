// With a motherfucking microphone, plug it in my soul
// I'm a renegade riot getting out of control
// I'm-a keeping it alive and continue to be
// Flying like an eagle to my destiny

const core = require("@actions/core");
const OctokitWrapper = require("./utils/wrapper");
const ContainerReport = require("./reports/containerReport");
const MavenReport = require("./reports/mavenReport");
const { getStrategy } = require("./strategy/strategyRegistry");

async function run() {

  // const configurationPath = core.getInput('config-file-path');

  // if (configurationPath === "") {
  //   core.info("❗️ Configuration file path is empty. Try to using default path: ./.github/package-cleanup-config.yml");
  //   configurationPath = "./.github/package-cleanup-config.yml";
  // }

  const isDebug = core.getInput("debug").toLowerCase() === "true";
  const dryRun = core.getInput("dry-run").toLowerCase() === "true";

  const package_type = core.getInput("package-type").toLowerCase();

  core.info(`Is debug? -> ${isDebug}`);
  core.info(`Dry run? -> ${dryRun}`);

  const thresholdDays = parseInt(core.getInput('threshold-days'), 10);

  let excludedTags = [];
  let includedTags = [];

  if (package_type === "container") {
    const rawIncludedTags = core.getInput('included-tags');
    includedTags = rawIncludedTags ? rawIncludedTags.split(",") : [];

    const rawExcludedTags = core.getInput('excluded-tags');
    excludedTags = rawExcludedTags ? rawExcludedTags.split(",") : [];
  }

  if (package_type === "maven") includedTags = ['*SNAPSHOT*', ...includedTags];

  const now = new Date();
  const thresholdDate = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);

  // core.info(`Configuration Path: ${configurationPath}`);
  core.info(`Threshold Days: ${thresholdDays}`);
  core.info(`Threshold Date: ${thresholdDate}`);

  excludedTags.length && core.info(`Excluded Tags: ${excludedTags}`);
  includedTags.length && core.info(`Included Tags: ${includedTags}`);

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const wrapper = new OctokitWrapper(process.env.PACKAGE_TOKEN);

  const isOrganization = await wrapper.isOrganization(owner);
  core.info(`Is Organization? -> ${isOrganization}`);

  // strategy will start  here for different types of packages
  core.info(`Package type: ${package_type}, owner: ${owner}, repo: ${repo}`);

  // let packages = await wrapper.listPackages(owner, 'container', isOrganization);

  let packages = await wrapper.listPackages(owner, package_type, isOrganization);

  let filteredPackages = packages.filter((pkg) => pkg.repository?.name === repo);
  // core.info(`Filtered Packages: ${JSON.stringify(filteredPackages, null, 2)}`);


  core.info(`Found ${packages.length} packages of type '${package_type}' for owner '${owner}'`);

  if (packages.length === 0) {
    core.info("❗️ No packages found.");
    return;
  }

  const packagesWithVersions = await Promise.all(
    filteredPackages.map(async (pkg) => {
      const versionsForPkg = await wrapper.listVersionsForPackage(owner, pkg.package_type, pkg.name, isOrganization);
      return { package: pkg, versions: versionsForPkg };
    })
  );


  // // 3) Для каждого пакета группируем тэг → его manifest digest’ы → архитектурные слои
  // for (const { package: pkg, versions } of packagesWithVersions) {
  //   // оставляем только версии с тегами
  //   const tagged = versions.filter(v => (v.metadata.container.tags || []).length > 0);
  //   if (tagged.length === 0) {
  //     core.info(`→ ${pkg.name}: нет версий с тегами`);
  //     continue;
  //   }

  //   for (const tagVer of tagged) {
  //     // возьмём, например, первый тег
  //     const tag = tagVer.metadata.container.tags[0];
  //     core.info(`\nПакет ${pkg.name} — версия id=${tagVer.id}, tag=${tag}`);

  //     // получаем через docker manifest digest’ы всех платформ
  //     const digests = await wrapper.getManifestDigests(owner, pkg.name, tag);
  //     core.info(` → manifest-list digests:\n   ${digests.join("\n   ")}`);

  //     // сопоставляем с sha-версиями из GH Packages
  //     const archLayers = versions.filter(v => digests.includes(v.name));
  //     if (archLayers.length) {
  //       core.info(` → связанные архитектурные слои:`);
  //       archLayers.forEach(v =>
  //         core.info(`    • id=${v.id}, name=${v.name}`)
  //       );
  //     } else {
  //       core.info(` → архитектурные слои не найдены.`);
  //     }
  //   }
  // }


  //core.info(JSON.stringify(packagesWithVersions, null, 2));

  const strategyContext = {
    packagesWithVersions: packagesWithVersions,
    excludedPatterns: excludedTags,
    includedPatterns: includedTags,
    thresholdDate,
    wrapper,
    owner,
    isOrganization,
    debug: isDebug
  };


  let strategy = getStrategy(package_type);
  // // let strategy = package_type === 'container' ? new ContainerStrategy() : new MavenStrategy();

  console.log(`Using strategy -> ${await strategy.toString()}`);

  let filteredPackagesWithVersionsForDelete = await strategy.execute(strategyContext);
  // core.info(`Filtered Packages with Versions for Delete: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);

  if (isDebug) {

    core.info(`::group::Delete versions Log.`);
    core.info(`💡 Package with version for delete: ${JSON.stringify(filteredPackagesWithVersionsForDelete, null, 2)}`);
    core.info(`::endgroup::`);
  }

  let reportContext = {
    filteredPackagesWithVersionsForDelete,
    thresholdDays,
    thresholdDate,
    dryRun,
    includedTags,
    excludedTags
  };

  if (dryRun) {
    core.warning("Dry run mode enabled. No versions will be deleted.");
    await showReport(reportContext, package_type,);
    return;
  }

  for (const { package: pkg, versions } of filteredPackagesWithVersionsForDelete) {
    for (const version of versions) {
      let detail = pkg.type === 'maven' ? version.name : (version.metadata?.container?.tags ?? []).join(', ');
      core.info(`Package: ${pkg.name} (${pkg.type}) — deleting version: ${version.id} (${detail})`);
      try {
        await wrapper.deletePackageVersion(owner, pkg.type, pkg.name, version.id, isOrganization);
      } catch (error) {
        if (error.status === 400 && error.message.includes('You cannot delete the last tagged version of a package')) {
          core.warning(`Skipping version ${version.id} (name: ${version.name}) for package ${pkg.name}: it is the last tagged version and cannot be deleted.`);
        } else if (error.status === 400 && error.message.includes('more than 5000 downloads')) {
          core.warning(`Skipping version ${version.id} for package ${pkg.name}: it has more than 5000 downloads and cannot be deleted.`);
        } else {
          throw error;
        }
      }
    }
  }

  await showReport(filteredPackagesWithVersionsForDelete);
  core.info("✅ Action completed successfully.");
}

async function showReport(context, type = 'container') {
  let report = type === 'container' ? new ContainerReport() : new MavenReport();
  await report.writeSummary(context);

}

run();
