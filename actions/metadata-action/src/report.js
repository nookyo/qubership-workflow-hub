const core = require("@actions/core");
class Report {
    async writeSummary(name, template, distTag, extraTags, renderResult, dryRun = false) {
        core.info("Calculate summary statistics.");
        const dryRunText = dryRun ? " (Dry Run)" : "";

        // Заголовок
        core.summary.addRaw(`### 🧪 Metadata in use${dryRunText}:\n\n`);

        // Таблица
        core.summary.addTable([
            [ { data: "Ref name"       }, { data: name           } ],
            [ { data: "Template"       }, { data: template       } ],
            [ { data: "Distribution tag" }, { data: distTag      } ],
            [ { data: "Extra tags"     }, { data: extraTags      } ],
            [ { data: "Render result"  }, { data: renderResult   } ],
        ]);

        core.summary.addRaw(`\n\n---\n\n✅ Metadata extract completed successfully.`);
        await core.summary.write();
    }
}

module.exports = Report;