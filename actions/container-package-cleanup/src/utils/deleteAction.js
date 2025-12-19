const log = require("@netcracker/action-logger");

const _MODULE = 'deleteAction.js';

/**
 * Process items in parallel batches
 * @param {Array} items - Items to process
 * @param {number} batchSize - Number of items to process in parallel
 * @param {Function} processFn - Async function to process each item
 */
async function processBatches(items, batchSize, processFn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(item => processFn(item)));
  }
}

/**
 *
 * @param {Array<{package:{id,name,type}, versions:Array<{id,name,metadata}>}>} filtered
 * @param {{ wrapper:any, owner:string, isOrganization?:boolean, dryRun?:boolean, concurrency?:number }} ctx
 */
async function deletePackageVersion(filtered, { wrapper, owner, isOrganization = true, dryRun = false, debug = false, concurrency = 15 } = {}) {
  log.setDebug(debug);
  log.setDryRun(dryRun);

  if (!Array.isArray(filtered) || filtered.length === 0) {
    log.warn("Nothing to delete.");
    return;
  }
  if (!wrapper || typeof wrapper.deletePackageVersion !== "function") {
    throw new Error("wrapper.deletePackageVersion is required");
  }
  if (!owner) {
    throw new Error("owner is required");
  }

  const ownerLC = owner.toLowerCase();

  for (const { package: pkg, versions } of filtered) {
    const imageLC = (pkg.name || "").toLowerCase();
    const type = pkg.type; // "container" | "maven" ...

    // Process versions in parallel batches
    await processBatches(versions, concurrency, async (v) => {
      const tags = v.metadata?.container?.tags ?? [];
      const detail = type === "maven" ? v.name : (tags.length ? tags.join(", ") : v.name);

      log.dryrun(`${ownerLC}/${imageLC} (${type}) - would delete version ${v.id} (${detail})`);

      try {
        log.dim(`Deleting ${ownerLC}/${imageLC} (${type}) - version ${v.id} (${detail})`);
        await wrapper.deletePackageVersion(ownerLC, type, imageLC, v.id, isOrganization);
        log.lightSuccess(`✓ Deleted ${ownerLC}/${imageLC} (${type}) - version ${v.id} (${detail})`);
      } catch (error) {
        const msg = String(error?.message || error);

        if (/more than 5000 downloads/i.test(msg)) {
          log.warn(`Skipping ${imageLC} v:${v.id} (${detail}) - too many downloads.`);
          return;
        }

        if (/404|not found/i.test(msg)) {
          log.warn(`Version not found: ${imageLC} v:${v.id} - probably already deleted.`);
          return;
        }

        if (/403|rate.?limit|insufficient permissions/i.test(msg)) {
          log.warn(`Permission/rate issue for ${imageLC} v:${v.id}: ${msg}`);
          throw error;
        }

        log.error(`Failed to delete ${imageLC} v:${v.id} (${detail}) — ${msg}`);
      }
    });
  }
}

module.exports = { deletePackageVersion };
