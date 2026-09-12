# R2. Programació d'aula — Processament, estat i autenticació

## Finalitat del document

Este document baixa `R2` a una seqüència operativa d'aula perquè el professorat puga conduir el repte com una progressió completa de dades, lògica, estat i autenticació, sense reduir-lo a “formulari + login”.

## Finalitat del repte

- consolidar una base comuna en `PHP` per a tot l'alumnat
- construir una primera funcionalitat real del producte a partir d'un flux complet de servidor
- fer visible la relació entre formulari, processament, lògica, estat, autenticació i funcionalitat protegida
- obrir una mini API d'autenticació perquè DWEC puga consumir el backend abans de `R4`
- introduir persistència mínima amb BBDD com a pont cap a `R3`, sense convertir-la encara en arquitectura completa
- preparar un pas net cap a `R3`, que serà el punt d'entrada dels itineraris diferenciats

## Duració base

- `33 hores` obligatòries de nucli i tancament
- `9` sessions de `3` hores, una per cada microprojecte docent concret
- `1` sessió inicial de transició sense microrepte propi
- `1` sessió de microdefensa conjunta `R1 + R2`
- `1` sessió d'ampliació intermodular associada a `R2M6`, sense microrepte propi

`R2` queda fixat amb una transició inicial, `9` sessions de nucli amb microrepte i la microdefensa `R2SX`. A més, pot activar-se `R2S10` com a sessió d'ampliació intermodular: no crea un microrepte nou, però ajuda a estabilitzar el contracte d'autenticació per a `DWEC` a partir de `R2M6`. La sessió `6` obri una mini API d'autenticació per a client, la sessió `8` està dedicada a convertir una part del flux ja verificat en una primera peça testable amb POO, Composer i una prova unitària inicial, la sessió `9` introdueix BBDD mínima en PHP i `R2SX` verifica conjuntament la base de `R1` i el flux funcional de `R2`.

## Coordinació explícita entre sessions i microprojectes

| Sessió | Duració | Microprojecte | Focus principal | Evidència clau |
|---|---:|---|---|---|
| `1` | `3h` | `R2M1` | entrada variada i validació de servidor | formulari nascut de la landing, dades recuperades de controls diversos, errors clars i reintent |
| `2` | `3h` | `R2M2` | processament, reintent i guardat funcional | formulari amb error que conserva dades i cas correcte guardat funcionalment |
| `3` | `3h` | `R2M3` | lògica del flux i regles del projecte | decisió sobre dades preparades en R2S1/R2S2, estructura o funció amb efecte visible |
| `4` | `3h` | `R2M4` | estat, sessió i/o cookies | recuperació del flux i invalidació controlada |
| `5` | `3h` | `R2M5` | autenticació i funcionalitat protegida | cas autoritzat i cas denegat d'una operació real |
| `6` | `3h` | `R2M6` | mini API d'autenticació per a client | `POST /api/login`, ruta protegida, `JSON`, `200` i `401` |
| `10` | `3h` | Ampliació associada a `R2M6` | contracte d'autenticació per a `DWEC` | `docs/api-auth-contract.md`, usuari demo i prova creuada |
| `7` | `3h` | `R2M7` | prova, depuració, documentació mínima i checkpoint tècnic | checklist, README i demo reproduïble |
| `8` | `3h` | `R2M8` | primera peça testable amb POO i Composer | classe mínima, autoload de Composer i prova unitària inicial |
| `9` | `3h` | `R2M9` | persistència mínima amb BBDD en PHP | connexió, taula, alta, lectura i consulta preparada |
| `SX` | `3h` | Microdefensa conjunta `R1 + R2` | autoria, comprensió, ús d'IA i pas cap a `R3` | demo del repositori, landing de `R1`, flux de `R2`, proves i preguntes de contrast |

## Correspondència curta sessió -> RA -> evidència -> verificació

Esta taula és el mapa mínim de traçabilitat docent del repte. No substituïx la rúbrica ni les checklists, però ajuda a comprovar ràpidament que cada sessió deixa una evidència observable i una forma concreta de verificar aprenentatge real.

