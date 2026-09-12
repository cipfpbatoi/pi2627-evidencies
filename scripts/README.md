# Scripts

## Projecte Intermodular

- `pi/validate-config.mjs`: valida projectes amb nom i punts de control.
- `pi/register-project.mjs`: registra o actualitza un projecte sense gestionar membres.
- `pi/collect-evidence.mjs`: revisa una referència Git immutable i genera un informe sense qualificació.
- `pi/render-report.mjs`: presenta l'informe en Markdown per a la revisió docent.

Les ordres són `npm run validate:pi`, `projects:register`, `evidence:collect` i `evidence:render`.

## Compatibilitat DWES

Scripts Node.js per mantindre el repositori central.

- `validate-config.mjs`: valida fitxers globals, `course/active-challenges.json` i coherència bàsica entre `challenge.json` i `rubric.json`.
- `list-challenges.mjs`: mostra els microreptes disponibles amb identificador i títol.
- `resolve-active-challenge.mjs`: resol l'autocorrecció activa per alumne o grup des de `course/active-challenges.json`.
- `build-evaluation-payload.mjs`: construeix el payload mínim d'avaluació en `tmp/evaluation-payload.json`.
- `mock-autograde.mjs`: genera una resposta simulada compatible amb `global/grading-schema.json` en `tmp/autograde-result.json`.
- `openai-autograde.mjs`: genera una resposta real amb OpenAI mantenint el mateix contracte d'entrada i eixida que el mock.
- `validate-autograde-result.mjs`: valida un resultat d'autograding contra `global/grading-schema.json`.
- `append-grade-result.mjs`: registra un `autograde-result.json` en l'agregacio central de notes provisionals en `grades/latest-grades.json` i `grades/latest-grades.csv`.
- `import-autograde-result.mjs`: alias explicit per a imports manuals de resultats descarregats d'artifacts.
- `compact-latest-grades.mjs`: compacta `latest-grades.*` deixant només l'últim registre per parella `repo + challenge_id`.
- `list-grades.mjs`: mostra les notes provisionals agregades en format llegible.
- `publish-student-autograde.mjs`: publica `autograde/latest.*`, guarda una còpia en `autograde/history/` i regenera `autograde/README.md` en el repositori de l'alumne.
- `create-student-repos.mjs`: crea repositoris privats d'alumnes des d'una plantilla, dona permisos i actualitza `course/student-repositories*.txt`.
- `desplega-agents-alumnat.sh`: sincronitza exclusivament `AGENTS.md`,
  `CLAUDE.md`, `GEMINI.md` i les tres versions equivalents dins de `src/` en la
  branca `main` dels repositoris d'alumnat. Per defecte només simula els canvis;
  requerix `--apply` per publicar-los.
- `audit-student-agent-rules.mjs`: comprova que els sis fitxers d'instruccions
  coincidixen byte a byte amb la plantilla, no són enllaços simbòlics i no hi ha
  overrides ni configuracions alternatives conegudes. El workflow massiu
  d'auditoria només s'executa manualment per no consumir minuts d'Actions que es
  necessiten per a l'autocorrecció.

Execució recomanada:

```bash
npm run validate
npm run list:challenges
npm run resolve:challenge -- --student cipfpbatoi/dwes-ana-marti --group 2DAW-A
node scripts/resolve-active-challenge.mjs --student cipfpbatoi/dwes-pau-garcia --group 2DAW-B
npm run build:payload -- --student cipfpbatoi/dwes-ana-marti --group 2DAW-A --repo cipfpbatoi/dwes-ana-marti --commit abc1234
npm run build:payload -- \
  --student cipfpbatoi/dwes-ana-marti \
  --group 2DAW-A \
  --repo cipfpbatoi/dwes-ana-marti \
  --commit abc1234 \
  --repo-signals ../_artifacts/repo-signals.json \
  --evidence-summary ../_artifacts/evidence-summary.json
npm run mock:autograde -- --input tmp/evaluation-payload.json
OPENAI_API_KEY=... npm run openai:autograde -- --input tmp/evaluation-payload.json
npm run validate:autograde -- --input tmp/autograde-result.json
node scripts/mock-autograde.mjs --input tmp/evaluation-payload.json
node scripts/append-grade-result.mjs \
  --input tmp/autograde-result.json \
  --repo cipfpbatoi/dwes-ana-marti \
  --group 2DAW-A \
  --source mock
node scripts/import-autograde-result.mjs \
  --input ./downloads/autograde-result.json \
  --repo cipfpbatoi/dwes-ana-marti \
  --group 2DAW-A \
  --source openai
node scripts/list-grades.mjs
npm run students:create-repos -- \
  --input alumnes.csv \
  --org batoi-dwes-2026 \
  --template igomis/dwes-microreptes-alumnes \
  --dry-run
npm run students:deploy-agents
npm run students:deploy-agents -- --apply
npm run students:audit-agents -- \
  --repo-dir /ruta/al/repositori-alumne \
  --policy-dir ../dwes-microreptes-alumnes \
  --repo organitzacio/repositori
```

