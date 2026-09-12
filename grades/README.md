# Notes provisionals

La carpeta `grades/` conte registres provisionals d'autograding agregats manualment al repositori del professor. Excepte aquest `README.md`, el contingut de la carpeta es genera localment o en GitHub Actions i queda ignorat per Git.

Hi ha tres nivells diferents:

- Resultat brut d'una execucio: el fitxer `autograde-result.json` generat en un repositori d'alumne per una execucio concreta del workflow.
- Agregacio central: els fitxers `latest-grades.json` i `latest-grades.csv`, que mantenen l'últim registre per parella `repo + challenge_id`.
- Historial per tanda: la carpeta `grades/history/`, amb una subcarpeta per cada execucio massiva i cada repositori corregit.
- Validacio docent posterior: la revisio final feta pel professorat abans de considerar una nota com a definitiva.

Les notes d'esta carpeta son provisionals. Servixen per centralitzar resultats i facilitar el seguiment, pero no substituixen la revisio docent ni la qualificacio validada.

## Duplicats

`latest-grades.json` i `latest-grades.csv` no acumulen duplicats del mateix repositori i autocorreccio. Si una entrega es corregeix de nou, la fila vigent se substitueix.

L'historial complet de cada execucio massiva queda guardat en `grades/history/` durant l'execucio i es publica en l'artifact `batch-autograde-results`.

## Historial

El workflow de correccio massiva guarda resultats en:

```text
grades/history/<batch-id>/<repo-segur>/
```

Cada carpeta de repositori conte:

- `autograde-result.json`
- `autograde-result.md`
- `evaluation-payload.json`
- `grade-record.json`
- `openai-raw-response.json`, només en mode `openai`
