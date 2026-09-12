# R2S2. Processament, reintent i guardat funcional

## Finalitat de la sessió

Esta sessió continua el microrepte `R2M1`: el formulari ja envia dades, el servidor les rep i almenys una condició simple pot mostrar un error. Ara el pas natural és millorar el reintent.

El focus principal és que, quan hi ha un error, el servidor torne a generar el formulari conservant les dades aprofitables que l'usuari ja havia escrit o seleccionat. Quan l'entrada ja és correcta, també és coherent processar-la i guardar-la de manera funcional simple perquè el flux no quede en una demo efímera.

Al final de la sessió, cada alumne o parella ha de poder demostrar dos camins: un enviament amb error que conserva dades per al reintent, i un enviament correcte que es processa i queda guardat funcionalment de manera simple.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M2`
- **Sessió**: `R2S2`
- **Duració orientativa**: `3 hores`
- **Focus**: recuperació de dades enviades, tractament en servidor, resposta generada amb valors conservats, error visible, reintent corregit i guardat funcional simple quan l'entrada és correcta
- **No entra encara**: persistència formal com a centre del treball, base de dades obligatòria, sessió, cookies, login, rols, arquitectura MVC, arrays d'errors com a mínim, checkbox múltiple o fitxers

Esta frontera no expulsa els arrays d'errors ni la validació més completa del `Repte 2`; només indica que no són el mínim de `R2M2`. En esta sessió el criteri de tancament és demostrar el reintent amb dades conservades i el guardat funcional del cas correcte. La validació acumulada pot entrar com a ampliació o en una consolidació posterior del mateix repte.

## Frontera amb `R2S1`

`R2S2` no és “fer un altre formulari”. Ha de partir del flux de `R2S1` i respondre una pregunta nova:

> Què fa el servidor perquè l'usuari puga corregir l'error sense perdre dades útils, i què passa amb la informació quan el cas ja és correcte?

Per tant, la sessió només està ben tancada si es poden demostrar els dos camins:

- cas amb error: formulari regenerat amb dades aprofitables conservades;
- cas correcte: informació processada i guardada funcionalment amb un mecanisme simple.

La sessió també ha de mantindre la dada que farà possible `R2S3`: categoria, franja, prioritat, tipus, quantitat, estat inicial o equivalent. Si eixa dada desapareix en el reintent o se substitueix per un literal fix, el flux queda pobre per a la sessió següent.

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA2` | generació de resposta amb codi de servidor, ús de variables, sentències simples, valors calculats per a la vista i àmbits bàsics |
| `RA3` | recuperació de dades de formulari, tractament de valors, error visible i reintent amb conservació de la informació aprofitable |
| Evidència central | formulari que, després d'un error, torna carregat amb dades aprofitables; entrada correcta processada i guardada funcionalment |
| Verificació docent | execució d'un cas amb error i d'un cas correcte, comprovant valors conservats, reenviament i guardat simple |

## Producte esperat

Una evolució del flux de `R2M1` que incloga, com a mínim:

- recuperació de les dades enviades amb `$_POST` o mecanisme equivalent;
- tractament mínim de les dades abans de tornar-les a mostrar;
- detecció d'un error en servidor;
- missatge d'error visible;
- formulari regenerat pel servidor amb les dades aprofitables conservades;
- correcció només de la dada errònia;
- reenviament correcte amb resposta final;
- processament de l'entrada correcta;
- guardat funcional simple de la informació correcta;
- reutilització mínima de la dada guardada, encara que siga en una llista, resum o pantalla posterior;
- conservació o processament d'almenys una dada classificada que puga alimentar una regla en `R2S3`;
- nota breu al `README`, issue o registre indicant com provar el cas amb error i el reintent.

La conservació de dades en esta sessió té dos nivells diferents: conservar valors dins del formulari quan hi ha error, i guardar funcionalment la informació correcta quan el formulari ja passa la validació. Cap dels dos nivells obliga encara a una persistència formal o a una base de dades.

## Preparació prèvia del professorat

Abans de la sessió convé tindre preparat:

- un formulari mínim amb text, select o radio i checkbox;
- un exemple d'error de servidor que torne a mostrar el formulari;
- una mostra curta de com omplir `value`, `selected` o `checked` amb dades rebudes;
- una pauta sobre quines dades convé conservar i quines no;
- una pauta per revisar que la dada candidata a decisió de `R2S3` continua arribant i conservant-se;
- un mecanisme simple per guardar una entrada correcta;
- un exemple d'escapament o eixida segura de text abans de tornar-lo a pintar.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Recuperació de R2M1

