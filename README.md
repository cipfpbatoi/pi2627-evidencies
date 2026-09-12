# Evidències del Projecte Intermodular de DAW

## Nou nucli simplificat

L'aplicatiu analitza una versió concreta d'un **projecte amb nom** i genera un informe de comprovacions i evidències candidates. No gestiona parelles, custòdies ni qualificacions individuals: el professorat contrasta l'informe i trasllada a Aules allò que corresponga.

Les ferramentes antigues de DWES es conserven temporalment com a compatibilitat durant la migració.

### Configuració

Els projectes es registren en `course/projects.json` amb `id`, `name` i `repository`:

```bash
npm run projects:register -- \
  --id hort-urba \
  --name "Hort urbà col·laboratiu" \
  --repository cipfpbatoi/pi-hort-urba
```

Cada repositori també conté `project.json` amb el mateix identificador i nom. Els punts de control estan en `pi/checkpoints/`.

### Recopilar una entrega

```bash
npm run validate:pi
npm run evidence:collect -- \
  --repo-dir ../pi-hort-urba \
  --project-id hort-urba \
  --checkpoint b1-dossier-0 \
  --ref dossier-0-v1.0
npm run evidence:render -- \
  --input tmp/pi/hort-urba-b1-dossier-0.json
```

L'informe sempre conté `qualification: null` i `teacher_review_required: true`. Els RA/CA són candidats per a revisió docent, no assoliments automàtics.

### Dashboard

```bash
npm run dashboard
```

Mostra els projectes pel nom, els punts de control i els informes locals. El dashboard anterior continua disponible amb `npm run dashboard:legacy`.

## Sistema anterior de DWES

Nom proposat del repositori: `dwes-microreptes-autocorreccio`.

## Finalitat

Este repositori és la font de veritat del professorat per a definir autocorreccions de sessió, microreptes de DWES, rúbriques, polítiques globals i la infraestructura base d'autocorrecció assistida per IA.

No conté el codi dels alumnes ni substituïx els seus repositoris individuals. L'objectiu és disposar d'una estructura coherent, versionada i executable sobre GitHub, des de la qual es puga governar la correcció automatitzada dels microreptes.

## Estructura

- `global/`: polítiques comunes, estil de feedback i esquema de resposta del corrector.
- `course/`: configuració docent centralitzada de l'autocorrecció activa per grup o alumne.
- `microreptes/`: definició de cada autocorrecció de sessió, rúbrica, prompt base, tests futurs i evidències esperades.
- `scripts/`: utilitats Node.js per validar configuració, resoldre l'autocorrecció activa, construir el payload d’avaluació i executar autocorrecció en mode mock o OpenAI.
- `docs/`: arquitectura, flux de treball i decisions docents i tècniques.
- `.github/`: workflows i plantilles per a treballar amb GitHub.
- `examples/`: exemples de mapatge d'alumnat, assignació de microreptes i resultats d’avaluació.

## Flux previst

1. El professorat defineix o actualitza un microrepte en este repositori.
2. El professorat configura l'autocorrecció activa en `course/active-challenges.json`.
3. Cada alumne treballa al seu repositori individual.
4. El repositori de l'alumne executa un workflow de correcció.
5. El workflow consulta la configuració centralitzada del microrepte.
6. Es construeix un payload d’avaluació amb les evidències disponibles.
7. Es genera feedback provisional i una nota inicial.
8. El professorat revisa els casos marcats amb baixa confiança o flags.

## Autocorrecció activa centralitzada

L'autocorrecció activa es resol des d'este repositori del professor. Primer es comprova si l'alumne té una assignació específica; si no, s'aplica l'assignació del grup.

Això permet canviar el repte actiu de forma centralitzada, sense commits als repositoris individuals de l'alumnat.

## Correcció massiva

El workflow `Batch autograde student repositories` permet llançar autocorreccions en molts repositoris d'alumnes des d'una única execució manual.

Per a una tanda real, executa el workflow massiu amb `mode = openai`. La clau `OPENAI_API_KEY` es configura en este repositori del professor i el resultat es publica en cada repo d'alumne com `autograde/latest.md` i `autograde/latest.json`. També es guarda una còpia central en `grades/history/` i s'actualitzen `grades/latest-grades.json` i `grades/latest-grades.csv` dins de l'artifact del workflow, sense commitejar notes generades al repositori del professor.

Les execucions massives queden en cua. Si se'n llancen dues seguides, GitHub espera que acabe la primera abans d'executar la següent.

Els repositoris que es corregeixen es mantenen en fitxers `course/student-repositories*.txt`, amb format `repositori grup`. El workflow té un input `target_group` per triar `all`, `2DAW-A`, `2DAW-B`, `2DAW-C` o `2DAW-D`; amb això selecciona automàticament el fitxer corresponent. També es pot usar l'input `repositories` per sobreescriure la llista en una execució puntual, incloent-hi la correcció d'un sol alumne.

El microrepte ordinari es resol des de `course/active-challenges.json`, primer per assignació específica d'alumne i després pel grup indicat en la línia del repositori. Per a una correcció puntual, el workflow i el dashboard permeten indicar `challenge_id` sense modificar `active-challenges.json`. La branca ordinària corregible és `main`; si l'alumnat treballa en una branca de microrepte, ha d'integrar-la en `main` abans de la correcció. El camp `student_ref` només s'ha de canviar per una recuperació o incidència pactada.

Configuració activa inicial:

