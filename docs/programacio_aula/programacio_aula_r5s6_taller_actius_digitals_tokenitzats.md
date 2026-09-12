# R5S6. Variant ampliada del taller d'actius digitals tokenitzats

## Finalitat de la sessió

Esta peça és un taller d'ampliació del `Repte 5`. No crea un microrepte nou: obri una via avançada per entendre què significa tokenitzar un actiu digital o representar drets sobre un recurs mitjançant un token.

El focus no és especular, comprar criptomonedes ni desplegar en xarxes amb diners reals. El focus de `DWES` és entendre el model backend que hi ha darrere: actiu, titularitat, identificador, traçabilitat, contracte, API, evidències i límits.

El format base és el microtaller `MT18`, de `50` minuts, integrat preferentment en `R5S4` quan la integració híbrida ja té forma. Esta fitxa descriu la variant ampliada de `3` hores si el centre disposa de marge o si el grup pot prototipar una simulació sense convertir-la en el centre del repte.

## Encaix dins del Repte 5

- **Repte**: `R5. Integració híbrida i tancament`
- **Microrepte**: cap de nou; taller d'ampliació associat a `R5M1`, `R5M2`, `R5M3`, `R5M4` i `R5M5`
- **Sessió preferent**: franja final de `R5S4`; variant ampliada `R5S6`
- **Duració base del microtaller**: `50 min`
- **Duració de la variant ampliada**: `3 hores`
- **Focus**: actiu digital, token, propietat o dret representat, traçabilitat, API, simulació o testnet, riscos i justificació tècnica
- **No entra encara**: diners reals, inversió, especulació, custòdia professional, seguretat blockchain de producció o desplegament en mainnet

## Encaix temporal recomanat

| Format | Moment | Ús recomanat |
|---|---|---|
| Microtaller base | `R5S4`, `2:10-3:00` | si només cal decidir si tokenitzar aporta valor i deixar mapa tècnic |
| Variant ampliada | `R5S6`, sessió de `3 hores` | si el grup pot prototipar una simulació o prova controlada sense diners reals |

## Relació amb RA i criteris de treball

| Element | Concreció en el taller |
|---|---|
| `RA9.a` | identificació d'un sistema extern o model híbrid relacionat amb actius digitals |
| `RA9.b` | disseny del flux d'integració entre backend propi i registre/token |
| `RA9.c` | connexió, simulació o prova controlada del mecanisme extern |
| `RA9.e` | mapping entre recurs del domini i actiu digital representat |
| `RA9.f` | tractament d'errors, límits, duplicitats o inconsistències |
| `RA9.h` | documentació i defensa de la decisió tècnica |
| `RA7.d` | API o servei per consultar, crear o verificar l'actiu |
| `RA7.e` | interpretació de resposta, estat i errors del servei |
| Evidència central | mapa d'actiu digital i prova reproduïble en simulació o entorn segur |
| Verificació docent | explicació de què està tokenitzat, què no ho està i per què |

## Connexió amb el projecte base

El taller pot encaixar amb els tres dominis:

- inventari: certificat digital d'un actiu, historial de transferència o prova de propietat;
- reserves: dret d'ús temporal, abonament, entrada o reserva verificable;
- incidències: certificat de resolució, evidència de servei o registre verificable d'una actuació.

La tokenització només és defensable si aporta traçabilitat, verificació o interoperabilitat. Si només substituïx una fila de base de dades per una paraula més cridanera, no aporta valor docent.

## Producte esperat

Cada equip ha de deixar una evidència curta, per exemple:

```text
docs/digital-asset-tokenization.md
```

El document ha d'incloure:

- actiu o dret que es vol representar;
- per què té sentit tokenitzar-lo o per què es descarta;
- dades que queden en el backend propi;
- dades que quedarien en token, contracte, registre extern o simulació;
- identificador únic de l'actiu;
- operacions possibles: crear, transferir, verificar, revocar o consultar;
- mapa del flux entre backend, usuari i registre/token;
- decisió sobre simulació, testnet o només disseny;
- cas positiu provat o prototipat;
- cas d'error o límit documentat;
- riscos: privacitat, pèrdua de claus, duplicats, cost, irreversibilitat o dependència externa.

## Preparació prèvia del professorat

- Preparar un exemple simple d'actiu digital no especulatiu.
- Portar una comparació entre base de dades, registre auditable i token en blockchain.
- Definir que no s'usaran diners reals ni mainnet.
- Preparar una simulació mínima: identificador d'actiu, emissió, transferència i verificació.
- Tindre preparades preguntes sobre si realment cal blockchain o si bastaria un registre intern.