| Sessió | RA avaluat | CA avaluats | RA de context | Què s'aprén | Evidència mínima | Verificació docent |
|---|---|---|---|---|---|---|
| `1` | `RA2` | `RA2.a`, `RA2.b`, `RA2.c`, `RA2.d` | `RA3.e`, `RA3.f`, `RA3.g` | entrada de dades variades, recuperació en servidor i validació visible | formulari connectat amb la landing, amb text, llista, checkbox i una dada candidata per a decisió posterior | execució en directe i pregunta sobre d'on ix cada dada, com arriba al servidor, com es valida i quin paper podria tindre després |
| `2` | `RA2` | `RA2.a`, `RA2.b`, `RA2.c`, `RA2.d`, `RA2.e`, `RA2.f`, `RA2.g`, `RA2.h` | `RA3.e`, `RA3.f`, `RA3.g` | generació de resposta, variables, operadors, àmbits, reintent amb dades conservades i guardat funcional simple | formulari regenerat amb dades aprofitables després d'un error, reenviament corregit i cas correcte guardat | canvi menut en viu sobre un valor conservat o guardat i explicació d'on es rep, es tracta i es torna a usar |
| `3` | `RA3` | `RA3.a`, `RA3.b`, `RA3.c`, `RA3.d` | - | decisions, arrays, funcions i regles de domini aplicades | regla amb dos resultats observables sobre dades del flux i funció o estructura útil | microcanvi en una condició o funció i explicació de per què no és ornamental |
| `4` | `RA4` | `RA4.a`, `RA4.b`, `RA4.c` | - | estat temporal, sessió, cookies i invalidació | recuperació d'estat i neteja o caducitat demostrada | execució de recuperació i invalidació, més pregunta sobre què queda en client, servidor o flux funcional |
| `5` | `RA4` | `RA4.d`, `RA4.e` | - | identificació, autenticació, autorització i protecció d'una operació real | cas autenticat permés i cas no permés sobre una acció del domini | demo dels dos casos i pregunta sobre el punt exacte on es comprova la restricció |
| `6` | `RA4` | `RA4.d`, `RA4.e` | pont DWEC | mini API d'autenticació consumible des de client | login API, ruta protegida, `JSON`, `200`, `401` i prova externa | execució de `POST /api/login`, `GET /api/me` i cas `401` |
| `10` | - | - | ampliació intermodular | contracte d'autenticació consumible per `DWEC` | `docs/api-auth-contract.md`, dades demo, headers i prova creuada | una altra persona pot consumir la mini API sense mirar el codi |
| `7` | `RA4` | `RA4.f` | - | prova, depuració, documentació i reproduïbilitat | taula mínima de proves, incidències i README actualitzat | execució d'un cas triat pel professorat i contrast amb documentació, codi i AI log |
| `8` | `RA3` | `RA3.d`, `RA3.g` | `RA4.f` | POO mínima, Composer, autoload i primera prova unitària | classe simple del domini o servei, `composer.json`, test unitari i prova de no regressió | execució del test, revisió de la classe i defensa de què queda ara més testable |
| `9` | `RA6` | `RA6.a`, `RA6.b`, `RA6.c`, `RA6.d`, `RA6.f` | `RA3`, `RA4` | persistència mínima amb BBDD en PHP | connexió, taula, alta, lectura, consulta preparada i README de reproducció | demo d'inserció, consulta posterior i revisió de configuració sense secrets |

## Conceptes que han de quedar diferenciats

Durant el repte convé usar estos termes amb precisió, especialment en les sessions `4`, `5` i `6`:

- **Identificació**: l'usuari declara qui diu que és, per exemple amb un correu, nom d'usuari o identificador.
- **Autenticació**: el sistema comprova que eixa identitat és vàlida, per exemple amb credencials, i crea o reconeix una sessió autenticada.
- **Autorització**: el sistema decideix si un usuari ja autenticat pot executar una operació concreta segons rol, permís, propietat del recurs o regla de negoci.
- **Estat**: informació temporal o contextual que permet continuar un flux entre peticions.
- **Sessió**: mecanisme habitual per mantindre estat associat a un client des del servidor.

No es considera suficient dir que una operació està “protegida” si només hi ha login. Cal veure quina identitat s'ha declarat, com s'ha autenticat, quin estat o sessió queda activa i quina comprovació d'autorització o restricció funcional bloqueja o permet l'operació.

## Paper operatiu de la IA per fases

La IA pot aparéixer en totes les sessions, però el seu ús només compta com a suport vàlid si queda contrastat amb execució, proves i defensa posterior:

| Sessió | Ús raonable de la IA | Evidència de control |
|---|---|---|
| `1` | esborrany de formulari amb controls diversos, missatges de validació o estructura inicial | l'alumnat explica el recorregut de text, llista, checkbox i fitxer si n'hi ha, i ajusta almenys una validació pròpia |
| `2` | exemples de processament, guardat simple o tractament de fitxer | prova real de reutilització de la dada i justificació del mecanisme triat |
| `3` | suggeriments de funcions, arrays o casos de decisió | defensa de la regla de domini i microcanvi en viu |
| `4` | interpretació d'errors de sessió, cookies o estat | demostració de què es guarda, on es guarda i quan s'invalida |
| `5` | esquelet de login, comprovació d'accés o missatges d'error | demo de cas permés i cas bloquejat, amb explicació del punt de control |
| `6` | generació o ampliació de casos de prova i ajuda en debugging | execució dels casos i registre de què s'ha acceptat, descartat o corregit |
| `7` | suport per crear classe mínima, `composer.json` o test inicial | execució del test i justificació pròpia de la peça testable |

## Seqüència recomanada de sessions

### Sessió 1. Microprojecte 1