El professorat demana executar el formulari de la sessió anterior amb un cas incorrecte.

Tasques:

- localitzar on es recuperen les dades;
- localitzar on es genera l'error;
- observar què passa amb les dades ja introduïdes;
- decidir quines dades té sentit conservar en el reintent.
- comprovar si la dada candidata per a `R2S3` continua existint en el flux.

Resultat del tram: cada equip sap quin problema d'usabilitat resoldrà en el reintent.

### 0:50-1:10. Modelatge docent

El professorat mostra un flux mínim:

- recepció de dades;
- normalització o preparació simple;
- variable d'error;
- generació del formulari amb valors conservats;
- ús de `value`, `selected` i `checked` o equivalent;
- reenviament corregit.

Resultat del tram: l'alumnat veu que el servidor no només valida, sinó que també reconstrueix una resposta útil per a corregir.

### 1:10-1:45. Conservació de dades de text i opció tancada

L'alumnat adapta el formulari perquè conserve almenys les dades més simples.

Tasques:

- conservar un camp de text o textarea;
- conservar una opció de select o radio;
- comprovar que el valor reapareix després de l'error;
- tractar o escapar el text abans de mostrar-lo;
- evitar conservar dades que no pertoquen.

Resultat del tram: el formulari ja no torna completament buit després d'un error.

### 1:45-2:10. Checkbox i cas d'error

L'alumnat revisa com es comporta el checkbox simple.

Tasques:

- comprovar què arriba quan el checkbox està marcat;
- comprovar què passa quan no està marcat;
- conservar l'estat `checked` si té sentit;
- mostrar l'error sense perdre la resta de dades aprofitables;
- mantindre la condició simple de validació.

Resultat del tram: el reintent conserva text, opció tancada i, si correspon, checkbox simple.

### 2:10-2:25. Reenviament corregit i guardat funcional

L'alumnat prova el cicle complet.

Tasques:

- enviar un cas amb error;
- comprovar que el formulari torna amb dades conservades;
- corregir només la dada errònia;
- reenviar;
- comprovar que la resposta correcta es genera.
- guardar la informació correcta amb un mecanisme simple;
- mostrar o recuperar la dada guardada en una resposta posterior.

Resultat del tram: el flux d'error i reintent és demostrable, i el cas correcte no es perd.

### 2:25-2:45. Traçabilitat i documentació mínima

L'alumnat deixa rastre del que ha fet.

Tasques:

- actualitzar el `README`, issue o registre de treball;
- escriure com provocar l'error;
- indicar quines dades es conserven;
- indicar què cal corregir per arribar al cas correcte.
- indicar què es guarda quan el cas és correcte i on es pot veure.

Resultat del tram: una altra persona pot repetir el reintent.

### 2:45-2:50. Checkpoint docent

Cada equip mostra:

- enviament incorrecte;
- error visible;
- formulari recarregat amb dades conservades;
- correcció de la dada errònia;
- reenviament correcte;
- guardat funcional simple del cas correcte;
- fragment de codi on es preparen els valors que tornen al formulari.

Pregunta de tancament: quines dades conserva el servidor per ajudar l'usuari a corregir, i en quin punt del codi es tornen a pintar?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Executar un cas incorrecte de `R2M1`.
- Recuperar les dades enviades en servidor.
- Preparar els valors que tornaran al formulari.
- Regenerar el formulari amb dades aprofitables conservades.
- Mostrar un error visible.
- Corregir només la dada errònia i reenviar.
- Processar i guardar funcionalment el cas correcte.
- Mantindre visible o recuperable la dada que pot alimentar una regla posterior.
- Reutilitzar o mostrar la dada guardada.
- Documentar com provar el reintent.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Recuperació | el codi llig les dades enviades pel formulari |
| Tractament | hi ha variables preparades per tornar a pintar valors |
| Error visible | el cas incorrecte mostra un missatge útil |
| Conservació | almenys text i opció tancada es mantenen després de l'error |
| Checkbox | es comprova i, si té sentit, es conserva el seu estat |
| Reintent | l'usuari corregeix només la dada errònia i reenvia |
| Guardat funcional | el cas correcte es conserva amb un mecanisme simple i explicable |
| Preparació per a R2S3 | una dada classificada del flux queda disponible per a una regla posterior |
| Documentació | el repositori explica com provar l'error i el reintent |

