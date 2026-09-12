# Actualitzar repositoris ja generats per GitHub Classroom

Els repositoris creats per GitHub Classroom no hereten automàticament els canvis posteriors del repositori base.

Si el template `dwes-microreptes-alumnes` canvia, cada repositori d'alumne ja creat s'ha d'actualitzar manualment o amb un commit automatitzat.

## Fitxers mínims que cal sincronitzar

Perquè l'autocorrecció actual funcione amb evidències reals del repositori de l'alumne, copia o actualitza estos fitxers de suport:

- `docs/autograde.md`
- `ENTREGA.md`, si encara no existeix en el repositori de l'alumne.

El `README.md` és el fitxer de treball de l'alumne: si ja existeix, no s'ha de sobreescriure. `ENTREGA.md`, `docs/ai-log.md`, `evidence/README.md` i `tests/README.md` són recomanables com a suport de template, però si l'alumne ja els ha modificat no convé sobreescriure'ls sense revisar.

No cal copiar workflows de GitHub Actions ni scripts d'autocorrecció al repositori de l'alumne. La correcció es llança des del repositori del professor i la recollida d'evidències es fa amb `scripts/collect-repo-evidence.mjs` del repositori docent.

## Configuració del repositori d'alumne

En el repositori de l'alumne no cal definir secrets ni variables d'autograding. El grup docent es resol des de la llista central de repositoris o des de l'input del workflow massiu.

La clau `OPENAI_API_KEY` i el token amb permisos sobre repositoris d'alumnes es configuren en el repositori del professor. No cal copiar-los als repositoris d'alumnes.

## Prova manual

Des de GitHub Actions del repositori del professor:

1. Obri `Batch autograde student repositories`.
2. Executa `Run workflow`.
3. Indica `mode = mock` per comprovar el flux sense API.
4. Indica un repositori concret en `repositories` si vols provar només un alumne.

El workflow genera estos artefactes centrals:

- `repo-signals.json`
- `evidence-summary.json`
- `evaluation-payload.json`
- `autograde-result.json`
- `openai-raw-response.json`, només si s'executa el mode `openai`.
