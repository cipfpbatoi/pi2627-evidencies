# R2S3. Logica del flux i regles del projecte

## Finalitat de la sessio

Esta sessio transforma el flux construït en `R2M1` i `R2M2` en una funcionalitat amb decisio real. Fins ara el servidor rebia dades, validava, reconstruia el formulari i guardava funcionalment el cas correcte. Ara ha d'aplicar una regla recognoscible del projecte i produir resultats diferents segons les dades rebudes o ja guardades.

L'objectiu no és afegir condicions, arrays o funcions perquè sí. El criteri és que la logica tinga efecte visible dins del producte: una decisio, classificacio, calcul, estat funcional o missatge diferent que l'alumnat puga explicar i provar amb dos casos.

Per evitar que el microrepte quede massa ambigu, `R2M3` demana una forma concreta de treball: crear una **llibreria pròpia mínima** del projecte, per exemple `src/regles.php`, `includes/regles.php`, `lib/funcions.php` o equivalent, carregar-la amb `require_once` o `include_once`, i posar allí almenys una funcio pròpia que aplique una regla del domini. No és encara arquitectura completa, però sí una primera separacio clara entre la pàgina que rep la peticio i el codi que decideix.

Al final de la sessio, cada alumne o parella ha de poder dir quina regla aplica el backend, quines dades utilitza, on està implementada i com es veu que el resultat canvia.

## Punt de partida real

`R2S3` no hauria de començar inventant un formulari nou. La decisio ha de nàixer del flux que ja es va orientar en `R2S1` i es va millorar en `R2S2`: una acció vinculada a la landing page i una dada classificada o guardada que ara permet decidir.

Si un equip arriba amb un formulari massa genèric, el primer pas de la sessio és reconduir-lo: identificar l'acció real del producte, ajustar el formulari mínim si cal i només després escriure la regla. Sense eixe pont, la regla quedarà com un exercici d'`if`, arrays o funcions desconnectat del producte.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M3`
- **Sessio**: `R2S3`
- **Duracio orientativa**: `3 hores`
- **Focus**: decisio significativa, array o estructura equivalent, funcio pròpia en fitxer separat, import amb `require_once` o equivalent, regla de domini i dos casos amb resultat diferent
- **No entra encara**: sessio, cookies, login, rols, autoritzacio, arquitectura MVC, persistencia formal com a centre del treball o refactoritzacio general

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA3.a` | ús de condicions i bifurcacions per decidir el comportament del servidor |
| `RA3.b` | ús de recorreguts o repeticions quan el flux treballe amb llistes, etiquetes, opcions o elements guardats |
| `RA3.c` | ús d'arrays o estructures equivalents per representar catalegs, regles o dades del flux |
| `RA3.d` | ús de funcions amb entrada, eixida i responsabilitat recognoscible |
| Organitzacio mínima | primera llibreria pròpia importada amb `require_once`, `include_once` o equivalent |
| Evidencia central | regla del projecte implementada en una funcio pròpia separada, amb dos resultats observables |
| Verificacio docent | execucio de dos casos, microcanvi sobre una condicio o funcio i explicacio del seu sentit funcional |

## Producte esperat

Una evolucio del flux de `R2M2` que incloga, com a minim:

- una regla escrita en llenguatge natural abans o junt amb el codi;
- continuïtat amb l'acció triada des de la landing i treballada en `R2M1`;
- una decisio significativa connectada a dades reals del formulari o del guardat funcional;
- almenys dos casos de prova amb resultat diferent;
- un array o estructura equivalent usada amb sentit, per exemple cataleg de valors permesos, llista d'elements, etiquetes, regles, prioritats o missatges;
- una funcio útil amb nom clar, parametres comprensibles i valor retornat o efecte explicable;
- un fitxer separat de funcions o regles pròpies del projecte carregat des del flux amb `require_once`, `include_once` o equivalent;
- resposta visible del sistema que canvie segons la regla;
- nota breu al `README`, issue o registre indicant la regla, els dos casos provats i on es veu el resultat.

La regla pot ser molt xicoteta, però ha de modificar el comportament del flux. És millor una regla curta, executada i defensable que una logica gran copiada i difícil d'explicar.

