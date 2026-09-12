# Notes provisionals centralitzades

Este repositori del professor agrega resultats d'autograding generats des del workflow massiu del repositori docent. La primera versio usa fitxers locals JSON i CSV, sense base de dades ni sincronitzacio automatica. Els fitxers generats dins de `grades/` son sortida local i no es versionen en Git.

## On es genera el resultat

El workflow massiu del repositori del professor clona els repositoris dels alumnes, executa el script docent de recollida d'evidències sobre el clon i genera resultats en l'artifact central:

```text
grades/history/<batch-id>/
grades/latest-grades.json
grades/latest-grades.csv
```

En cada resultat, el fitxer rellevant es `autograde-result.json`. Inclou camps com `challenge_id`, `student`, `commit`, `final_score_over_10`, `provisional`, `teacher_review_required` i `confidence`.

La recollida d'evidències està limitada al microrepte actiu: els fitxers de `docs/`, `evidence/`, `tests/` i `src/` només compten com a evidència directa si mencionen el `challenge_id` o el codi del microrepte, per exemple `R2M1`. El treball de microreptes anteriors pot aparéixer com a context de repositori, però no ha de sumar nota del microrepte nou.

El criteri ordinari de lliurament és: `README.md` de l'arrel és la fitxa de l'entrega actual i ha d'enllaçar els fitxers concrets del microrepte. Els README de carpeta (`docs/README.md`, `evidence/README.md`, `tests/README.md`) són guies del template i no compten com a evidència puntuable. Els tests només compten com a tests si són executables i comproven comportament observable, o si el microrepte encara no demana automatització i deixen una prova manual reproduïble amb passos, dades i resultat esperat.

## Notes per repte i RA

S'ha afegit un script per agrupar les notes provisionals de microreptes per repte (`repte_id`) i per RA avaluat.

Per generar els agregats:

```bash
npm run grades:aggregate-repte
```

Si tens una nota docent per cada repte, pots afegir-la amb un fitxer JSON extern:

```bash
npm run grades:aggregate-repte -- --teacher-input examples/teacher-repte-grades.example.json
```

Aquest script genera:

- `grades/latest-repte-grades.json`
- `grades/latest-repte-grades.csv`

En aquests fitxers apareix:

- `ra_id`: RA principal del repte.
- `auto_score`: nota automàtica agregada per RA.
- `repte_id`: identificador del repte.
- `teacher_score`: nota docent global de repte si s'ha proporcionat.

El càlcul automàtic només consolida microreptes dins del mateix RA. No calcula una nota automàtica final del repte fent mitjana entre RA, perquè eixe pes no està definit. La nota global del repte queda reservada a la valoració docent (`teacher_score`).

Un microrepte pot continuar usant el model simple:

```json
{
  "primary_ra": "RA2",
  "assessed_ca": ["RA2.a", "RA2.b"]
}
```

Si ha d'avaluar més d'un RA, pot declarar blocs diferenciats:

```json
{
  "primary_ra": "RA2",
  "assessed_ca": ["RA2.a", "RA2.b"],
  "assessed_ra": [
    {
      "ra_id": "RA2",
      "assessed_ca": ["RA2.a", "RA2.b"],
      "weight": 1
    },
    {
      "ra_id": "RA3",
      "assessed_ca": ["RA3.e", "RA3.f"],
      "weight": 1
    }
  ]
}
```

En eixe cas, l'autocorrecció pot retornar `ra_scores` amb una nota independent per RA. Estes notes no es barregen entre elles: cada una alimenta l'agregat del seu RA dins del repte.

El dashboard mostra estes dades en la secció `Resultats`:

- `Notes orientatives per RA`: una nota automàtica per cada RA avaluat dins del repte.
- `Notes per repte`: resum de les notes RA i nota docent global editable del repte.

Quan guardes una nota docent des del dashboard, es desa en `grades/teacher-repte-grades.json`. També pots preparar o revisar el fitxer manualment amb este format:

```json
[
  {
    "repo": "cipfpbatoi/microreptes-i-igomis",
    "group": "2DAW-A",
    "repte_id": "r4-api-consum",
    "teacher_score": 8.5,
    "teacher_comment": "Valoració global del repte.",
    "teacher_review_required": false,
    "source": "teacher-review"
  }
]
```