## Seqüència d'aula de 3 hores

### 0:00-0:20. Què és tokenitzar un actiu

El professorat diferencia token funcional de backend, token d'autenticació i tokenització d'actius digitals.

Resultat: l'alumnat sap que este taller és una ampliació avançada i no substituïx el flux normal del projecte.

### 0:20-0:45. Elecció de l'actiu o dret

Cada equip tria un actiu del seu domini o justifica que no té sentit tokenitzar-lo.

Resultat: hi ha un objecte, dret o evidència concreta, no una idea abstracta.

### 0:45-1:20. Model de dades i frontera tècnica

Tasques:

- definir l'actiu en el backend;
- decidir quin identificador l'enllaça amb el token;
- separar dades privades de dades verificables;
- decidir quines operacions són possibles.

Resultat: queda clara la frontera entre backend i registre/token.

### 1:20-2:00. Simulació o prototip segur

L'alumnat prepara una simulació local, pseudocontracte, testnet controlada o document tècnic executable segons el nivell del grup.

Resultat: hi ha una prova reproduïble sense diners reals.

### 2:00-2:35. Errors, riscos i límits

Es revisen casos com actiu duplicat, transferència no autoritzada, token inexistent, pèrdua de clau, dada sensible exposada o registre extern no disponible.

Resultat: la proposta no queda com a demostració superficial.

### 2:35-3:00. Documentació i defensa curta

S'actualitza `docs/digital-asset-tokenization.md` i es prepara una defensa breu.

Pregunta de checkpoint: què guanyes tokenitzant este actiu que no tindries amb una base de dades normal?

## Tasques concretes de l'alumnat

- Triar o descartar justificadament un actiu tokenitzable.
- Modelar la relació entre actiu del domini i token.
- Preparar simulació, testnet controlada o disseny executable.
- Provar un cas correcte o descriure'l de manera reproduïble.
- Documentar almenys un error o risc.
- Defensar si la tokenització aporta valor o és innecessària.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Actiu | recurs, dret o evidència concreta del domini |
| Justificació | explica per què tokenitzar aporta o no aporta valor |
| Model | separa backend propi i registre/token |
| Prova | simulació, testnet controlada o disseny reproduïble |
| Error | risc o fallada documentada |
| Documentació | `docs/digital-asset-tokenization.md` o equivalent |

## Criteris d'èxit

- L'actiu està ben definit.
- La tokenització no és decorativa.
- No s'usen diners reals ni entorns de producció.
- El backend propi continua sent explicable.
- L'alumnat sap defensar avantatges, costos i límits.

## Què no és suficient

- Dir "NFT" o "Ethereum" sense actiu ni flux.
- Fer una demo copiada sense entendre què representa el token.
- Exposar dades personals o sensibles en un registre públic.
- Presentar especulació econòmica com a objectiu tècnic.
- No comparar la solució amb una base de dades o registre auditable normal.

## Ús de la IA

La IA pot ajudar a entendre conceptes, escriure un pseudocontracte, generar una simulació o revisar riscos. L'alumnat ha de contrastar cada proposta i no pot delegar la justificació de per què la tokenització té sentit.

## Suport i ampliació

Per a suport, fer una simulació local sense blockchain real: taula d'actius, registre d'emissions i transferències, identificador únic i verificació. Com ampliació, usar una testnet, un contracte senzill, metadades externes o una API de verificació.

## Checklist de tancament

- [ ] Actiu o dret definit.
- [ ] Valor de la tokenització justificat o descartat.
- [ ] Frontera backend/token documentada.
- [ ] Simulació o prova segura preparada.
- [ ] Risc o error documentat.
- [ ] Comparació amb alternativa no blockchain.

## Connexió amb la defensa final

Este taller pot aparéixer en la defensa final com a ampliació avançada. La defensa ha de centrar-se en model, contracte, integració, riscos i decisió tècnica, no en valor econòmic ni especulació.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT18. Actius digitals tokenitzats](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT18-Actius-digitals-tokenitzats.pdf)
- **Teoria o material associat**: [Integració externa i flux híbrid](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R5-Integracio-externa-i-flux-hibrid.pdf) i [Mapping, proves i defensa d'una integració](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R5-Mapping-proves-i-defensa-duna-integracio.pdf)

## Microtaller associat

- **Microtaller**: `MT18. Actius digitals tokenitzats`
- **Moment recomanat**: com a obertura del taller, abans de decidir si l'actiu realment mereix ser tokenitzat.
- **Evidència mínima**: actiu o dret definit, frontera backend/token i comparació amb una alternativa no blockchain.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