**Sessió 1 — Entrada variada i validació de servidor**

#### Finalitat específica de la sessió
Obrir el punt d'entrada de dades del producte i deixar clar què arriba al servidor des de cada tipus de control, què es valida i què no pot continuar mentre hi haja errors.

#### RA/focus tècnic
Focus en `RA2` i `RA3`: recepció de dades de formulari o entrada equivalent amb text, llistes, checkbox i fitxers quan tinga sentit, validació de servidor, resposta amb errors visibles i reintent corregit.

#### Producte o microresultat esperat
Formulari funcional o entrada equivalent del domini, nascut d'una acció esperable de la landing, amb controls diversos, validació de servidor per tipus de dada, missatges d'error útils i un reenviament correcte.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:20 — Obertura del flux de `R2`
- recordar la funcionalitat inicial prevista al final de `R1`
- concretar quina acció real del domini entrarà per formulari i des de quin punt de la landing naix
- identificar una dada tancada o classificada que podrà alimentar una decisió posterior
- aclarir que esta sessió encara no comença per autenticació

##### 0:20-0:45 — Modelatge docent
- mostrar un formulari mínim o entrada equivalent
- recuperar dades en servidor
- validar dades de controls diferents, com text, llista, checkbox o fitxer quan tinga sentit
- retornar un error comprensible sense perdre el sentit del flux

##### 0:45-1:35 — Implementació guiada
- l'alumnat crea o adapta el formulari
- connecta l'acció amb el servidor
- recupera dades de text, llistes i checkbox i comprova què arriba realment
- incorpora les primeres validacions per tipus de dada

##### 1:35-2:10 — Errors i reintent
- provar entrada buida, opció no permesa, checkbox absent o fitxer no vàlid si n'hi ha
- mostrar errors concrets associats al control afectat
- conservar o reconstruir la informació necessària per a corregir
- repetir l'enviament amb dades vàlides

##### 2:10-2:40 — Revisió per parelles
- un company executa el formulari d'un altre
- identifica dades vàlides i no vàlides de controls diferents
- comprova que l'error talla el flux

##### 2:40-3:00 — Checkpoint final
- revisió ràpida del professorat
- registre de l'evidència mínima
- anotació de què es processarà i guardarà en la sessió `2`

#### Intervenció docent prevista
- acotar l'acció del domini perquè siga realista en una sessió
- evitar formularis decoratius sense tractament de servidor
- demanar errors concrets, no missatges genèrics
- revisar que la validació es fa en servidor encara que hi haja validació visual en client

#### Tasques concretes de l'alumnat
- concretar l'acció del domini que s'enviarà al servidor
- relacionar-la amb la landing i amb una decisió futura possible
- crear o adaptar el formulari
- recuperar dades de text, llista i checkbox en `PHP`
- validar cada tipus de dada en servidor
- mostrar l'error i provar un reintent correcte
- deixar una nota breu en el `README` o en el registre de treball sobre el flux provat

#### Evidència verificable de la sessió
- formulari executable
- captura o demo curta d'un cas amb error
- captura o demo curta del mateix cas corregit
- codi on es veu la recuperació i validació de les dades de controls diferents

#### Checkpoint o pregunta de comprovació
Què passa exactament quan falta una dada, arriba una opció no permesa o un checkbox no està marcat quan és obligatori?

#### Ús de la IA permés i forma de control
Ús permés per aclarir patrons de validació, redactar missatges d'error o revisar si falten casos bàsics. Control: l'alumnat ha d'assenyalar en el seu codi on valida cada tipus de dada i ha de poder modificar una regla en directe sense dependre de la resposta generada.

#### Dificultats habituals i resposta docent prevista
- Si el formulari envia però no es comprova res, el professorat demana un cas incorrecte per a text, llista o checkbox abans de continuar.
- Si només hi ha validació en client, es modela el mateix cas desactivant o saltant el client i es força la validació en servidor.
- Si l'alumnat vol començar per login, es reconduïx cap al flux de dades del domini i es deixa auth per a la sessió `5`.

### Sessió 2. Microprojecte 2

**Sessió 2 — Processament, reintent i guardat funcional**

#### Finalitat específica de la sessió
Millorar el flux d'error del formulari i completar el cas correcte: si hi ha error, el servidor conserva dades aprofitables per al reintent; si l'entrada és correcta, la processa i la guarda funcionalment amb un mecanisme simple.

#### RA/focus tècnic
Focus en `RA2` i `RA3`: tractament de dades en servidor, variables, operadors, resposta generada, conservació funcional de valors dins del reintent i guardat simple de l'entrada correcta.

#### Producte o microresultat esperat
Formulari que, davant un error, torna a carregar dades aprofitables; i que, davant un cas correcte, processa i guarda funcionalment la informació.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:20 — Recuperació de la sessió anterior
- executar el formulari amb un cas incorrecte
- identificar quines dades arriben al servidor
- observar quines dades es perden quan apareix l'error

