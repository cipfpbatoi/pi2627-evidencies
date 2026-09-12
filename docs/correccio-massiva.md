# Correccio massiva de repositoris d'alumnes

El workflow `Batch autograde student repositories` llança correccions per a molts repositoris d'alumnes des del repositori del professor.

La correccio real amb OpenAI s'executa en `igomis/dwes-microreptes-autocorreccio`. Per tant, la clau `OPENAI_API_KEY` ha d'estar configurada en el repositori del professor, no en els repositoris de l'alumnat.

## Quan usar-lo

- Els `push` dels alumnes continuen executant el mode `mock`, sense consum d'OpenAI.
- Quan vols corregir una tanda amb IA, llances manualment aquest workflow i selecciones `mode = openai`.
- El resultat OpenAI es publica en cada repositori d'alumne com `autograde/latest.md` i `autograde/latest.json`, i cada intent queda també en `autograde/history/`.

## Requisits

En el repositori del professor cal configurar:

```text
OPENAI_API_KEY
```

També cal un token amb permís de lectura i escriptura sobre els repositoris dels alumnes. Es recomana crear el secret:

```text
CLASSROOM_AUTOGRADE_TOKEN
```

El token ha de poder clonar i fer `push` als repositoris d'alumnes. Si no existeix aquest secret, el workflow intentarà usar `TEACHER_REPO_TOKEN` i, finalment, `GITHUB_TOKEN`, però `GITHUB_TOKEN` normalment no tindrà permisos sobre repositoris d'una altra organització.

## Execucio

Des del terminal, consulta [terminal.md](terminal.md).

1. Entra en el repositori del professor.
2. Ves a `Actions`.
3. Obri `Batch autograde student repositories`.
4. Prem `Run workflow`.
5. Tria `target_group`: `all`, `2DAW-A`, `2DAW-B`, `2DAW-C` o `2DAW-D`.
6. Deixa buit `repositories` per usar la llista del grup seleccionat, o escriu repositoris per a una tanda puntual. Per corregir un sol alumne, escriu només el seu repositori:

```text
cipfpbatoi/microreptes-i-igomis
cipfpbatoi/microreptes-ana-marti
cipfpbatoi/microreptes-joan-ferrer
```

7. Indica el grup per defecte, per exemple `2DAW-A`. Només s'usa si una línia no porta grup.
8. Deixa buit `challenge_id` per usar `course/active-challenges.json`, o indica un microrepte concret per corregir eixe microrepte en tota l'execució.
9. Selecciona `mode = openai` per usar IA.
10. Mantin `publish_to_student_repo = true` si vols que l'alumne veja la correccio en el seu repositori.

El workflow clona cada repositori d'alumne, recull evidencies, construeix el payload, executa el motor d'autograding i publica el resultat.

Les execucions massives queden en cua: si llances una segona correcció mentre una anterior encara està en marxa, GitHub no les executa alhora. La segona espera que acabe la primera. Això evita que dues tandes intenten publicar `autograde/latest.*` sobre els mateixos repositoris al mateix temps.

Abans de publicar en cada repositori d'alumne, el workflow actualitza el clon amb l'últim estat de la branca de l'alumne. Si l'alumne ha fet `push` mentre s'estava corregint, la publicació intenta aplicar-se damunt de la branca actualitzada.

Cada execucio massiva també guarda una còpia central en l'artifact del workflow:

```text
grades/history/<batch-id>/
grades/latest-grades.json
grades/latest-grades.csv
```

Estos fitxers es generen durant l'execucio, pero no es commitegen al repositori del professor. Aixi el repositori local pot fer `git pull --ff-only` sense conflictes provocats per notes provisionals.

## Fitxer de repositoris

La llista general de repositoris està en:

```text
course/student-repositories.txt
```

També hi ha fitxers per grup:

```text
course/student-repositories-2dawa.txt
course/student-repositories-2dawb.txt
course/student-repositories-2dawc.txt
course/student-repositories-2dawd.txt
```

Per corregir només un grup, usa l'input `target_group`. El workflow selecciona automàticament:

```text
target_group = 2DAW-A -> course/student-repositories-2dawa.txt
target_group = 2DAW-B -> course/student-repositories-2dawb.txt
target_group = 2DAW-C -> course/student-repositories-2dawc.txt
target_group = 2DAW-D -> course/student-repositories-2dawd.txt
target_group = all    -> course/student-repositories.txt
```

L'input `repositories_file` queda com a opció avançada per usar un fitxer especial.

Format:

```text
# comentaris permesos
cipfpbatoi/microreptes-i-igomis 2DAW-A
cipfpbatoi/microreptes-ana-marti 2DAW-B
```

