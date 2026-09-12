# R2S1. Entrada variada i validació de servidor

## Finalitat de la sessió 

Esta sessió obri el `Repte 2` i treballa el microrepte `R2M1` amb una primera entrada real de dades del producte. L'objectiu no és practicar un camp solt ni fer tots els controls possibles, sinó entendre bé el recorregut mínim i segur d'un formulari: text, llista o opció tancada, checkbox, recepció defensiva en servidor, validació bàsica amb `if/else`, escapament de l'eixida, error visible i reenviament corregit.

Al final de la sessió, cada alumne o parella ha de poder explicar quines dades envia cada control mínim, com arriben al servidor, quines validacions s'apliquen i què passa quan alguna dada no és acceptable.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M1`
- **Sessió**: `R2S1`
- **Duració orientativa**: `3 hores`
- **Focus**: formulari mínim amb text, llista/opció i checkbox; recuperació de dades en `PHP`; validació bàsica de servidor; error visible i reenviament corregit
- **No entra encara**: login, rols, sessió persistent, base de dades com a centre del treball o arquitectura completa

## Frontera amb `R2S2`

`R2S1` ha de tancar una pregunta concreta:

> El servidor rep dades reals del projecte i pot bloquejar un cas incorrecte amb una validació visible?

No cal exigir encara que el formulari conserve tots els valors després de l'error ni que el cas correcte quede guardat funcionalment. Si apareix, pot quedar com a millora, però el criteri de tancament de `R2S1` és recepció, validació i reenviament corregit. La conservació de dades aprofitables i el guardat funcional són el centre de `R2S2`.

## De la landing al formulari

Abans de programar el formulari, cal fer explícita la connexió amb la landing page de `R1`: quin botó, crida a l'acció o promesa del producte obri el flux de `R2`?

La tria no és només estètica. El formulari de `R2S1` ha de deixar alguna dada que permeta prendre una decisió en `R2S3`. No cal implementar encara eixa decisió, però sí evitar formularis genèrics que després obliguen a inventar una regla artificial.

| Projecte | Acció que pot vindre de la landing | Dades mínimes recomanables | Possible decisió futura |
|---|---|---|---|
| Gestor d'incidències | Comunicar una incidència | títol, tipus o prioritat, confirmació | prioritat, estat inicial o assignació |
| Sistema de reserves | Sol·licitar una reserva | recurs, franja, acceptació | confirmable, pendent o rebutjada |
| Gestor d'inventari | Registrar recurs o moviment | nom, categoria, estat, quantitat o confirmació | disponible, revisar, moviment permés o alerta |
| Projecte propi validat | Primera acció real del producte | dada oberta, opció tancada i confirmació | classificar, acceptar, rebutjar, prioritzar o assignar |