##### 0:20-0:45 — Modelatge de reintent
- preparar valors rebuts per tornar-los al formulari
- usar `value`, `selected` i `checked` o equivalents
- mostrar error sense buidar les dades aprofitables

##### 0:45-1:30 — Conservació de dades de formulari
- conservar un camp de text o textarea
- conservar una opció de select o radio
- revisar què passa amb un checkbox simple
- comprovar que el formulari torna carregat després de l'error

##### 1:30-2:10 — Correcció i reenviament
- corregir només la dada errònia
- reenviar el formulari
- comprovar que la resposta correcta es genera
- verificar que les dades conservades venien de l'enviament real
- guardar funcionalment el cas correcte amb un mecanisme simple

##### 2:10-2:40 — Revisió per parelles
- una altra persona força l'error
- comprova quins valors es conserven
- identifica on es tornen a pintar en el codi
- comprova on es guarda el cas correcte
- detecta valors fixos o dades no tractades

##### 2:40-3:00 — Checkpoint final
- comprovació d'un cas complet: enviar amb error, conservar dades, corregir, reenviar i guardar el cas correcte
- registre de com provar el reintent
- preparació de la regla de negoci de la sessió `3`

#### Intervenció docent prevista
- recordar que hi ha dues conservacions diferents: valors del reintent i guardat funcional del cas correcte
- orientar com tornar a pintar valors sense obrir arquitectura completa
- demanar que el formulari no torne buit després de l'error
- revisar que no s'usen valors fixos que no venen de l'enviament

#### Tasques concretes de l'alumnat
- executar un cas incorrecte de la sessió `1`
- preparar les dades rebudes per tornar-les al formulari
- conservar almenys text i opció tancada després de l'error
- revisar el comportament del checkbox simple
- corregir només la dada errònia i reenviar
- guardar funcionalment la informació correcta
- documentar com provar el reintent

#### Evidència verificable de la sessió
- codi de reintent executable
- error visible amb formulari recarregat
- dades aprofitables conservades
- reenviament corregit
- dada correcta guardada funcionalment
- nota breu de com provar el flux

#### Checkpoint o pregunta de comprovació
On es veu que la dada rebuda no només s'ha llegit, sinó que s'ha preparat i tornat a pintar en el formulari després de l'error?

#### Ús de la IA permés i forma de control
Ús permés per aclarir sintaxi de `PHP`, revisar com conservar `value`, `selected` o `checked`, proposar un guardat simple o millorar missatges d'error. Control: l'alumnat ha de mostrar una prova amb una dada nova i explicar la diferència entre conservar en el reintent i guardar funcionalment un cas correcte.

#### Dificultats habituals i resposta docent prevista
- Si el formulari torna buit, el professorat demana conservar primer text i select abans d'afegir més controls.
- Si es vol introduir una base de dades completa, es limita a un ús mínim justificat o es deixa la persistència formal per a més avant.
- Si el codi mescla massa entrada, procés i eixida, es deixa anotat com a material per a la refactorització de la sessió `7`.

### Sessió 3. Microprojecte 3

**Sessió 3 — Lògica del flux i regles del projecte**

#### Finalitat específica de la sessió
Fer que el backend aplique una regla recognoscible del domini i produïsca resultats diferents segons les dades i l'estat del flux.

#### RA/focus tècnic
Focus en `RA3`: condicions, recorreguts, arrays, funcions i regles de negoci simples aplicades al producte.

#### Producte o microresultat esperat
Una regla del domini implementada amb efecte visible i almenys dos casos de prova amb resultat diferent.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:25 — Selecció de la regla
- revisar el flux ja existent
- triar una regla xicoteta però significativa del producte
- formular la regla en llenguatge natural abans de programar-la

##### 0:25-0:50 — Modelatge docent
- convertir una regla en una condició o funció
- mostrar dos casos amb resultats diferents
- explicar per què una regla ha de canviar el comportament del sistema

##### 0:50-1:40 — Implementació de la regla
- l'alumnat implementa una decisió, recorregut o funció
- connecta la regla amb dades del flux
- evita dades fixes que només simulen funcionament

##### 1:40-2:15 — Casos de prova
- definir un cas que complix la regla
- definir un cas que no la complix
- executar els dos casos i observar la resposta

##### 2:15-2:40 — Revisió de qualitat mínima
- comprovar noms de variables i funcions
- detectar condicions duplicades o poc clares
- marcar possibles millores per a la sessió `7`

##### 2:40-3:00 — Checkpoint final
- demo curta de la regla
- registre dels dos casos provats
- anticipació de quina informació haurà de mantindre's entre peticions en la sessió `4`

#### Intervenció docent prevista
- ajudar a convertir regles massa grans en una regla executable en tres hores
- impedir lògica ornamental que no afecte el flux
- demanar casos diferents abans de donar per bona la sessió
- assenyalar una regla o comprovació candidata a convertir-se en classe testable en la sessió `8`