## Preparacio previa del professorat

Abans de la sessio convé tindre preparat:

- dos exemples de regles simples aplicables a dominis diferents;
- una mostra curta de conversio de regla natural a funcio o condicio;
- una mostra de fitxer `regles.php` o `funcions.php` importat amb `require_once`;
- un exemple d'array de valors permesos o cataleg;
- un exemple de dos casos de prova amb resultats diferents;
- una pauta per reduir regles massa grans a una decisio verificable;
- el criteri de tancament: no es valida el microrepte si la logica no afecta cap resposta visible.

Exemples de regles assumibles:

- en una tenda, `calcularEstatProducte($categoria, $confirmat)` retorna `visible`, `pendent` o `revisar`;
- en reserves, `calcularEstatReserva($placesDisponibles, $placesDemanades)` retorna `acceptada` o `pendent`;
- en incidencies, `calcularPrioritat($urgencia, $impacte)` retorna `baixa`, `mitjana` o `alta`;
- en publicacions, `calcularEstatPublicacio($teTitol, $teCos, $confirmada)` retorna `esborrany` o `publicada`;
- en activitats, `generarMissatgeActivitat($tipus, $edat, $places)` retorna un missatge diferent segons la regla.

### Forma mínima recomanada

La forma mínima recomanada és:

```text
public/
  formulari.php
src/
  regles.php
```

En `src/regles.php` o equivalent:

- un array de cataleg o valors permesos;
- una funcio pròpia amb nom de domini;
- una decisio que retorne un resultat.

En la pàgina del flux:

- `require_once __DIR__ . '/../src/regles.php';` o equivalent;
- crida a la funcio amb dades reals;
- mostra del resultat en la resposta.

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Recuperacio del flux i tria de la regla

El professorat demana executar el cas correcte de `R2M2` i observar quines dades ja arriben i quines es guarden funcionalment.

Tasques:

- comprovar que el flux no ha canviat d'acció respecte de la landing i `R2S1`;
- identificar una dada del formulari que puga condicionar el comportament;
- identificar una dada guardada o reutilitzada que puga participar en la decisio;
- escriure una regla en una frase clara;
- acotar la regla a dos resultats comprovables.

Resultat del tram: cada equip té una regla mínima i dos casos previstos.

### 0:50-1:10. Modelatge docent

El professorat mostra un exemple curt:

- regla en llenguatge natural;
- fitxer separat importat amb `require_once`;
- array de valors o cataleg;
- funcio amb nom clar;
- condicio que retorna o prepara un resultat;
- dos enviaments amb resultats diferents;
- canvi menut en una condicio per observar l'efecte.

Resultat del tram: l'alumnat veu que arrays, funcions i condicions no són decoracio, sinó peces que fan explícita una regla del producte.

### 1:10-1:45. Implementacio de la regla

L'alumnat implementa la regla sobre el seu flux.

Tasques:

- connectar la regla amb dades reals de `$_POST`, del mecanisme equivalent o del guardat funcional;
- crear o adaptar un array de valors, opcions, regles o elements;
- crear un fitxer separat per a regles o funcions pròpies del projecte;
- importar-lo amb `require_once`, `include_once` o equivalent;
- implementar una funcio útil dins d'eixe fitxer;
- usar una condicio o recorregut que genere el resultat;
- mostrar el resultat en la resposta del servidor.

Resultat del tram: hi ha codi executable que pren una decisio i mostra una resposta diferenciada.

### 1:45-2:10. Dos casos de prova

L'alumnat prova la regla.

Tasques:

- executar un cas que active el primer resultat;
- executar un cas que active el segon resultat;
- comprovar que el resultat no ix d'un literal fix sense relacio amb les dades;
- revisar que el cas incorrecte de validacio continua bloquejant el flux si toca;
- ajustar missatges perquè el canvi siga visible.

Resultat del tram: la regla queda demostrada amb dos casos reproduïbles.

### 2:10-2:25. Revisio de qualitat minima

El professorat o una parella revisa la logica.

Pauta de revisio:

- la funcio té un nom que explica la seua responsabilitat?
- la funcio està en un fitxer separat de llibreria pròpia i s'importa des del flux?
- els parametres són dades del flux i no valors inventats?
- l'array representa un cataleg, llista o regla útil?
- la decisio canvia una resposta visible?
- hi ha duplicacio o confusio que convé reservar per a `R2M7`?

Resultat del tram: cada equip fa almenys un ajust de claredat o deixa anotada una millora futura.

### 2:25-2:45. Traçabilitat i documentacio minima

L'alumnat deixa rastre del que ha fet.

Tasques:

- actualitzar el `README`, issue o registre de treball;
- escriure la regla en una frase;
- indicar els dos casos provats i els resultats esperats;
- indicar quin array o estructura s'ha usat;
- indicar quin fitxer de llibreria pròpia s'ha creat o reutilitzat;
- indicar quina funcio concentra la regla o part de la logica;
- registrar ús d'IA si ha generat o transformat codi rellevant.

Resultat del tram: la regla es pot revisar sense dependre d'una explicacio improvisada.

### 2:45-2:50. Checkpoint docent

Cada equip mostra:

- la regla escrita;
- els dos casos amb resultats diferents;
- fragment de codi amb l'array o estructura equivalent;
- fragment de codi on s'importa la llibreria pròpia;
- fragment de codi amb la funcio;
- punt de la resposta on es veu l'efecte.

Pregunta de tancament: quina decisio pren ara el servidor que abans no prenia, i com ho demostres amb dos casos?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Recuperar el flux funcional de `R2M2`.
- Triar una regla xicoteta però significativa del projecte.
- Escriure la regla en llenguatge natural.
- Implementar una decisio connectada a dades reals.
- Usar un array o estructura equivalent amb sentit.
- Crear una llibreria pròpia mínima en un fitxer separat.
- Importar-la amb `require_once`, `include_once` o equivalent.
- Crear una funcio útil per expressar o reutilitzar part de la logica.
- Provar dos casos amb resultat diferent.
- Documentar la regla, els casos i el codi principal.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Regla del projecte | està escrita en una frase clara i connectada al domini |
| Continuïtat del flux | la regla ix de l'acció treballada en `R2S1` i `R2S2`, no d'un formulari nou |
| Dades reals | la decisio usa dades del formulari, del flux o del guardat funcional |
| Array o estructura | representa opcions, cataleg, llista, regles o elements del producte |
| Llibreria pròpia | hi ha un fitxer separat de regles o funcions importat pel flux |
| Funcio | està en la llibreria pròpia, té nom clar i encapsula una comprovacio, calcul, classificacio o preparacio útil |
| Dos casos | hi ha dos enviaments o situacions amb resultats diferents |
| Resultat visible | la resposta del servidor mostra la decisio presa |
| Documentacio | el repositori explica la regla i com repetir els dos casos |

## Criteris d'exit

El microrepte està aconseguit si:

- la logica no és ornamental;
- la regla té sentit dins del producte;
- el resultat canvia segons dades reals;
- l'array o estructura ajuda a representar una part del domini;
- la funcio està separada del fitxer que rep la peticio o renderitza la resposta;
- la funcio no és només un embolcall buit;
- l'import de la llibreria pròpia és necessari i s'usa realment;
- hi ha dos casos de prova reproduïbles;
- el codi continua respectant la validacio bàsica anterior;
- l'alumnat pot modificar una condicio o valor del cataleg i explicar l'efecte.

## Que no és suficient

- Afegir un `if` que sempre dona el mateix resultat.
- Crear una funcio que només crida una altra línia sense aportar claredat.
- Posar la funcio en el mateix fitxer del formulari sense cap separacio quan no hi ha cap justificacio.
- Fer `include` o `require` d'un fitxer que després no s'usa.
- Usar un array sense llegir-lo, recórrer-lo o consultar-lo.
- Fer que el resultat depenga de literals fixos i no de dades del flux.
- Escriure una regla al `README` que no està implementada.
- Afegir sessio, login o rols per evitar resoldre la logica del flux.
- Copiar una solucio gran amb classes o patrons que l'alumnat no pot explicar.
- Trencar el reintent o el guardat funcional de `R2M2`.