Si un equip proposa un formulari de contacte, enquesta o dades del client, el professorat hauria de demanar quin efecte tindrà dins del producte. Si no hi ha resposta clara, cal reconduir-lo cap a una acció més pròpia del domini.

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA2` | codi servidor integrat amb resposta web, recepció de dades, variables simples i generació de resposta |
| `RA3` | formularis amb diferents tipus d'entrada, comprovació bàsica de dades i bifurcació entre cas vàlid i cas amb error |
| Evidència central | enviament incorrecte, un error visible, correcció i reenviament correcte |
| Verificació docent | execució en directe i pregunta sobre el recorregut de cada dada |

## Producte esperat

Un primer flux executable del producte amb un formulari o entrada equivalent que incloga, com a mínim:

- una acció concreta del domini;
- connexió amb una acció visible o esperable de la landing page;
- un camp de text o àrea de text;
- una llista desplegable o selecció equivalent;
- un checkbox simple amb sentit dins del flux;
- una dada tancada o classificada que puga alimentar una regla posterior;
- lectura defensiva de camps que poden no arribar;
- comprovació en servidor de les opcions contra un catàleg permés;
- una validació bàsica en servidor sobre una dada clau o sobre el conjunt mínim;
- escapament de qualsevol dada de l'usuari que es mostre en HTML;
- absència de bolcats de petició i de dades sensibles en la resposta, captures,
  URL o repositori;
- un missatge d'error clar quan el cas no és acceptable;
- un reenviament corregit que deixe continuar el flux;
- una nota breu al `README`, issue o registre de treball indicant com provar el cas correcte i els casos incorrectes.

Queden com a ampliació o modelatge docent:

- checkbox múltiple amb catàleg de valors permesos;
- acumulació d'errors en arrays o llistes, preferentment com a ampliació de `R2M3`;
- conservació còmoda dels valors introduïts en el formulari;
- fitxer opcional si el cas d'ús ho justifica, amb `enctype`, `$_FILES`, error de pujada, mida i tipus permés.

## Preparació prèvia del professorat

Abans de la sessió convé tindre preparat:

- un exemple mínim de formulari amb `method="post"` i controls diversos;
- una variant curta amb `enctype="multipart/form-data"` només per mostrar fitxers si el grup va ràpid, sense exigir-ho al mínim;
- un error controlat per a text buit o llista sense selecció;
- un valor de llista manipulat que el servidor rebutge;
- un text com `<script>alert(1)</script>` o equivalent que es mostre com a text
  inert i no s'execute ni s'interprete com a HTML;
- una pauta curta per ajudar l'alumnat a triar una acció real del seu producte;
- una pauta curta per comprovar que el formulari deixa una dada útil per a una decisió posterior;
- el criteri de tancament: no es passa a processament ni guardat si no hi ha validació visible en servidor.

Exemples d'accions assumibles:

- registrar una incidència amb títol, prioritat i acceptació de condicions;
- sol·licitar una reserva amb recurs, franja horària i acceptació de condicions;
- registrar un recurs d'inventari o moviment amb nom, categoria i confirmació;
- plantejar una acció equivalent d'un projecte propi validat, sempre vinculada al domini real.

## Controls mínims i ampliacions

| Control | Què ha de veure l'alumnat | Validació mínima de servidor |
|---|---|---|
| Text o textarea | arriba com a cadena i cal normalitzar-la | obligatori, longitud mínima o màxima |
| Select o radio | arriba com a valor triat d'un conjunt | el valor ha d'estar dins de la llista permesa |
| Checkbox simple | pot no aparéixer en la petició si no està marcat | mostrar què passa i, si és obligatori, comprovar presència |
| Checkbox múltiple | ampliació posterior: arriba com a array si el `name` està ben definit | almenys una opció i opcions dins del catàleg permés |
| Fitxer | ampliació/modelatge: arriba per `$_FILES` i pot fallar abans de validar contingut | error de pujada, mida, extensió o MIME permés |

Cal distingir dos controls complementaris: la validació decidix si una entrada
és acceptable per al domini; l'escapament s'aplica en el moment de mostrar-la
perquè no s'interprete com a HTML. Cap valor enviat pel navegador és fiable pel
fet de provindre d'un `select`, un camp ocult o un control amb `required`.

La protecció CSRF serà obligatòria quan el flux canvie estat o depenga d'una
sessió autenticada. No forma part del mínim de `R2M1`, que encara no exigix
guardat funcional, però convé deixar explícit el motiu per no convertir esta
excepció temporal en un hàbit insegur.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:45. Entrada al repte i acotació del formulari

El professorat recorda que `R2` no comença per autenticació. Primer cal una entrada real que arribe al backend amb dades de formats diferents.

Tasques:

- recuperar el punt d'entrada creat en `R1`;
- identificar quin botó, enllaç o promesa de la landing obri el flux;
- triar una acció concreta del producte;
- decidir els controls mínims: text, llista o opció tancada i checkbox;
- assenyalar quina dada podria servir per a una decisió posterior en `R2S3`;
- escriure quina dada aporta cada control al flux.

Resultat del tram: cada equip té una acció vinculada a la landing, un conjunt mínim de controls i una dada candidata per a una regla futura.

### 0:45-1:10. Modelatge docent

El professorat mostra un flux mínim:

- formulari amb text, select i checkbox;
- recepció amb `$_POST`;
- diferència entre dada absent i cadena buida;
- manipulació d'una opció tancada i validació contra una llista permesa;
- una validació amb `if/else` i una variable d'error simple;
- escapament d'eixida amb `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`;
- resposta d'error o resposta correcta.

Si el grup està preparat o el docent vol deixar-ho vist com a ampliació, el modelatge inclou una pujada de fitxer:

- `enctype="multipart/form-data"`;
- lectura de `$_FILES`;
- comprovació d'error, mida i tipus permés;
- explicació de per què no es confia en el nom del fitxer.

Resultat del tram: l'alumnat veu que cada control genera una forma diferent de dada i que la validació s'ha de fer en servidor.

### 1:10-1:45. Implementació guiada

L'alumnat implementa o adapta el seu formulari.

Tasques:

- crear o revisar el formulari;
- comprovar que el botó envia realment una petició;
- recuperar text, llista i checkbox en `PHP`;
- inspeccionar temporalment les dades rebudes només en desenvolupament i
  retirar el bolcat abans de l'entrega;
- afegir una validació bàsica en servidor amb una variable d'error simple;
- deixar checkbox múltiple o fitxer per a ampliació si el mínim encara no està tancat.

Resultat del tram: hi ha dades variades recuperades i validacions inicials executant-se.

### 1:45-2:10. Error visible i reenviament corregit

L'alumnat força un cas incorrecte i ajusta la resposta. Si el grup va bé, pot afegir un segon cas, però no cal construir encara una col·lecció d'errors.

Tasques:

- provar text buit o massa curt;
- provar llista sense selecció o valor no permés si està preparat;
- manipular una opció tancada i comprovar que el servidor la rebutja;
- introduir marques HTML en un text i comprovar que es mostren com a text inert;
- observar què passa amb el checkbox quan no està marcat;
- provar checkbox múltiple o fitxer només si s'han implementat com a ampliació;
- mostrar un missatge d'error concret;
- reenviar el formulari amb una dada corregida.

Resultat del tram: el flux diferencia almenys un cas incorrecte i un cas correcte, amb un error visible generat en servidor.

### 2:10-2:25. Revisió per parelles

Una altra persona prova el formulari.

Pauta de revisió:

- quins controls envia el formulari?
- què arriba com a cadena i què pot no arribar?
- quin error es veu si la dada triada és incorrecta?
- es pot corregir sense reiniciar el projecte?
- on està la condició que genera l'error?
- on es valida una opció manipulada i on s'escapa l'eixida?
- queda algun bolcat de la petició o alguna dada sensible visible?

Resultat del tram: cada equip rep una observació concreta i corregeix almenys una confusió o omissió.

### 2:25-2:40. Traçabilitat i documentació mínima

L'alumnat deixa rastre del que ha fet.

Tasques:

- actualitzar el `README`, issue o registre de treball;
- escriure com provar el cas correcte;
- escriure com provocar almenys un error;
- registrar una dificultat trobada i com s'ha resolt o què queda pendent.

Resultat del tram: el flux és reproduïble per una altra persona.

### 2:40-2:50. Checkpoint docent

El professorat fa una comprovació curta.

Cada equip mostra:

- enviament incorrecte amb error visible;
- reenviament corregit;
- fragment de codi on es recupera text, llista i checkbox;
- fragment de codi on es genera l'error amb una condició simple;
- fragment on es valida una opció tancada i s'escapa una dada abans de mostrar-la;
- fragment de codi de fitxer només si s'ha treballat com a ampliació.

Pregunta de tancament: què passa exactament quan falta la dada que has decidit validar?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar una acció real del seu producte.
- Connectar-la amb la landing page i amb una decisió futura possible.
- Crear o adaptar un formulari amb controls diversos.
- Recuperar dades de text, llista i checkbox en `PHP`.
- Tractar els camps absents, validar opcions manipulades i escapar les dades
  abans de mostrar-les en HTML.
- Validar en servidor almenys una dada clau amb una condició simple.
- Mostrar un error útil i comprensible.
- Provar un cas incorrecte i un cas correcte.
- Documentar com repetir les proves.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Formulari o entrada | envia una petició real amb controls diversos i naix d'una acció del producte |
| Connexió amb landing | es pot explicar quin botó, enllaç o promesa obri el flux |
| Dada per a decisió | hi ha una opció, categoria, prioritat, franja, estat o dada semblant que podrà alimentar R2S3 |
| Recuperació de dades | el codi mostra on es llig text, select/radio i checkbox |
| Seguretat de l'entrada i l'eixida | els camps absents es controlen, les opcions es validen contra valors permesos i les dades mostrades s'escapen |
| Validació | una dada clau té una regla simple en servidor |
| Error visible | el cas incorrecte queda bloquejat amb missatge concret |
| Reenviament | la persona pot corregir i enviar de nou |
| Ampliació | checkbox múltiple o fitxer només si el mínim ja està aconseguit |
| Documentació | el repositori explica com provar el cas correcte i un error |

## Criteris d'èxit

El microrepte està aconseguit si:

- el formulari no és decoratiu;
- el formulari no és genèric ni desconnectat de la landing;
- hi ha més d'un tipus de control treballat;
- la validació no depén només del navegador;
- una opció manipulada queda rebutjada pel servidor;
- el text aportat per l'usuari es mostra escapat i no s'interpreta com a HTML;
- no queden bolcats de la petició ni dades sensibles exposades;
- hi ha almenys una condició de servidor que bloqueja un cas incorrecte;
- l'alumnat veu que el checkbox pot no arribar si no està marcat;
- el cas incorrecte no continua com si fora correcte;
- l'error ajuda a corregir;
- el cas correcte és reproduïble;
- l'alumne pot assenyalar el recorregut de cada dada en el codi.

## Què no és suficient

- Tindre només `HTML` sense tractament en servidor.
- Fer un formulari amb un únic camp de text.
- Usar només `required` o validació de client.
- Confiar en opcions tancades o camps ocults sense comprovar-los en servidor.
- Mostrar directament dades de `$_POST` sense escapar-les.
- Deixar `var_dump`, `print_r` o depuració equivalent accessible en l'entrega.
- Incloure contrasenyes, tokens o dades sensibles en URL, captures o repositori.
- Fer una validació tan complexa que l'alumnat no puga explicar-la.
- Començar per arrays d'errors abans d'entendre una condició simple.
- Afegir fitxers abans de tindre validats text, llista i checkbox.
- Mostrar un missatge d'error sense condició real.
- Fer login o registre d'usuaris sense haver validat abans dades del domini.
- Copiar codi generat per IA sense poder modificar una regla de validació.
- Escriure al `README` que funciona sense indicar com provar-ho.

## Ús de la IA

La IA es pot usar per:

- proposar una estructura inicial de formulari amb controls diversos;
- revisar missatges de validació;
- suggerir casos d'error;
- explicar diferències entre dada present, dada buida i dada absent;
- ajudar a redactar la nota de reproducció.

Control obligatori:

- l'alumnat ha de poder canviar una regla de validació en directe;
- ha d'explicar què ha acceptat, descartat o modificat de la resposta de la IA;
- ha de provar un cas manipulat o no previst, no només el cas feliç;
- si la IA ha generat una part rellevant del codi, s'ha de registrar breument al `AI log` o registre equivalent.

## Suport per alumnat amb més dificultat

Reduir el flux a:

- un text obligatori;
- un select amb tres valors permesos;
- un checkbox que es mostra i s'observa si està marcat o no;
- una sola regla clara sobre el text o el select;
- una pàgina de resposta;
- una prova correcta i una incorrecta.

Frase guia: "No afegis més pantalles fins que pugues ensenyar una dada incorrecta bloquejada per una condició que entens."

## Ampliació per alumnat avançat

Si el mínim ja està tancat, l'alumnat pot:

- afegir checkbox múltiple amb catàleg permés;
- acumular errors en un array i mostrar-los tots;
- conservar els valors escrits i seleccionats perquè el reintent siga més còmode;
- afegir validació de fitxer amb mida i MIME;
- separar funcions simples de validació;
- afegir proves manuals més precises al `README`;
- preparar quines dades convé conservar en el formulari quan hi haja error en `R2M2`.

L'ampliació no ha d'obrir encara autenticació, rols ni arquitectura completa.

## Checklist de tancament

- [ ] He triat una acció real del meu producte.
- [ ] El formulari envia dades al servidor.
- [ ] He usat almenys text, llista i checkbox.
- [ ] Puc assenyalar on recupere cada dada en `PHP`.
- [ ] Controle els camps absents i valide en servidor els valors tancats.
- [ ] Escape qualsevol dada de l'usuari abans de mostrar-la en HTML.
- [ ] He retirat els bolcats de la petició i no expose dades sensibles.
- [ ] He provat una opció manipulada i text amb marques HTML.
- [ ] Valide almenys una dada clau en servidor amb una condició simple.
- [ ] He provat almenys un cas incorrecte.
- [ ] L'error indica què cal corregir.
- [ ] He provat el reenviament amb dades correctes.
- [ ] Si hi ha fitxer, valide error, mida i tipus.
- [ ] El `README`, issue o registre explica com repetir les proves.
- [ ] Si he usat IA, he registrat què m'ha aportat i què he verificat.

## Connexió amb R2M2

`R2M2` només té sentit si `R2M1` deixa almenys una dada correcta i validada de manera bàsica. La pregunta de pas és:

Quines dades del teu formulari convé tornar a mostrar perquè l'usuari no haja de repetir-ho tot quan hi haja un error?

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT03. Validació de servidor amb casos roïns](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT03-Validacio-de-servidor-amb-casos-roins.pdf)
- **Teoria o material associat**: [Formularis, petició POST i validació de servidor](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-Formularis-peticio-POST-i-validacio-de-servidor.pdf)

## Microtaller associat

- **Microtaller**: `MT03. Validació de servidor amb casos roïns`
- **Moment recomanat**: quan ja hi ha una primera entrada de dades i abans de donar-la per correcta.
- **Evidència mínima**: taula de casos vàlids i invàlids, amb almenys una prova reproduïble.