#### Tasques concretes de l'alumnat
- escriure la regla en una frase clara
- implementar-la amb condició, array, recorregut o funció
- connectar-la amb dades reals del flux
- provar dos casos amb resultat diferent
- registrar quin comportament ha canviat

#### Evidència verificable de la sessió
- regla implementada en codi
- dos casos de prova executables
- resposta diferenciada del sistema
- nota breu de què decidix el backend i per què

#### Checkpoint o pregunta de comprovació
Quina decisió pren ara el servidor que abans no prenia, i com es veu en dos casos diferents?

#### Ús de la IA permés i forma de control
Ús permés per ajudar a expressar la regla, revisar una condició o proposar casos de prova. Control: l'alumnat ha d'explicar la regla sense llegir codi generat i ha de crear almenys un cas de prova propi no suggerit literalment per la IA.

#### Dificultats habituals i resposta docent prevista
- Si la regla és massa ambiciosa, el professorat la reduïx a una decisió mínima verificable.
- Si el resultat és sempre el mateix, es demanen dos casos que forcen branques diferents.
- Si la funció només embolica codi sense aclarir-lo, es revisa el nom, l'entrada i l'eixida esperada.

### Sessió 4. Microprojecte 4

**Sessió 4 — Estat, sessió i cookies sense confondre-ho amb persistència**

#### Finalitat específica de la sessió
Mantindre informació temporal entre peticions per donar continuïtat al flux i distingir clarament estat, sessió i cookies de la persistència del domini.

#### RA/focus tècnic
Focus en `RA2`, `RA3` i `RA4`: gestió d'estat temporal, `$_SESSION`, cookies, invalidació i lectura del recorregut petició-resposta.

#### Producte o microresultat esperat
Flux que recupera una informació temporal necessària, mostra què es guarda en sessió o cookie i permet invalidar-la de manera controlada.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:25 — Aclariment conceptual
- estat: informació que el sistema necessita recordar durant un flux
- sessió: estat associat a un usuari o navegador i guardat al servidor amb un identificador
- cookie: dada guardada al navegador, sovint usada per identificar o recordar informació limitada
- persistència: conservació estable de dades del domini més enllà del flux temporal

##### 0:25-0:50 — Modelatge docent
- activar sessió i guardar una dada temporal
- llegir la dada en una petició posterior
- observar la cookie de sessió en el navegador
- destruir o netejar la dada quan ja no té sentit

##### 0:50-1:35 — Implementació d'estat temporal
- l'alumnat tria què necessita recordar temporalment
- guarda la dada en sessió o cookie segons el cas
- recupera el flux en una pantalla posterior
- evita guardar dades sensibles en cookies

##### 1:35-2:10 — Invalidació i comprovació
- implementar eixida, reinici de flux o neteja de sessió
- provar què passa abans i després de la invalidació
- comprovar en eines de navegador què queda en cookies

##### 2:10-2:40 — Contrast amb persistència
- identificar quines dades són temporals
- identificar quines dades pertanyen al domini i haurien de persistir
- revisar errors habituals: usar sessió com si fora base de dades o cookie com si fora magatzem segur

##### 2:40-3:00 — Checkpoint final
- demo d'un flux recuperat
- demo d'invalidació
- explicació oral breu de què està en client, què està en servidor i què no és persistència

#### Intervenció docent prevista
- fer explícita la diferència entre recordar temporalment i guardar com a dada del producte
- revisar amb les eines del navegador quines cookies apareixen
- insistir que la cookie de sessió no conté necessàriament totes les dades de sessió
- tallar usos insegurs: contrasenyes, rols o dades sensibles en cookies sense criteri

#### Tasques concretes de l'alumnat
- decidir una dada temporal necessària del seu flux
- implementar-ne el guardat en sessió o cookie
- recuperar-la en una petició posterior
- invalidar-la amb una acció clara
- documentar en una frase què és estat temporal i què seria persistència del domini

#### Evidència verificable de la sessió
- codi d'inici, lectura i neteja de sessió o cookie
- demo abans/després de la invalidació
- captura o explicació de la cookie observada en el navegador
- nota breu distingint estat temporal, sessió, cookie i persistència

#### Checkpoint o pregunta de comprovació
Quina informació recorda el sistema només durant el flux, on està guardada i per què això no és encara persistència del domini?

#### Ús de la IA permés i forma de control
Ús permés per comparar sessió i cookie, revisar riscos de seguretat bàsics o generar una llista de comprovacions. Control: l'alumnat ha de demostrar en navegador què passa amb la cookie i en codi què passa amb `$_SESSION`, sense confondre-ho amb dades persistides.

#### Dificultats habituals i resposta docent prevista
- Si es diu que una cookie és “la sessió”, el professorat mostra la diferència entre identificador en client i dades de sessió en servidor.
- Si es guarda tot en sessió com si fora persistència, es demana separar dades temporals i dades del domini.
- Si no hi ha invalidació, la sessió no es dona per tancada fins que hi haja una neteja comprovable.

