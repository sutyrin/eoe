import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const atomsDir = path.resolve(__dirname, '../../atoms');
const outputPath = path.resolve(__dirname, '../public/atom-metadata.json');

async function generateMetadata() {
  if (!fs.existsSync(atomsDir)) {
    console.log('[generate-metadata] No atoms/ directory found. Writing empty metadata.');
    await fs.writeJson(outputPath, []);
    return;
  }

  const entries = fs.readdirSync(atomsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.match(/^\d{4}-\d{2}-\d{2}-/));

  const atoms = [];

  for (const entry of entries) {
    const atomPath = path.join(atomsDir, entry.name);
    const slug = entry.name;

    // Parse date and title from folder name
    const parts = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const date = parts ? parts[1] : '';
    const title = parts ? parts[2] : slug;

    // Read config.json
    let configJson = '{}';
    let type = 'visual';
    const configPath = path.join(atomPath, 'config.json');
    if (fs.existsSync(configPath)) {
      configJson = fs.readFileSync(configPath, 'utf8');
      try {
        const config = JSON.parse(configJson);
        if (config.type) type = config.type;
      } catch (e) { /* keep default type */ }
    }

    // Read sketch.js (or audio.js, composition.js)
    let code = '';
    const codeFiles = ['sketch.js', 'audio.js', 'composition.js'];
    for (const cf of codeFiles) {
      const codePath = path.join(atomPath, cf);
      if (fs.existsSync(codePath)) {
        code = fs.readFileSync(codePath, 'utf8');
        break;
      }
    }

    // Read NOTES.md
    let notes = '';
    let stage = 'idea';
    const notesPath = path.join(atomPath, 'NOTES.md');
    if (fs.existsSync(notesPath)) {
      notes = fs.readFileSync(notesPath, 'utf8');
      const stageMatch = notes.match(/\*\*Stage:\*\*\s*(\w+)/);
      if (stageMatch) stage = stageMatch[1];
    }

    atoms.push({
      slug,
      title,
      date,
      type,
      stage,
      thumbnailUrl: `/thumbnails/${slug}.webp`, // Placeholder path for future thumbnails
      code,
      notes,
      configJson
    });
  }

  // Sort by date descending (most recent first)
  atoms.sort((a, b) => b.date.localeCompare(a.date));

  await fs.writeJson(outputPath, atoms, { spaces: 2 });
  console.log(`[generate-metadata] Generated metadata for ${atoms.length} atoms -> ${outputPath}`);
}

generateMetadata().catch(err => {
  console.error('[generate-metadata] Error:', err);
  process.exit(1);
});