## Criteris d'èxit

El microrepte està aconseguit si:

- el formulari no torna buit després d'un error;
- l'error continua generant-se en servidor;
- les dades conservades corresponen a dades enviades realment;
- el codi mostra com es preparen els valors de resposta;
- el reintent permet corregir sense repetir-ho tot;
- el cas correcte queda processat i guardat funcionalment;
- el cas correcte acaba en una resposta final;
- l'alumnat pot assenyalar on es rep, on es valida i on es torna a pintar cada dada.

## Què no és suficient

- Mostrar un error però perdre totes les dades del formulari.
- Posar valors fixos en el formulari que no venen de l'enviament.
- Conservar dades sense validar o sense saber d'on ixen.
- Guardar una dada quan el formulari encara té error.
- Fer només validació de client.
- Introduir arrays d'errors abans d'entendre un reintent simple.
- Convertir la sessió en base de dades, login, sessió o arquitectura.
- Fer checkbox múltiple o fitxers com a mínim obligatori.

## Ús de la IA

La IA es pot usar per:

- recordar com omplir `value`, `selected` o `checked`;
- revisar una condició simple de reintent;
- proposar missatges d'error;
- explicar per què cal escapar text abans de mostrar-lo;
- ajudar a redactar la prova del `README`.

Control obligatori:

- l'alumnat ha de provar una dada pròpia;
- ha de poder canviar un valor del formulari i explicar per què es conserva;
- ha de diferenciar conservar en el reintent de guardar funcionalment un cas correcte;
- si la IA ha generat codi rellevant, s'ha de registrar breument al `AI log` o registre equivalent.

## Suport per alumnat amb més dificultat

Reduir el flux a:

- un camp de text obligatori;
- un select amb tres opcions;
- un error simple;
- formulari recarregat amb el text i el select conservats;
- reenviament correcte.

Frase guia: "No afegis més validacions fins que el formulari torne amb les dades que l'usuari no hauria de repetir."

## Ampliació per alumnat avançat

Si el mínim ja està tancat, l'alumnat pot:

- conservar més controls del formulari;
- acumular errors en un array i mostrar-los tots;
- conservar checkbox múltiple amb opcions permeses;
- millorar l'escapament i normalització de dades;
- millorar el mecanisme de guardat funcional del cas correcte;
- documentar casos positius i negatius amb més precisió.

L'ampliació no ha d'obrir encara sessió, autenticació ni arquitectura completa.

## Checklist de tancament

- [ ] He enviat un cas amb error.
- [ ] L'error es mostra en servidor.
- [ ] El formulari torna amb dades aprofitables conservades.
- [ ] Conserve almenys text i opció tancada.
- [ ] He revisat què passa amb el checkbox simple.
- [ ] Puc assenyalar on prepare els valors que tornen al formulari.
- [ ] Corregisc només la dada errònia i reenvie.
- [ ] El cas correcte genera resposta final.
- [ ] El cas correcte queda guardat funcionalment amb un mecanisme simple.
- [ ] Puc mostrar o recuperar la dada guardada.
- [ ] El `README`, issue o registre explica com provar el reintent.
- [ ] Si he usat IA, he registrat què m'ha aportat i què he verificat.

## Connexió amb R2M3

`R2M3` només té sentit si `R2M2` deixa clar com el servidor tracta dades, reconstrueix respostes i conserva funcionalment les entrades correctes. La pregunta de pas és:

Quina regla del teu projecte podrà aplicar el backend quan el flux d'entrada i reintent ja és comprensible?

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT03. Validació de servidor amb casos roïns](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT03-Validacio-de-servidor-amb-casos-roins.pdf)
- **Teoria o material associat**: [Reintent, conservació de dades i guardat funcional](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-Reintent-conservacio-de-dades-i-guardat-funcional.pdf)

## Microtaller associat

- **Microtaller**: `MT03. Validació de servidor amb casos roïns`
- **Moment recomanat**: quan el reintent i la conservació de dades ja mostren què passa amb entrades incorrectes.
- **Evidència mínima**: taula de casos vàlids i invàlids, amb tractament de reintent i dada conservada o rebutjada.