## Com obtindre l'artifact en GitHub Actions

En GitHub:

1. Obri el repositori del professor.
2. Entra en la pestanya `Actions`.
3. Selecciona una execucio del workflow `Batch autograde student repositories`.
4. Descarrega l'artifact generat per eixa execucio.
5. Descomprimeix-lo i localitza el resultat dins de `grades/history/<batch-id>/`.

Esta versio no descarrega artifacts automaticament des de la GitHub API.

## Import manual al repositori del professor

Guarda el fitxer descarregat en una ruta temporal, per exemple `downloads/autograde-result.json`, i executa:

```bash
npm run grades:import -- \
  --input ./downloads/autograde-result.json \
  --repo cipfpbatoi/dwes-ana-marti \
  --group 2DAW-A \
  --source manual-import
```

També es pot usar el script base:

```bash
npm run grades:append -- \
  --input tmp/autograde-result.json \
  --repo cipfpbatoi/dwes-ana-marti \
  --group 2DAW-A \
  --source mock
```

Els registres s'afigen a:

- `grades/latest-grades.json`
- `grades/latest-grades.csv`

Els fitxers `latest-grades.json` i `latest-grades.csv` mantenen un únic registre vigent per parella `repo + challenge_id`. Si importes dues vegades la mateixa parella, la segona substitueix la primera.

Com que estos fitxers no es commitegen, conserva'ls localment o descarrega l'artifact `batch-autograde-results` quan la correccio s'ha executat des de GitHub Actions.

Per revisar les notes agregades:

```bash
npm run grades:list
```

Per descarregar i importar automàticament l'últim artifact correcte en el servidor:

```bash
npm run grades:download-latest
```

Des del dashboard, el botó **Actualitzar** de la vista `Resultats` executa aquesta importació automàtica i recarrega la taula.

## Informe per preparar la classe següent

Després de corregir un microrepte, pots generar un informe per grup. L'objectiu és donar al professorat d'eixe grup una visió ràpida de:

- on ha fallat més l'alumnat;
- quins bloquejos convé revisar en classe;
- quines dimensions han quedat més baixes;
- quines preguntes o prompts d'IA apareixen en `docs/ai-log.md`;
- qui no té AI log o evidències actives localitzades.

```bash
npm run grades:class-report -- \
  --group 2DAW-C \
  --challenge-id r2-s03-logica-flux-regles-projecte
```

El resultat es guarda en:

```text
grades/reports/<challenge-id>-<group>.md
```

L'informe és per `group + challenge_id`, perquè cada grup pot tindre professorat, ritme i dificultats diferents.

## Nota provisional i nota validada

Una nota provisional es el resultat calculat per autograding a partir d'una execucio concreta. Pot ajudar a prioritzar revisions i donar feedback inicial, pero pot contindre errors o requerir interpretacio docent.

Una nota validada es la qualificacio revisada i confirmada pel professorat. Les dades de `grades/` no substituixen eixa validacio posterior.

## Ampliació global

Consulta [càlcul i validació de l’ampliació](ampliacio-repte.md). Es gestiona només des de l’últim microrepte i suma una sola vegada al repte complet.

## Ús d’IA i revisió docent

La norma del curs permet explicacions conceptuals, pistes sobre intents propis i suggeriments de casos límit; no permet delegar el backend, la configuració avaluable ni les proves en xats o agents autònoms. Generar HTML estàtic/CSS de presentació està permés si es declara i revisa; no inclou PHP ni lògica funcional avaluable.

No penalitzar la declaració de no ús d’IA ni exigir consultes fictícies. Si el registre està requerit, la declaració de no ús és vàlida. No confondre una plantilla buida amb esta declaració. L’AI log i l’estil del codi no proven autoria ni infracció per si sols: les incoherències concretes s’han de descriure per a contrast docent, sense acusacions ni deduccions automàtiques noves.

Referència: [norma docent d’ús d’IA](https://igomis.github.io/reestructuracioModul/us-ia-professorat-i-alumnat/).
