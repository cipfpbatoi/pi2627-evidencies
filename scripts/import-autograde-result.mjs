import { pathToFileURL } from 'node:url';
import process from 'node:process';

import { runAppendGradeResult } from './append-grade-result.mjs';

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAppendGradeResult().catch((error) => {
    console.error(`No s'ha pogut importar el resultat d'autograding: ${error.message}`);
    process.exit(1);
  });
}