### Sessió 5. Microprojecte 5

**Sessió 5 — Identificació, autenticació, autorització i operació protegida**

#### Finalitat específica de la sessió
Connectar el flux construït amb una operació real del domini que només puga executar-se quan l'usuari està identificat, autenticat i autoritzat.

#### RA/focus tècnic
Focus en `RA4`: identificació d'usuari, comprovació de credencials, inici de sessió autenticada, autorització bàsica i bloqueig d'una operació protegida.

#### Producte o microresultat esperat
Login funcional mínim i una operació del domini protegida amb cas autoritzat i cas denegat reproduïbles.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:25 — Marc conceptual operatiu
- identificació: l'usuari diu qui és
- autenticació: el sistema comprova que pot demostrar-ho
- autorització: el sistema decidix què pot fer
- operació protegida: acció real del producte que no pot executar qualsevol visitant

##### 0:25-0:55 — Modelatge docent
- formulari de login o mecanisme equivalent
- comprovació de credencials de prova
- guardat de l'usuari autenticat en sessió
- protecció d'una operació real del domini
- resposta denegada quan no hi ha permís

##### 0:55-1:40 — Implementació d'identificació i autenticació
- l'alumnat crea o adapta el login
- comprova credencials de prova
- inicia sessió autenticada
- mostra una resposta clara d'error quan fallen les credencials

##### 1:40-2:20 — Autorització i operació protegida
- triar una acció del domini construïda en sessions anteriors
- impedir l'accés sense autenticació
- si hi ha rols o propietat, aplicar una restricció bàsica
- comprovar accés permés i denegat

##### 2:20-2:45 — Prova de casos
- usuari no autenticat intenta l'operació
- usuari autenticat executa l'operació
- usuari autenticat però no autoritzat, si el projecte ho permet
- tancament de sessió i nou intent

##### 2:45-3:00 — Checkpoint final
- demo curta del cas autoritzat i denegat
- identificació del punt exacte de codi on es comprova la restricció
- registre de casos pendents per al taller de proves de la sessió `6`

#### Intervenció docent prevista
- impedir que el login siga només una pantalla sense protecció real
- demanar que la protecció recaiga sobre una operació del domini, no només sobre una pàgina buida
- diferenciar verbalment i en codi identificació, autenticació i autorització
- revisar que l'operació protegida no es pot executar cridant directament la URL o el formulari

#### Tasques concretes de l'alumnat
- implementar o adaptar el formulari de login
- comprovar credencials amb un mecanisme mínim coherent
- guardar l'usuari autenticat en sessió
- protegir una operació real del domini
- provar accés permés, accés denegat i tancament de sessió
- documentar usuaris de prova i restriccions aplicades

#### Evidència verificable de la sessió
- login funcional
- sessió autenticada comprovable
- operació protegida del domini
- cas autoritzat i cas denegat executables
- nota breu indicant on es fa identificació, autenticació i autorització

#### Checkpoint o pregunta de comprovació
Quina operació real queda protegida, qui pot executar-la, qui no pot, i en quin punt del codi es decidix?

#### Ús de la IA permés i forma de control
Ús permés per revisar diferències entre identificació, autenticació i autorització, proposar casos de prova o detectar punts d'accés no protegits. Control: l'alumnat ha de fer una demo sense IA amb tres intents: no autenticat, autenticat permés i denegat o logout.

#### Dificultats habituals i resposta docent prevista
- Si només hi ha login però cap operació protegida, el professorat no valida la sessió i demana protegir una acció del domini.
- Si s'equipara autenticació amb autorització, es demana un exemple de “sé qui eres” i un altre de “pots fer açò”.
- Si la ruta protegida es pot invocar directament, es revisa el control al servidor abans de qualsevol execució de l'operació.

### Sessió 6. Microprojecte 6

**Sessió 6 — Taller de proves, depuració i checkpoint tècnic**

#### Finalitat específica de la sessió
Convertir la sessió en un taller de proves del flux complet, amb una bateria mínima comuna, registre d'incidències i documentació suficient per reproduir la demo.

#### RA/focus tècnic
Focus transversal en `RA2`, `RA3` i `RA4`: validació, errors controlats, flux autenticat, operació protegida, depuració i documentació tècnica mínima.

#### Producte o microresultat esperat
Bateria mínima de proves executada, incidències registrades, correccions prioritzades i `README` actualitzat amb instruccions de reproducció.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:25 — Presentació de la bateria mínima comuna
- cas `1`: formulari amb dades vàlides
- cas `2`: formulari amb dades invàlides
- cas `3`: dada validada, processada i reutilitzada
- cas `4`: estat temporal recuperat i invalidat
- cas `5`: accés no autenticat a operació protegida
- cas `6`: accés autenticat permés
- cas `7`: logout o invalidació i nou intent denegat
- cas `8`: error previsible documentat amb resposta clara

