import { build } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const atomsDir = path.resolve(__dirname, '../public/atoms');
const repoRoot = path.resolve(__dirname, '../..');

/**
 * Bundle each atom's JavaScript entry points using Vite.
 * This resolves bare imports (p5, lil-gui, tone) from node_modules
 * and relative lib/ imports, creating self-contained bundles.
 */
export async function bundleAtoms() {
  if (!await fs.pathExists(atomsDir)) {
    console.log('No atoms directory found, skipping bundling');
    return;
  }

  const atoms = (await fs.readdir(atomsDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`\nBundling ${atoms.length} atoms...`);

  for (const atom of atoms) {
    const atomPath = path.join(atomsDir, atom);
    const indexHtmlPath = path.join(atomPath, 'index.html');

    if (!await fs.pathExists(indexHtmlPath)) {
      console.log(`  ${atom}: no index.html, skipping`);
      continue;
    }

    // Parse index.html to find script module entries
    const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
    const scriptRegex = /<script\s+type="module"\s+src="\.\/([^"]+)"><\/script>/g;
    const entryPoints = [];
    let match;

    while ((match = scriptRegex.exec(indexHtml)) !== null) {
      entryPoints.push(match[1]);
    }

    if (entryPoints.length === 0) {
      console.log(`  ${atom}: no module scripts found, skipping`);
      continue;
    }

    console.log(`  ${atom}: bundling ${entryPoints.join(', ')}`);

    // Bundle each entry point
    let updatedHtml = indexHtml;

    for (const entry of entryPoints) {
      const entryPath = path.join(atomPath, entry);

      if (!await fs.pathExists(entryPath)) {
        console.log(`    ${entry}: file not found, skipping`);
        continue;
      }

      const bundleName = entry.replace('.js', '.bundle.js');

      try {
        // Use temp directory for Vite output (avoids outDir === root warning)
        const tempOutDir = path.join(atomPath, '.bundle-temp');
        await fs.ensureDir(tempOutDir);

        // Build with Vite
        await build({
          root: repoRoot, // Use repo root as Vite root to avoid conflicts
          configFile: false, // Don't use any config file
          build: {
            lib: {
              entry: entryPath,
              formats: ['es'],
              fileName: () => bundleName
            },
            outDir: tempOutDir,
            emptyOutDir: true,
            minify: false, // Keep readable for debugging
            rollupOptions: {
              output: {
                inlineDynamicImports: true // No code splitting
              }
            }
          },
          resolve: {
            alias: {
              // Resolve ../../lib/audio to actual lib directory
              '../../lib': path.join(repoRoot, 'lib')
            }
          },
          define: {
            // Remove HMR references
            'import.meta.hot': 'undefined'
          },
          logLevel: 'warn' // Suppress verbose output
        });

        // Move bundled file from temp to atom directory
        const bundledPath = path.join(tempOutDir, bundleName);
        const targetPath = path.join(atomPath, bundleName);
        await fs.move(bundledPath, targetPath, { overwrite: true });
        await fs.remove(tempOutDir);

        // Update HTML to reference bundled file
        const scriptTag = `<script type="module" src="./${entry}"></script>`;
        const bundledScriptTag = `<script type="module" src="./${bundleName}"></script>`;
        updatedHtml = updatedHtml.replace(scriptTag, bundledScriptTag);

        console.log(`    ✓ ${entry} → ${bundleName}`);
      } catch (error) {
        console.error(`    ✗ Failed to bundle ${entry}:`, error.message);
        throw error;
      }
    }

    // Write updated index.html
    await fs.writeFile(indexHtmlPath, updatedHtml, 'utf-8');
  }

  console.log('✓ Atom bundling complete\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bundleAtoms().catch(err => {
    console.error('Bundling failed:', err);
    process.exit(1);
  });
}
