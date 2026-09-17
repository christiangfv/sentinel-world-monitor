"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Standalone runner for the VPS.
 *
 * Firebase's Blaze plan lapsed (billing account closed), which silently
 * stopped Cloud Scheduler + Gen2 Functions: no fetch ran after 2026-04-08.
 * Firestore itself keeps working on the free Spark plan, so the same
 * fetchers now run from a cron on the VPS using a service account.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json GCLOUD_PROJECT=sentinel-prod-9c937 \
 *     node lib/runOnce.js            # real run (writes)
 *   node lib/runOnce.js --dry-run    # only fetch + parse, no writes
 *
 * Firestore free quota is 50K reads/day. Each run reads ~2.1K documents
 * (four fetchers dedupe against `limit(500)`), so run it at most every
 * 2 hours (12 × 2.1K ≈ 25K reads/day).
 */
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
    console.error('GCLOUD_PROJECT must be set');
    process.exit(2);
}
(0, app_1.initializeApp)({ projectId });
// Optional metadata fields (e.g. GDACS glide/enclosure) may be undefined;
// Firestore rejects undefined unless told to drop it.
(0, firestore_1.getFirestore)().settings({ ignoreUndefinedProperties: true });
const dryRun = process.argv.includes('--dry-run');
async function main() {
    // Imported after initializeApp(): the fetcher modules call getFirestore()
    // at module scope.
    const { processUSGSFetch } = await Promise.resolve().then(() => __importStar(require('./fetchUSGS')));
    const { processCSNFetch } = await Promise.resolve().then(() => __importStar(require('./fetchCSN')));
    const { processGDACSFetch } = await Promise.resolve().then(() => __importStar(require('./fetchGDACS')));
    const { processNHCFetch } = await Promise.resolve().then(() => __importStar(require('./fetchNHC')));
    const { processNASAFetch } = await Promise.resolve().then(() => __importStar(require('./fetchNASA')));
    const { processSSNFetch } = await Promise.resolve().then(() => __importStar(require('./fetchSSN')));
    const { processCENAPREDFetch } = await Promise.resolve().then(() => __importStar(require('./fetchCENAPRED')));
    const tasks = [
        { name: 'USGS', fn: () => processUSGSFetch({ dryRun }) },
        { name: 'CSN', fn: () => processCSNFetch({ dryRun }) },
        { name: 'GDACS', fn: () => processGDACSFetch({ dryRun }) },
        { name: 'NHC', fn: () => processNHCFetch({ dryRun }) },
        { name: 'NASA', fn: () => processNASAFetch({ dryRun }) },
        { name: 'SSN', fn: () => processSSNFetch({ dryRun }) },
        { name: 'CENAPRED', fn: () => processCENAPREDFetch({ dryRun }) },
    ];
    const TASK_DEADLINE_MS = 120000;
    const withDeadline = (p, name) => Promise.race([
        p,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} exceeded ${TASK_DEADLINE_MS / 1000}s deadline`)), TASK_DEADLINE_MS)),
    ]);
    const started = Date.now();
    console.log(`[sentinel-runner] project=${projectId} dryRun=${dryRun} start=${new Date().toISOString()}`);
    const results = [];
    for (const task of tasks) {
        const t0 = Date.now();
        try {
            await withDeadline(task.fn(), task.name);
            results.push({ name: task.name, ok: true, ms: Date.now() - t0 });
        }
        catch (err) {
            results.push({
                name: task.name,
                ok: false,
                ms: Date.now() - t0,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
    const failed = results.filter((r) => !r.ok);
    for (const r of results) {
        console.log(`[sentinel-runner] ${r.ok ? 'OK  ' : 'FAIL'} ${r.name.padEnd(9)} ${r.ms}ms${r.error ? ` — ${r.error}` : ''}`);
    }
    console.log(`[sentinel-runner] done in ${((Date.now() - started) / 1000).toFixed(1)}s — ok=${results.length - failed.length} failed=${failed.length}`);
    // Partial failures are normal (a source may be down); only a total failure
    // is a non-zero exit so cron/monitoring can tell the difference.
    process.exit(failed.length === results.length ? 1 : 0);
}
main().catch((err) => {
    console.error('[sentinel-runner] fatal:', err);
    process.exit(1);
});
//# sourceMappingURL=runOnce.js.map