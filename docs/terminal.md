# Posada en marxa des del terminal

Esta guia resumeix el flux mínim per treballar la correcció massiva sense navegar per GitHub.

## Requisits locals

Cal tindre instal·lat:

- Node.js 20 o superior.
- `npm`.
- GitHub CLI (`gh`).
- Accés al repositori `igomis/dwes-microreptes-autocorreccio`.

Comprova la sessió de GitHub:

```bash
gh auth status
```

Si no tens sessió iniciada:

```bash
gh auth login
```

## Preparar el repositori

```bash
cd dwes-microreptes-autocorreccio
npm ci
npm run validate
```

Abans de tocar llistes, prompts o rúbriques, convé actualitzar:

```bash
git pull --ff-only
```

## Configuració que viu en GitHub

En el repositori del professor, `igomis/dwes-microreptes-autocorreccio`, han d'existir estos secrets d'Actions:

```text
OPENAI_API_KEY
CLASSROOM_AUTOGRADE_TOKEN
```

- `OPENAI_API_KEY`: clau d'OpenAI del professor.
- `CLASSROOM_AUTOGRADE_TOKEN`: token amb permís de lectura i escriptura sobre els repositoris Classroom de `cipfpbatoi`.

## Configuració que viu en el repo

Repositoris d'alumnes:

```text
course/student-repositories.txt
course/student-repositories-2dawa.txt
course/student-repositories-2dawb.txt
course/student-repositories-2dawc.txt
course/student-repositories-2dawd.txt
```

Format:

```text
cipfpbatoi/microreptes-i-igomis 2DAW-A
```

Microrepte actiu per grup o alumne:

```text
course/active-challenges.json
```

## Llançar una prova sense consum

Prova 2DAW-A en mode `mock`, sense publicar en el repo de l'alumne:

```bash
gh workflow run batch-autograde-students.yml \
  --repo igomis/dwes-microreptes-autocorreccio \
  -f target_group=2DAW-A \
  -f repositories= \
  -f repositories_file= \
  -f group=2DAW-A \
  -f mode=mock \
  -f student_ref=main \
  -f publish_to_student_repo=false
```

Consulta l'estat:

```bash
gh run list \
  --repo igomis/dwes-microreptes-autocorreccio \
  --workflow batch-autograde-students.yml \
  --limit 5
```

Les execucions massives queden en cua. Si llances diverses correccions seguides, GitHub no les executa alhora: la següent espera que acabe l'anterior.

## Llançar correcció real amb OpenAI

Per corregir 2DAW-A amb OpenAI i publicar el resultat en els repositoris dels alumnes:

```bash
gh workflow run batch-autograde-students.yml \
  --repo igomis/dwes-microreptes-autocorreccio \
  -f target_group=2DAW-A \
  -f repositories= \
  -f repositories_file= \
  -f group=2DAW-A \
  -f mode=openai \
  -f student_ref=main \
  -f publish_to_student_repo=true
```

Per corregir tots els grups:

```bash
gh workflow run batch-autograde-students.yml \
  --repo igomis/dwes-microreptes-autocorreccio \
  -f target_group=all \
  -f repositories= \
  -f repositories_file= \
  -f group=2DAW-A \
  -f mode=openai \
  -f student_ref=main \
  -f publish_to_student_repo=true
```

## Llançar una tanda puntual

Si vols corregir només alguns repositoris sense modificar els fitxers de `course/`:

```bash
gh workflow run batch-autograde-students.yml \
  --repo igomis/dwes-microreptes-autocorreccio \
  -f target_group=all \
  -f repositories='cipfpbatoi/microreptes-i-igomis 2DAW-A' \
  -f repositories_file= \
  -f group=2DAW-A \
  -f mode=mock \
  -f student_ref=main \
  -f publish_to_student_repo=false
```

## Consultar resultats

Últimes notes vigents:

```bash
npm run grades:list
```

Fitxers agregats:

```text
grades/latest-grades.json
grades/latest-grades.csv
```

Historial complet:

```text
grades/history/
```

`latest-grades.*` només manté l'últim registre per `repo + challenge_id`. Els intents anteriors queden en `grades/history/`.

En els repositoris d'alumnes, la publicació manté `autograde/latest.*` i afegeix `autograde/README.md` amb enllaços a `autograde/history/`, on es conserven les valoracions anteriors.

Els fitxers de `grades/` son sortida generada i no es commitegen. En execucions de GitHub Actions, descarrega l'artifact `batch-autograde-results` per conservar o consultar la còpia central.

Per importar automàticament l'últim artifact correcte al servidor:

```bash
npm run grades:download-latest
```

També pots importar un run concret:

```bash
npm run grades:download-latest -- --run-id 33598305678
```

El script copia `grades/` des de l'artifact i sincronitza `grades/latest-grades.json` amb la BD local del dashboard.

En el dashboard, el botó **Actualitzar** de la vista `Resultats` fa aquesta mateixa importació automàtica abans de recarregar les notes.

Exemple de cron cada 10 minuts:

```cron
*/10 * * * * cd /ruta/al/servidor/dwes-microreptes-autocorreccio && git pull --ff-only && npm run grades:download-latest >> /tmp/dwes-grades-import.log 2>&1
```

## Dashboard local opcional

Si vols una interfície local:

```bash
cp .env.example .env
npm run dashboard
```

Obri:

```text
http://localhost:4173
```

El `.env` del dashboard necessita un `GITHUB_TOKEN` amb permís per llançar workflows en `igomis/dwes-microreptes-autocorreccio`.
