# Arquitectura

## Nucli del Projecte Intermodular

La nova unitat de treball és el projecte, identificat obligatòriament per `id`, nom i repositori. L'aplicatiu no conserva parelles, canvis de custòdia ni notes individuals.

```text
course/projects.json
  -> projecte amb nom i repositori
pi/checkpoints/*.json
  -> fitxers, evidències i RA/CA candidats
repositori del projecte + release/commit
  -> recopilador
  -> fitxers + historial delimitat pel control anterior
  -> informe JSON immutable amb evidències i indicis de procés
  -> esborrany de revisió individual vinculat al commit
  -> Aules
```

Entitats conceptuals mínimes:

- `project`: identificació i nom;
- `checkpoint`: fase i evidències esperades;
- `evaluation_run`: projecte, punt de control i commit;
- `evidence_report`: comprovacions, avisos i evidències candidates.
- `process`: cronologia, distribució temporal i àrees orientatives deduïdes dels missatges dels commits.
- `teacher_review_draft`: files manuals per persona i CA amb evidència, funció, abast i observació; sempre sense qualificació.

No formen part del nucli `team`, `custody` ni `grade`. La unitat recopilada continua sent el projecte. La persona només s'incorpora manualment a l'esborrany de revisió per poder atribuir una evidència contrastada; l'atribució i el registre oficial continuen resolent-se en Aules.

La traça temporal tampoc incorpora una puntuació de commits. El recompte, els dies actius, els buits i els comptes Git són senyals per dirigir la revisió. L'aplicatiu no pot determinar per si sol si la seqüència és pedagògicament coherent, si un canvi concentrat estava justificat o si l'autoria tècnica coincidix amb l'aprenentatge individual.

La resta d'esta pàgina descriu l'arquitectura anterior de DWES, conservada temporalment.

## Visio conceptual

El sistema es planteja amb una separacio clara entre configuracio docent i treball de l'alumnat.

- Repositori central del professor:
  - defineix microreptes;
  - manté rúbriques;
  - publica polítiques globals;
  - conserva prompts base i esquemes de resposta;
  - valida que la configuracio siga coherent.
- Repositoris individuals d'alumnes:
  - contenen el codi de cada alumne;
  - executen workflows propis;
  - aporten evidències de prova, commits i documentacio mínima.
  - mantenen `README.md` com a fitxer principal d'entrega; `ENTREGA.md` és la guia base del template i els README de carpeta són índexs de carpeta, no l'evidència principal del microrepte.
- GitHub Actions:
  - valida este repositori central;
  - prepararà l'autocorrecció en repositoris d'alumnes;
  - permetrà execucions manuals de prova.
- Futur connector amb OpenAI:
  - rebrà evidències acotades;
  - retornarà una resposta estructurada segons `global/grading-schema.json`;
  - no substituirà la revisio docent quan hi haja baixa confiança.
- Registre de notes:
  - podrà guardar resultats provisionals;
  - haurà de diferenciar nota automàtica i nota confirmada pel professorat.

## Esquema textual

```text
Professorat
  -> repositori central
    -> microreptes
    -> rubriques
    -> politiques
    -> workflows de validacio

Alumnat
  -> repositori individual
    -> solucio
    -> evidencies
    -> workflow de correccio
      -> consulta configuracio central
      -> genera feedback provisional
      -> marca revisio docent si cal
```

## Decisions inicials

- El repositori central no assumeix cap framework concret d'alumne.
- Les rúbriques són JSON per facilitar validacio automàtica.
- El feedback esperat és estructurat i també inclou resum en Markdown.
- Les notes automàtiques són provisionals fins que la política indique el contrari.
- Les crides a IA queden fora de la primera versio executable.
- L'autocorrecció ha de prioritzar `README.md` i els fitxers concrets de `docs/`, `evidence/`, `tests/` i `src/`; no ha de puntuar `ENTREGA.md` ni els README de carpeta del template com si foren treball de l'alumne.