## Us de la IA

La IA es pot usar per:

- proposar exemples de regles segons el domini;
- ajudar a convertir una regla natural en condicio o funcio;
- revisar noms de funcions;
- revisar si la separacio en fitxer de llibreria és comprensible;
- suggerir casos de prova;
- detectar si una condicio no cobreix els dos camins.

Control obligatori:

- l'alumnat ha d'explicar la regla sense llegir codi generat;
- ha de crear almenys un cas de prova propi;
- ha de poder canviar una condicio, valor de l'array o retorn de la funcio i predir l'efecte;
- ha de poder explicar per què la funcio està en un fitxer separat i on s'importa;
- si la IA ha generat codi rellevant, s'ha de registrar breument al `AI log` o registre equivalent.

## Suport per alumnat amb més dificultat

Reduir el flux a:

- una regla amb dos resultats;
- un array de tres valors permesos;
- un fitxer `regles.php` o equivalent;
- una funcio que rep una dada i retorna una etiqueta o missatge;
- un `require_once` des del fitxer principal;
- una resposta visible amb el resultat;
- dos casos manuals documentats.

Frase guia: "No afegis més pantalles; fes que el servidor decidisca una cosa clara amb les dades que ja tens."

## Ampliacio per alumnat avançat

Si el minim ja està tancat, l'alumnat pot:

- afegir més casos de decisio sense perdre claredat;
- usar recorreguts sobre una llista guardada funcionalment;
- separar diverses funcions petites amb responsabilitats diferents;
- organitzar una llibreria pròpia amb més d'una funcio relacionada;
- acumular errors, missatges o avisos en un array i mostrar-los en el reintent del formulari;
- documentar una taula de casos amb entrada, resultat esperat i resultat real;
- preparar quina dada temporal caldrà mantindre entre peticions en `R2M4`.

### Ampliacio guiada: errors acumulats en array

Quan la regla de `R2M3` ja funciona amb dos casos visibles, es pot recuperar el formulari de `R2M1/R2M2` i millorar la validacio acumulant errors en un array. Esta ampliacio és coherent amb `R2M3` perquè obliga a usar decisions, arrays i, si aporta claredat, funcions pròpies.

Com a mínim, si es fa esta ampliacio:

- crear un array d'errors, per exemple `$errors = []`;
- afegir un missatge per cada comprovacio fallida;
- mostrar tots els errors generats pel servidor;
- conservar les dades aprofitables del formulari per al reintent;
- executar el processament o guardat funcional només quan no hi haja errors;
- documentar dos casos: un amb un error i un amb més d'un error acumulat.

No cal convertir esta ampliacio en una validacio completa de framework ni revisar camps que no afecten el flux. El valor està en veure com una estructura de dades ajuda a retornar diversos errors interpretables sense perdre la simplicitat del microrepte.

L'ampliacio no ha d'obrir encara autenticacio, autoritzacio ni refactoritzacio arquitectonica.

## Checklist de tancament

- [ ] He recuperat el flux funcional de `R2M2`.
- [ ] He escrit una regla del projecte en una frase clara.
- [ ] La regla usa dades reals del flux.
- [ ] He implementat una decisio amb efecte visible.
- [ ] He usat un array o estructura equivalent amb sentit.
- [ ] He creat un fitxer separat de regles o funcions pròpies.
- [ ] He importat eixe fitxer amb `require_once`, `include_once` o equivalent.
- [ ] He creat una funcio útil amb nom clar dins de la llibreria pròpia.
- [ ] He provat dos casos amb resultats diferents.
- [ ] Puc assenyalar en el codi on es pren la decisio.
- [ ] El reintent i el guardat funcional anterior continuen funcionant.
- [ ] El `README`, issue o registre explica la regla i els casos.
- [ ] Si he usat IA, he registrat què m'ha aportat i què he verificat.

## Connexio amb R2M4

`R2M4` només té sentit si `R2M3` deixa una decisio o resultat que puga formar part d'un flux continuat. La pregunta de pas és:

Quina informació temporal del teu flux o de la regla aplicada necessita recordar el sistema en la peticio següent?