| Grup | Autocorrecció |
|---|---|
| `2DAW-A` | `r1-s01-model-client-servidor-stack` |
| `2DAW-B` | `r1-s02-entorn-executable` |
| `2DAW-C` | `r1-s02-entorn-executable` |
| `2DAW-D` | `r1-s02-entorn-executable` |

Vegeu [docs/correccio-massiva.md](docs/correccio-massiva.md).

Per actualitzar repositoris d'alumnes ja creats des del template, vegeu [docs/actualitzar-repos-classroom.md](docs/actualitzar-repos-classroom.md).

Per treballar des del terminal amb `gh`, vegeu [docs/terminal.md](docs/terminal.md).

## Creació de repositoris d'alumnes sense GitHub Classroom

Si GitHub Classroom no està disponible, es poden crear repositoris privats d'alumnes des d'una plantilla amb GitHub CLI i mantindre'ls en esta organització o en una organització docent pròpia.

El CSV pot incloure alumnes de diferents grups. La capçalera és recomanable, però també s'accepten línies sense capçalera en l'ordre `github_user,group,student_name`:

```csv
github_user,group,student_name
alumne01,2DAW-A,Ana Marti
alumne02,2DAW-B,Pau Garcia
```

Prova primer amb:

```bash
npm run students:create-repos -- \
  --input alumnes.csv \
  --org batoi-dwes-2026 \
  --template igomis/dwes-microreptes-alumnes \
  --dry-run
```

Quan el resultat siga correcte, lleva `--dry-run`. El script crea els repositoris, assegura que tinguen `main` com a branca per defecte, convida cada alumne amb permís `push` i actualitza `course/student-repositories.txt` i els fitxers específics de grup.

També es pot fer des del dashboard, en la vista `Alumnes`, pujant el CSV o enganxant-ne el contingut. Els valors per defecte d'organització i plantilla es poden configurar amb `GITHUB_CLASSROOM_ORG` i `GITHUB_STUDENT_TEMPLATE` en `.env`. Per defecte s'executa en mode prova; quan la previsualització és correcta es pot desmarcar `Prova sense crear` i executar la creació real.

En servidor, GitHub CLI ha d'estar instal·lat i autenticat. Si el servei no troba `gh`, configura `GH_BIN=/ruta/al/gh` en `.env`. Si vols usar un token específic per a `gh`, posa'l en `GH_TOKEN`; `GITHUB_TOKEN` queda reservat per a les crides del dashboard a l'API de GitHub. Per crear repositoris privats, convidar alumnat i esborrar repositoris, eixe `GH_TOKEN` ha de poder administrar repositoris en l'organització docent; amb tokens clàssics sol caldre `repo` i `delete_repo`. El procés local també ha de poder escriure en `course/`, perquè l'script actualitza `course/student-repositories*.txt` abans de deixar l'execució com a correcta. Si el repositori es crea però falla la invitació, l'script el manté registrat i informa de la invitació pendent com a avís.

## Dashboard del professor

El dashboard local permet veure els grups, repositoris i autocorreccions, crear repositoris d'alumnes des d'un CSV i llançar el workflow massiu sense navegar per GitHub Actions.

```bash
npm install
npm run dashboard
```

Si el dashboard s'exposa fora de l'equip local, configura autenticació mínima:

```bash
DASHBOARD_HOST=0.0.0.0
DASHBOARD_AUTH_REQUIRED=true
DASHBOARD_USER=professor
DASHBOARD_PASSWORD=canvia-aquesta-contrasenya
DASHBOARD_DOCS_PROFESSORAT_URL=https://el-teu-domini/professorat/
DASHBOARD_DOCS_ALUMNAT_URL=https://el-teu-domini/alumnat/
```

Vegeu [docs/dashboard.md](docs/dashboard.md).

## Com afegir una nova autocorrecció

1. Crea una carpeta en `microreptes/` amb un identificador estable de sessió, per exemple `r2-s04-sessions`.
2. Afig `challenge.json`, `rubric.json` i `prompt.md`.
3. Documenta en `tests/README.md` quines proves o oracles s'afegiran.
4. Documenta en `expected/README.md` quines eixides, fixtures o contractes mínims es consideren vàlids.
5. Executa `npm run validate`.

## Estat actual

Base inicial del repositori:

- dues autocorreccions de sessió del Repte 1;
- la sessió `R1-S02` correspon a `R1M2`, que integra entorn executable, landing inicial servida pel backend, documentació i checkpoint perquè el Repte 1 queda en dues sessions;
- una autocorrecció inicial de `R2-S01` per a entrada de dades i validació bàsica;
- una autocorrecció de `R2-S02` per a processament del reintent, conservació de dades del formulari després d'un error i guardat funcional del cas correcte;
- rúbriques inicials;
- polítiques globals;
- resolució centralitzada de l'autocorrecció activa;
- validació de configuració;
- construcció del payload d’avaluació;
- autocorrecció en mode mock;
- validació del resultat del corrector;
- correcció centralitzada amb OpenAI des del repositori del professor;
- publicació del resultat en el repositori de l'alumne com `autograde/latest.md` i `autograde/latest.json`.

## Pròxims passos

- Definir el format definitiu d'evidències dels repositoris d'alumnes.
- Crear el workflow base per als repositoris individuals de GitHub Classroom.
- Afegir tests o oracles reals per autocorrecció de sessió.
- Connectar el payload del professor amb l’anàlisi real del codi i evidències del repo de l’alumne.
- Calibrar rúbriques, flags i llindars de revisió docent.
