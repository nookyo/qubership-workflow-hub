// With a motherfucking microphone, plug it in my soul
// I'm a renegade riot getting out of control
// I'm-a keeping it alive and continue to be
// Flying like an eagle to my destiny

const core = require("@actions/core");
const OctokitWrapper = require("./wrapper");
const ContainerReport = require("./reports/containerReport");
const MavenReport = require("./reports/mavenReport");
const ContainerStrategy = require("./strategy/container");
const MavenStrategy = require("./strategy/maven");

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

  const thresholdDays = parseInt(core.getInput('threshold-days'), 10) || 7;

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

  const strategyContext = {
    packagesWithVersions: packagesWithVersions,
    excludedTags,
    includedTags,
    thresholdDate,
    wrapper,
    owner,
    isOrganization,
    debug: isDebug
  };


  let strategy = package_type === 'container' ? new ContainerStrategy() : new MavenStrategy();

  console.log(`Using strategy: ${await strategy.toString()}`);

  let filteredPackagesWithVersionsForDelete = await strategy.execute(strategyContext);

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
      await wrapper.deletePackageVersion(owner, pkg.type, pkg.name, version.id, isOrganization);
    }
  }

  await showReport(filteredPackagesWithVersionsForDelete);
  core.info("✅ All specified versions have been deleted successfully.");
}

async function showReport(context, type = 'container') {
  let report = type === 'container' ? new ContainerReport() : new MavenReport();
  await report.writeSummary(context);

}

run();
