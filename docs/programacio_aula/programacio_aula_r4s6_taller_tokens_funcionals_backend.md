# R4S6. Variant ampliada del taller de tokens funcionals del backend

## Finalitat de la sessió

Esta peça és un taller de reforç del `Repte 4`. No crea un microrepte nou: dona forma operativa a la línia futura de tokens funcionals prevista en el projecte base i la connecta amb una necessitat real del domini.

El focus no és implantar `JWT`, `OAuth`, `Ethereum`, `NFT`, `blockchain` o una arquitectura professional completa d'identitat. El focus és entendre i documentar un token funcional limitat: confirmació, cancel·lació, invitació, recuperació, accés puntual o traçabilitat d'una operació concreta.

El format base és el microtaller `MT17`, de `60` minuts, integrat preferentment en `R4S3` després de definir la protecció de l'API. Esta fitxa descriu la variant ampliada de `3` hores si el centre disposa de marge o si el projecte necessita prototipar el flux tokenitzat.

## Encaix dins del Repte 4

- **Repte**: `R4. API i serveis reutilitzables`
- **Microrepte**: cap de nou; taller de reforç associat a `R4M3`, `R4M4` i `R4M5`
- **Sessió preferent**: franja final de `R4S3`; variant ampliada `R4S6`
- **Duració base del microtaller**: `60 min`
- **Duració de la variant ampliada**: `3 hores`
- **Focus**: token funcional del domini, abast limitat, caducitat, ús únic si correspon, validació, resposta d'error i traçabilitat
- **No entra encara**: `web3`, Ethereum, NFT, pagaments, `OAuth` complet, `refresh tokens`, permisos corporatius avançats o substitució del sistema d'autenticació del projecte

## Encaix temporal recomanat

| Format | Moment | Ús recomanat |
|---|---|---|
| Microtaller base | `R4S3`, `2:00-3:00` | si només cal dissenyar cicle de vida, cas vàlid i cas denegat |
| Variant ampliada | `R4S6`, sessió de `3 hores` | si el projecte necessita implementar o prototipar el token funcional |

## Relació amb RA i criteris de treball

| Element | Concreció en el taller |
|---|---|
| `RA7.e` | servei o endpoint amb accés limitat mitjançant token |
| `RA7.f` | comprovació de cas vàlid, invàlid, caducat o ja consumit |
| `RA7.h` | documentació del contracte i de les limitacions del token |
| `RA6.g` | registre d'una decisió tècnica que afecta manteniment i traçabilitat |
| Evidència central | mapa de cicle de vida del token i prova reproduïble |
| Verificació docent | pregunta sobre qui genera, valida, consumeix i revoca el token |

## Connexió amb el projecte base

Els tokens funcionals només són adequats si resolen una necessitat real del domini:

- en un gestor d'incidències, token extern de consulta o seguiment;
- en un sistema de reserves, token de confirmació o cancel·lació;
- en un inventari, token d'operació puntual, invitació o traça d'autorització;
- en qualsevol domini, recuperació o invitació si té sentit funcional.

Si el projecte no necessita cap flux tokenitzat, el taller pot treballar-se com a disseny justificat i no com a implementació completa.

## Producte esperat

Cada equip ha de deixar una evidència curta, per exemple:

```text
docs/token-flow.md
```

El document ha d'incloure:

- cas d'ús que justifica el token;
- actor que el genera;
- actor o sistema que el consumeix;
- recurs o operació afectada;
- abast del token;
- temps de caducitat;
- si és d'ús únic o reutilitzable;
- què es guarda en base de dades o registre;
- endpoint o acció que valida el token;
- resposta quan el token és vàlid;
- resposta quan falta, és invàlid, caducat o ja consumit;
- riscos i limitacions conegudes.

## Preparació prèvia del professorat

- Portar exemples de tokens funcionals diferents de l'autenticació general.
- Preparar una comparació curta entre token d'API, token de sessió i token d'operació.
- Tindre un exemple de taula o registre de tokens amb `hash`, `expires_at`, `used_at` i referència al recurs.
- Preparar una prova negativa: token absent, manipulat, caducat o ja consumit.

## Seqüència d'aula de 3 hores

### 0:00-0:20. Diferenciar autenticació i token funcional

El professorat mostra per què un token d'operació no equival a iniciar sessió. Es revisen exemples de confirmació, invitació, cancel·lació i seguiment.

Resultat: l'alumnat sap quin problema resol i quin no resol un token.

