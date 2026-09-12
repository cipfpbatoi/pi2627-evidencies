# Ampliació del repte: càlcul i presentació

## Càlcul i validació de l'ampliació global

Les notes dels microreptes continuen sobre 10 i valoren només el nucli. La nota global del repte es calcula una sola vegada:

```text
nucli = suma(nota_microrepte × pes) / suma(pesos)
nota_repte = 0,9 × nucli + ampliacio_validada
```

El nucli aporta fins a 9 punts i l'ampliació fins a 1. S'arredonix només el resultat final a dos decimals. Les notes curriculars per RA es mantenen separades: no es torna a sumar l'ampliació a cada RA ni a cada microrepte.

| Repte | Únic microrepte que recull l'ampliació | Declaració |
|---|---|---|
| R1 | R1M2 | `docs/r1-ampliacio.md` |
| R2 | R2M9 | `docs/r2-ampliacio.md` |
| R3 | R3M7 | `docs/r3-ampliacio.md` |
| R4 | R4M5 | `docs/r4-ampliacio.md` |
| R5 | R5M5 | `docs/r5-ampliacio.md` |

La declaració identifica l'últim microrepte, explica el valor aportat al repte complet i enllaça implementació, proves, decisions i ús d'IA. L'ampliació pot desenvolupar-se abans, però només es proposa i valida en este punt final. Les activitats d'aprofundiment anteriors no generen punts independents. El taller opcional R2S10 pot aportar evidències a la declaració de R2, sense crear un nou microrepte amb nota.

| Qualitat de l'ampliació | Punts proposats/validats |
|---|---:|
| Absent o no funcional | 0 |
| Parcial, amb mancances importants | 0,25 |
| Funcional, amb verificació o justificació incompleta | 0,50 |
| Completa i verificada, amb una mancança menor | 0,75 |
| Completa, verificada i ben justificada | 1 |

L'autocorrector proposa els punts i assenyala evidències i preguntes per a la presentació. El professorat confirma o ajusta la proposta, comprova els mínims obligatoris del repte i guarda una observació. Sense mínims coberts no es poden sumar punts d'ampliació. Si no hi ha ampliació, el professorat pot validar explícitament 0; l'absència d'una proposta automàtica no impedix la revisió manual.

Pendent de revisió no significa zero: la base és visible, però la nota global queda pendent. Si falten correccions obligatòries, no es pot validar. Una nova correcció que canvie la instantània revisada torna a deixar la validació pendent. Validar l'ampliació tampoc elimina altres avisos de revisió docent del nucli.

Exemples: nucli 10 sense ampliació validada (0) → 9; nucli 10 amb ampliació 1 → 10; nucli 8 amb ampliació 0,5 i mínims confirmats → 7,70. Fer una ampliació no garantix arribar a 9.

Este criteri substituïx la fórmula anterior `min(nucli, 9) + ampliació`: és un canvi d'escala explícit. Les correccions originals dels microreptes es conserven, i una nova agregació aplica la fórmula actual sense inventar validacions docents.

## Contracte tècnic

L'últim `challenge.json` ordinari de cada repte conté `repte_extension` amb criteris derivats de l'enunciat i ruta de declaració. `npm run validate` rebutja més d'un propietari o un propietari anterior a l'últim microrepte. L'antic `r2-ampliacio-9-10` està retirat per a noves correccions; els historials es conserven i no entren en la mitjana.

La resposta de la IA incorpora `repte_extension` només quan el payload ho habilita: `proposed_score`, `core_ready`, `reason`, `evidence`, `presentation_checks`. El resultat sobre 10 i `ra_scores` continuen valorant exclusivament el nucli. Les propostes es conserven en JSON, CSV i la base de dades del dashboard.

El dashboard mostra la proposta i el formulari de validació només en l'últim microrepte (o en la vista global, identificant eixe microrepte). Guarda `extension_review` i historial en `grades/teacher-repte-grades.json`, amb el microrepte origen, una instantània de les correccions, punts validats, confirmació dels mínims, observació i data. L'API també comprova l'origen: no és només una restricció visual.

`npm run grades:aggregate-repte -- --teacher-input grades/teacher-repte-grades.json` usa la mateixa funció de càlcul que el dashboard. El JSON agregat conté `extension`, `auto_score` (base sobre 9), `final_score` (null fins a validar) i `provisional`. El CSV inclou `final_score`, `extension_status` i `extension_validated`. La nota docent global preexistent continua sent un camp separat i no se sobreescriu amb el càlcul.

La nota global usa els pesos de microreptes normalitzats per la seua suma. No inventa pesos curriculars de RA ni transforma les notes RA. R2 té actualment pesos que sumen 1,16; la normalització és explícita i no els modifica.

## Comprovar el canvi

```bash
npm run validate
npm test
```

No cal consumir l'API d'IA per validar el càlcul, la persistència o els controls. Les correccions prèvies sense proposta continuen disponibles i admeten validació docent manual des de l'últim microrepte.

## Proposta incoherent de la IA

Si la proposta d’ampliació és invàlida o positiva sense mínims/evidències, el motor conserva la nota del nucli, bloqueja la proposta a 0 i marca revisió docent. No és una validació a zero: la nota global continua pendent. La proposta original queda en la justificació i la resposta completa es conserva en `openai-raw-response.json`. Els errors de l’avaluació del nucli continuen fent fallar la validació.