##### 0:25-0:45 — Modelatge de registre de prova
- mostrar com anotar entrada, passos, resultat esperat i resultat real
- diferenciar error funcional, error de validació i error de permisos
- prioritzar incidències que bloquegen el flux

##### 0:45-1:35 — Execució individual o per parelles
- l'alumnat executa la bateria mínima
- registra resultats i captures si cal
- marca incidències bloquejants i menors
- evita corregir sense haver reproduït abans el problema

##### 1:35-2:15 — Depuració guiada
- corregir primer errors que trenquen el flux complet
- usar missatges, logs o inspecció controlada
- repetir el cas fallit després de corregir
- deixar constància de la correcció

##### 2:15-2:40 — Documentació mínima
- actualitzar `README` amb passos d'arrancada i prova
- afegir usuaris de prova si aplica
- indicar l'operació protegida i els casos bàsics
- deixar pendents clars per a la sessió `7`

##### 2:40-3:00 — Checkpoint tècnic
- demo curta d'un cas complet
- revisió ràpida de la bateria mínima
- decisió docent sobre si el grup pot passar a crear la peça testable final o ha de reparar abans el flux

#### Intervenció docent prevista
- conduir la sessió com a taller, no com a explicació llarga
- exigir la bateria comuna abans de millores voluntàries
- ajudar a reproduir errors abans de tocar codi
- prioritzar correccions que afecten validació, estat, autenticació i operació protegida

#### Tasques concretes de l'alumnat
- executar la bateria mínima comuna
- registrar resultat esperat i resultat real
- corregir incidències bloquejants
- repetir les proves fallides
- actualitzar `README`
- marcar una regla o comprovació concreta que es convertirà en classe testable en la sessió `7`

#### Evidència verificable de la sessió
- taula o checklist de proves completada
- registre d'almenys una incidència o confirmació explícita que no n'hi ha
- correcció comprovada quan hi havia error
- `README` actualitzat
- demo reproduïble del flux complet

#### Checkpoint o pregunta de comprovació
Quins casos mínims demostren que el flux no és una demo puntual, sinó una funcionalitat reproduïble amb errors i permisos controlats?

#### Ús de la IA permés i forma de control
Ús permés per generar casos de prova addicionals, ajudar a interpretar un error o revisar el `README`. Control: la bateria mínima comuna és obligatòria i l'alumnat ha de registrar resultats reals executats, no només una llista generada.

#### Dificultats habituals i resposta docent prevista
- Si l'alumnat corregeix sense reproduir, el professorat demana tornar al cas fallit i registrar-lo.
- Si només prova el camí feliç, es bloqueja el checkpoint fins provar errors i accés denegat.
- Si el `README` no permet repetir la demo, es dedica el tram final a documentació abans de crear la peça testable.

**Bateria mínima obligatòria de prova**

La sessió `6` ha de deixar registrada una taula breu amb estos casos, encara que la forma siga manual, amb peticions guardades o amb proves automatitzades simples:

| Cas | Què comprova | Resultat esperat |
|---|---|---|
| cas vàlid | el flux complet accepta dades correctes i executa l'operació prevista | resposta correcta i dada reutilitzable dins del projecte |
| cas invàlid per validació | el servidor rebutja dades absents, mal formades o incoherents | error interpretable i possibilitat de correcció |
| cas no autenticat | una persona sense sessió vàlida intenta accedir a una part protegida | bloqueig, redirecció o resposta coherent |
| cas amb sessió caducada o estat invàlid | el sistema rep un estat que ja no hauria de permetre continuar | invalidació controlada i missatge o resposta coherent |
| cas d'accés a operació protegida | un usuari autenticat intenta una operació sotmesa a restricció de domini | permís o denegació segons la regla definida, no segons una ruta decorativa |

Cada cas ha d'incloure entrada, resultat esperat, resultat obtingut i incidència si n'hi ha. Si la IA ajuda a proposar proves, l'equip ha d'indicar quines accepta, quines descarta i què ha verificat manualment.

### Sessió 7. Microprojecte 7

**Sessió 7 — Primera peça testable amb POO i Composer**

#### Finalitat específica de la sessió
Convertir una regla o comprovació xicoteta del flux ja provat en una classe simple carregada amb Composer i verificada amb una primera prova unitària.

#### RA/focus tècnic
Focus transversal en `RA3` i `RA4`: encapsulació mínima, autoload, prova unitària inicial i no regressió del flux complet.

#### Producte o microresultat esperat
Classe simple del domini o servei, `composer.json`, autoload funcional, prova unitària mínima i comprovació que el flux web continua funcionant.

#### Seqüència temporal orientativa dins de les 3 hores

##### 0:00-0:20 — Selecció de peça testable
- partir de la bateria de proves de la sessió `6`
- triar una regla, comprovació o càlcul estable
- evitar triar una pantalla completa