### 0:20-0:45. Elecció del flux tokenitzat

Cada equip tria un cas d'ús del seu domini o justifica que només farà disseny.

Resultat: hi ha un flux concret i no una tècnica decorativa.

### 0:45-1:25. Model del cicle de vida

Tasques:

- decidir qui crea el token;
- decidir què queda associat al token;
- definir caducitat i ús únic si correspon;
- definir com es valida;
- definir què es registra després del consum.

Resultat: el token té regles de negoci i límits verificables.

### 1:25-2:05. Implementació o prototip controlat

L'alumnat implementa una part mínima o prepara un prototip executable segons l'estat del projecte.

Resultat: hi ha una validació observable o un disseny tècnic defensable.

### 2:05-2:35. Prova positiva i negativa

Es comprova el cas correcte i almenys un cas incorrecte: absent, manipulat, caducat, repetit o sense permís sobre el recurs.

Resultat: el comportament no depén només del cas feliç.

### 2:35-3:00. Documentació i checkpoint

S'actualitza `docs/token-flow.md`, README o document d'API i es prepara una explicació curta.

Pregunta de checkpoint: què podria fer una persona amb eixe token i què no podria fer?

## Tasques concretes de l'alumnat

- Triar o descartar justificadament un flux tokenitzat.
- Documentar el cicle de vida del token.
- Implementar o prototipar la validació mínima si el projecte ho permet.
- Provar un cas vàlid i un cas incorrecte.
- Registrar limitacions i deutes tècnics.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Cas d'ús | el token respon a una necessitat del domini |
| Cicle de vida | generació, validació, caducitat i consum descrits |
| Abast | queda clar què permet i què no permet |
| Prova | cas vàlid i cas incorrecte o disseny defensat |
| Documentació | `docs/token-flow.md` o equivalent |
| Traçabilitat | decisió tècnica registrada en README, nota tècnica de decisió o AI log si aplica |

## Criteris d'èxit

- El token no és decoratiu.
- L'abast és limitat i explicable.
- La caducitat o ús únic està decidit.
- El cas incorrecte està previst.
- L'alumnat pot diferenciar token funcional, sessió i autenticació general.

## Què no és suficient

- Afegir una cadena aleatòria sense caducitat ni ús definit.
- Dir que és `JWT` sense justificar per què cal.
- Donar accés complet al sistema amb un token d'operació.
- No registrar què passa quan el token es consumeix.
- Fer només una captura sense explicar generació i validació.

## Ús de la IA

La IA pot ajudar a dissenyar el cicle de vida, revisar riscos o generar proves. L'alumnat ha de contrastar que el flux encaixa amb el domini i que no exposa secrets o permisos excessius.

## Suport i ampliació

Per a suport, documentar el flux i validar manualment un token simple. Com ampliació, guardar només el `hash` del token, afegir expiració real, ús únic, registre d'auditoria, reintent controlat o proves automatitzades.

## Checklist de tancament

- [ ] Cas d'ús tokenitzat triat o descartat justificadament.
- [ ] Cicle de vida documentat.
- [ ] Abast i caducitat definits.
- [ ] Cas vàlid provat o dissenyat.
- [ ] Cas incorrecte previst.
- [ ] Limitacions registrades.

## Connexió amb el Repte 5

En `R5`, este flux pot alimentar una integració externa: confirmacions enviades per correu, webhooks, consulta externa d'estat, invitacions o automatitzacions. Si el token no té valor per al producte, no s'ha d'arrossegar artificialment al tancament.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT17. Tokens funcionals del backend](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT17-Tokens-funcionals-del-backend.pdf)
- **Teoria o material associat**: [Protecció, consum i documentació d'API](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R4-Proteccio-consum-i-documentacio-dAPI.pdf)

## Microtaller associat

- **Microtaller**: `MT17. Tokens funcionals del backend`
- **Moment recomanat**: com a obertura del taller, abans de dissenyar el cicle de vida del token.
- **Evidència mínima**: flux tokenitzat amb cas vàlid, cas invàlid i límits del token.

## Seguiment dels pendents

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md) en els trams de revisió i checkpoint d’esta sessió. Identificar els bloquejos abans del treball que en depén, donar ajuda concreta per continuar i comprovar la comprensió. Els microreptes són treball d’aula i no es recuperen individualment; la recuperació correspon al repte complet. Si és una sessió inicial sense treball previ, comprovar el punt de partida. Esta actuació no crea un microrepte propi ni una nota addicional.
