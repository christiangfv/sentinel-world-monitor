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
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('GCLOUD_PROJECT must be set');
  process.exit(2);
}
initializeApp({ projectId });
// Optional metadata fields (e.g. GDACS glide/enclosure) may be undefined;
// Firestore rejects undefined unless told to drop it.
getFirestore().settings({ ignoreUndefinedProperties: true });

const dryRun = process.argv.includes('--dry-run');

type Result = { name: string; ok: boolean; ms: number; error?: string };

async function main(): Promise<void> {
  // Imported after initializeApp(): the fetcher modules call getFirestore()
  // at module scope.
  const { processUSGSFetch } = await import('./fetchUSGS');
  const { processCSNFetch } = await import('./fetchCSN');
  const { processGDACSFetch } = await import('./fetchGDACS');
  const { processNHCFetch } = await import('./fetchNHC');
  const { processNASAFetch } = await import('./fetchNASA');
  const { processSSNFetch } = await import('./fetchSSN');
  const { processCENAPREDFetch } = await import('./fetchCENAPRED');

  const tasks: Array<{ name: string; fn: () => Promise<unknown> }> = [
    { name: 'USGS', fn: () => processUSGSFetch({ dryRun }) },
    { name: 'CSN', fn: () => processCSNFetch({ dryRun }) },
    { name: 'GDACS', fn: () => processGDACSFetch({ dryRun }) },
    { name: 'NHC', fn: () => processNHCFetch({ dryRun }) },
    { name: 'NASA', fn: () => processNASAFetch({ dryRun }) },
    { name: 'SSN', fn: () => processSSNFetch({ dryRun }) },
    { name: 'CENAPRED', fn: () => processCENAPREDFetch({ dryRun }) },
  ];

  const TASK_DEADLINE_MS = 120_000;
  const withDeadline = <T,>(p: Promise<T>, name: string) =>
    Promise.race([
      p,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${name} exceeded ${TASK_DEADLINE_MS / 1000}s deadline`)), TASK_DEADLINE_MS),
      ),
    ]);

  const started = Date.now();
  console.log(`[sentinel-runner] project=${projectId} dryRun=${dryRun} start=${new Date().toISOString()}`);
  const results: Result[] = [];
  for (const task of tasks) {
    const t0 = Date.now();
    try {
      await withDeadline(task.fn(), task.name);
      results.push({ name: task.name, ok: true, ms: Date.now() - t0 });
    } catch (err) {
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
  console.log(
    `[sentinel-runner] done in ${((Date.now() - started) / 1000).toFixed(1)}s — ok=${results.length - failed.length} failed=${failed.length}`,
  );
  // Partial failures are normal (a source may be down); only a total failure
  // is a non-zero exit so cron/monitoring can tell the difference.
  process.exit(failed.length === results.length ? 1 : 0);
}

main().catch((err) => {
  console.error('[sentinel-runner] fatal:', err);
  process.exit(1);
});