El resolver imprimeix només el `challenge_id` quan tot va bé. Si no troba assignació específica d'alumne ni assignació de grup, mostra un error i ix amb codi `1`.

El builder de payload resol l'autocorrecció activa, carrega polítiques, challenge i rúbrica, imprimeix el JSON formatat i el guarda en `tmp/evaluation-payload.json`.

Opcionalment pot rebre `--repo-signals` i `--evidence-summary`. En la correcció massiva, estos fitxers els genera `collect-repo-evidence.mjs` des del repositori del professorat sobre el clon del repositori de l'alumne. La recollida rep el `challenge_id` i el codi del microrepte actiu, i només tracta com a evidència directa els fitxers de `docs/`, `evidence/`, `tests/` i `src/` que mencionen eixe microrepte en el path o el contingut. `README.md` és la fitxa ordinària d'entrega. `ENTREGA.md`, els README de carpeta del template (`docs/README.md`, `evidence/README.md`, `tests/README.md`) i la documentació de sistema (`docs/autograde.md`) no es tracten com a evidències de microrepte.

El mock d'autograding llig el payload, aplica regles simples sense OpenAI, imprimeix el JSON formatat i el guarda en `tmp/autograde-result.json`.

El motor OpenAI llig el mateix payload, el prompt base del microrepte si està disponible i l'esquema global, demana una resposta JSON estructurada al model i guarda també la resposta crua en `tmp/openai-raw-response.json`.

La diferència pràctica és que `mock-autograde.mjs` és determinista i útil per a CI local sense secrets, mentre que `openai-autograde.mjs` usa `OPENAI_API_KEY` i pot ajustar-se amb `OPENAI_MODEL` per fer una avaluació real abans de la validació.

El validador d'autograding llig el resultat generat, comprova els camps obligatoris i els tipus bàsics definits en l'esquema, i ix amb codi `1` si detecta errors.

Els scripts de notes provisionals treballen amb fitxers locals dins de `grades/`. `append-grade-result.mjs` i `import-autograde-result.mjs` mantenen un únic registre vigent per parella `repo + challenge_id`; si es torna a importar la mateixa parella, es substitueix la fila anterior. `list-grades.mjs` llig `grades/latest-grades.json` i mostra alumne, microrepte, nota, confiança, revisio docent requerida i marca temporal.

Quan es publica una correcció en un repositori d'alumne, `publish-student-autograde.mjs` manté `autograde/latest.md` i `autograde/latest.json` com a còpia vigent, però també deixa cada intent en `autograde/history/` i actualitza `autograde/README.md` amb una taula visible d'intents anteriors.

El script `create-student-repos.mjs` accepta un CSV amb alumnes de diversos grups:

```csv
github_user,group,student_name
alumne01,2DAW-A,Ana Marti
alumne02,2DAW-B,Pau Garcia
```

Per cada fila crea `ORG/microreptes-github_user`, convida l'usuari amb permís `push` i actualitza el fitxer del grup corresponent, per exemple `course/student-repositories-2dawa.txt`, a més del fitxer global `course/student-repositories.txt`. Usa sempre `--dry-run` abans de la primera execució real.

## Clonar o actualitzar els repositoris de l’alumnat

```bash
./scripts/sincronitza-repositoris.sh "$HOME/repositoris-alumnat" --dry-run
./scripts/sincronitza-repositoris.sh "$HOME/repositoris-alumnat"
```

Llig `course/student-repositories.txt`; admet `--group 2DAW-C`, `--file LLISTA` i `--ssh`.
Consulta la [guia del professorat](https://igomis.github.io/reestructuracioModul/professorat/clonar_repositoris_alumnat/) per a autenticació, ús i incidències.