##### 0:20-0:50 — Modelatge docent
- mostrar una classe mínima en `src/`
- configurar `composer.json`
- carregar amb `vendor/autoload.php`
- executar una prova unitària amb cas positiu i negatiu

##### 0:50-1:30 — Composer i classe
- crear `composer.json`
- configurar autoload
- crear una classe simple
- moure o reimplementar una regla acotada en un mètode

##### 1:30-2:10 — Prova unitària inicial
- crear un test en `tests/`
- comprovar un cas positiu
- comprovar un cas negatiu o límit
- executar i documentar el resultat

##### 2:10-2:35 — No regressió del flux
- repetir un cas clau de `R2M6`
- comprovar que la peça nova no trenca login, estat o regla afectada

##### 2:35-3:00 — Tancament `R2 -> R3`
- explicar què és unitari i què és prova de flux
- documentar com executar el test
- indicar què queda per a arquitectura i persistència en `R3`

#### Intervenció docent prevista
- evitar que la sessió es convertisca en MVC complet
- reduir l'abast a una classe i una prova mínima
- revisar que la classe no depén directament de `$_POST`, `$_SESSION`, `$_COOKIE` o HTML
- demanar execució real del test

#### Tasques concretes de l'alumnat
- triar una regla o comprovació del flux
- crear `composer.json`
- configurar autoload
- crear una classe simple
- escriure una prova unitària mínima
- repetir una prova de flux
- documentar què queda més testable

#### Evidència verificable de la sessió
- `composer.json`
- classe en `src/` o equivalent
- test en `tests/` o equivalent
- execució documentada del test
- prova de no regressió del flux
- nota de pas cap a `R3`

#### Checkpoint o pregunta de comprovació
Quina part del teu backend pots provar ara sense passar pel formulari ni pel navegador?

#### Ús de la IA permés i forma de control
Ús permés per proposar noms de classe, un `composer.json` mínim o casos de test. Control: l'alumnat ha d'executar el test i explicar què comprova amb dades pròpies.

#### Dificultats habituals i resposta docent prevista
- Si la classe només imprimeix HTML, es demana extraure una regla que retorne un valor.
- Si Composer existeix però no carrega res, es revisa l'autoload.
- Si només hi ha prova de flux, es demana una comprovació unitària mínima.
- Si l'alumnat intenta consumir una API externa, es deixa com a ampliació o pont cap a `R4`.

## Evidències esperades per sessió

- Sessió `1`: formulari o entrada equivalent, recuperació real de dades i errors visibles.
- Sessió `2`: tractament executable del formulari, conservació de dades en el reintent i guardat funcional del cas correcte.
- Sessió `3`: decisió, regla o funció amb efecte real sobre el flux.
- Sessió `4`: estat recuperable, demostració d'invalidació i frontera clara entre estat i conservació funcional.
- Sessió `5`: operació del domini protegida amb cas autoritzat i cas denegat.
- Sessió `6`: checklist de prova, documentació mínima i checkpoint tècnic.
- Sessió `7`: classe mínima carregada amb Composer, prova unitària inicial i comprovació final del flux.

## Moments de checkpoint

- Checkpoint curt `1`: al final de la sessió `2`, per comprovar que el flux ja rep, valida, processa i reutilitza dades.
- Checkpoint curt `2`: al final de la sessió `4`, per validar que estat, sessió o cookies no s'estan confonent amb persistència del domini.
- Checkpoint curt `3`: al final de la sessió `5`, per confirmar que hi ha una operació real protegida.
- Checkpoint tècnic `4`: al final de la sessió `6`, per confirmar que el flux és reproduïble, provat i documentat.
- Checkpoint de pas `R2 -> R3`: al final de la sessió `7`, per decidir si el grup entra al contrast de frameworks amb una base funcional i una primera peça testable defensable.

## Preparació del tancament del repte

- demanar una demo curta del flux complet, no només del login
- revisar que la informació correcta es recupera o es reutilitza dins del projecte
- exigir la bateria mínima de proves de la sessió `6`: cas vàlid, cas invàlid per validació, cas no autenticat, cas amb sessió caducada o estat invàlid i cas d'accés a operació protegida
- comprovar que la documentació mínima permet repetir la prova
- demanar una classe mínima amb Composer i una prova unitària inicial sobre codi que ja funciona
- demanar què haurà de reorganitzar-se en `R3` i què encara continua sent suport funcional de `R2`

## Criteri pràctic de tancament

`R2` queda preparat quan el professorat pot veure un flux complet de dades, lògica, estat i autenticació sobre la base comuna en `PHP`, amb una operació real protegida, proves mínimes reproduïbles, una classe mínima carregada amb Composer i una primera prova unitària que faça net el pas cap a `R3`.

La sessió `7` ha de demostrar que una part del backend ja es pot provar sense passar pel navegador, sense convertir el repte en una reescriptura arquitectònica completa.