Les linies buides i els comentaris amb `#` s'ignoren. Si una línia no porta grup, s'usa el grup per defecte indicat en el workflow. Si l'input `repositories` del workflow està buit, s'usa aquest fitxer.

## Quin microrepte corregeix

El workflow pot funcionar de dues formes:

- Execució ordinària: deixa `challenge_id` buit i el microrepte es resol amb `course/active-challenges.json`.
- Execució puntual: indica `challenge_id` i eixe microrepte s'aplica a tots els repositoris inclosos en eixa execució.

Quan `challenge_id` queda buit, la resolució és:

1. Si el repositori de l'alumne té una assignació específica en `students`, s'usa eixa.
2. Si no, s'usa l'assignació del grup indicat en la línia del repositori.
3. Si la línia no té grup, s'usa el grup per defecte indicat en el workflow.

Configuració activa inicial:

| Grup | Autocorrecció |
|---|---|
| `2DAW-A` | `r1-s01-model-client-servidor-stack` |
| `2DAW-B` | `r1-s02-entorn-executable` |
| `2DAW-C` | `r1-s02-entorn-executable` |
| `2DAW-D` | `r1-s02-entorn-executable` |

Per canviar el microrepte ordinari d'un grup o d'un alumne concret, modifica `course/active-challenges.json` i fes commit.

Per fer una correcció puntual d'un altre microrepte, no cal tocar `course/active-challenges.json`: usa l'input `challenge_id` del workflow o el selector **Microrepte a corregir** del dashboard.

## Correcció d'un sol alumne

La via recomanada és usar el dashboard:

1. Entra en la vista `Correcció`.
2. En **Alumne concret**, selecciona l'alumne.
3. En **Microrepte a corregir**, deixa `Configuració activa` o tria un microrepte concret.
4. Mantin **Branca alumne** en `main`, excepte recuperació o incidència pactada.
5. Llança el workflow.

Des del workflow manual també es pot fer escrivint només una línia en `repositories`, per exemple:

```text
cipfpbatoi/microreptes-ana-marti 2DAW-B
```

El dashboard mostra esta resolució abans de llançar el workflow: per cada repositori indica grup, branca, microrepte, RA avaluat i si l'assignació ve del grup o d'una excepció individual.

## Criteri de branques

El criteri ordinari és corregir sempre la branca:

```text
main
```

L'alumnat pot treballar en branques pròpies si li ajuda a organitzar-se, per exemple `r2m3`, `r3m5` o `feature/auth`, però abans de demanar correcció ha d'integrar el lliurament en `main`.

El camp `student_ref` del workflow i el camp **Branca alumne** del dashboard només s'han de canviar en estos casos:

- recuperació puntual corregida en una branca pactada;
- revisió d'una entrega antiga sense mesclar-la amb `main`;
- incidència tècnica en què el professorat indique explícitament una branca diferent.

No s'ha d'usar el nom de la branca per decidir quin microrepte es corregeix. El microrepte ix de `course/active-challenges.json` en les execucions ordinàries, o de l'input `challenge_id` en una correcció puntual.

## Que veu l'alumne

Despres de la correccio massiva, cada repositori d'alumne rep un commit amb:

```text
autograde/latest.md
autograde/latest.json
autograde/README.md
autograde/history/
```

El fitxer `autograde/README.md` és el punt d'entrada visible: mostra la darrera correcció i una taula amb l'historial d'intents. El fitxer `autograde/latest.md` continua sent el resum llegible de l'última correcció:

- nota provisional;
- feedback;
- puntuacio per dimensions;
- punts forts;
- millores recomanades;
- avisos de revisio docent.

Les correccions anteriors queden en `autograde/history/` amb el seu Markdown i el JSON complet. Així l'alumne pot comparar valoracions del mateix microrepte sense dependre de l'historial de commits.

## Consulta posterior

El professor pot consultar l'historial central descarregant l'artifact `batch-autograde-results` de l'execucio del workflow. Si ha executat scripts locals, tambe el tindra en:

```text
grades/history/
```

I la llista agregada en:

```text
grades/latest-grades.json
grades/latest-grades.csv
```

Els fitxers `latest-grades.*` mantenen només l'últim registre per parella `repo + challenge_id`. Si una mateixa entrega es corregeix més d'una vegada, la fila vigent se substitueix.

Les execucions anteriors continuen disponibles en `grades/history/`.

El dashboard local també mostra els últims resultats llegint `grades/latest-grades.json` quan existeix localment.

## Prova sense consum

Abans de llançar una correccio real, pots seleccionar:

```text
mode = mock
```

Aixi comproves que tots els repositoris es poden clonar i actualitzar sense gastar tokens.
