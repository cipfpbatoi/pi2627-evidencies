# R1S2. Entorn executable, landing inicial i tancament de R1

## Finalitat de la sessió

Esta sessió tanca el `Repte 1` i treballa el microrepte `R1M2` convertint la decisió tècnica inicial en una base executable real. L'objectiu no és avançar funcionalitats de `R2`, sinó deixar un repositori que arranque, servisca una landing inicial del producte des del backend i tinga documentació suficient perquè una altra persona puga repetir l'arrencada.

Al final de la sessió, cada alumne o parella ha de poder ensenyar un entorn executable o un bloqueig tècnic ben documentat dins del mateix repositori individual creat pel professorat iniciat en `R1S1`, obrir una landing inicial amb CSS senzill servida pel backend, assenyalar quin fitxer respon a una petició i explicar què queda preparat per al primer formulari de `R2`.

## Encaix dins del Repte 1

- **Repte**: `R1. Kickoff backend`
- **Microrepte**: `R1M2`
- **Sessió**: `R1S2`
- **Duració orientativa**: `3 hores`
- **Focus**: entorn executable, serveis mínims, landing inicial servida pel backend, README executable, evidències i checkpoint de pas a `R2`
- **No entra encara**: formularis, validació de dades del domini, sessions, autenticació, persistència funcional o arquitectura completa

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA1b` | comprovació de l'execució en servidor i resposta web |
| `RA1c` | identificació del servidor web, runtime i serveis de suport |
| `RA1d` | configuració mínima de l'entorn de desenvolupament |
| `RA1e` | verificació del funcionament amb URL, log, captura o demo |
| `RA1f` | documentació de passos reals d'arrencada i parada |
| `RA1g` | justificació tècnica curta o nota tècnica de decisió inicial |
| Evidència central | repositori executable amb landing inicial servida pel backend i README reproduïble |
| Verificació docent | demo curta, pregunta tècnica i revisió del README |

## Producte esperat

Un repositori que permeta:

- continuar sobre el repositori individual creat pel professorat clonat en `R1S1`;
- arrancar un entorn amb `Docker` o equivalent;
- executar `PHP` darrere d'un servidor web;
- disposar de base de dades i phpMyAdmin quan corresponga al model docent;
- obrir una landing inicial del producte servida pel backend;
- usar una ruta tècnica com `/health` només com a comprovació auxiliar, si cal;
- seguir un `README` executable;
- localitzar la documentació i decisions del repte;
- entendre què queda preparat per a `R2`.

## Preparació prèvia del professorat

- Preparar un model mínim d'entorn executable, sense convertir-lo en solució final tancada.
- Tindre un error controlat per modelar lectura de logs.
- Preparar una checklist de revisió: arrencada, serveis, landing inicial, README i documentació.
- Tindre clar que un error documentat pot ser acceptable si és precís i té pròxima acció concreta.

## Continguts a explicar

- Estructura mínima d'un repositori backend.
- Paper de `docker-compose.yml`, servidor web, `PHP`, base de dades i phpMyAdmin.
- Diferència entre infraestructura i funcionalitat.
- Landing inicial del producte servida pel backend.
- Diferència entre una landing de producte i un `healthcheck` tècnic.
- README executable, documentació tècnica i evidències.
- Continuïtat del mateix repositori: `README.md`, `docs/`, `evidence/`, commits i `push`.
- Verificació abans de passar a `R2`.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:45. Recuperació de R1M1

L'alumnat recupera la decisió tècnica de `R1M1` i confirma quina base construirà.

Resultat del tram: cada equip sap quin entorn intenta arrancar i per què.

### 0:45-1:00. Modelatge docent de l'entorn mínim

El professorat mostra els serveis mínims, com es comproven i on mirar errors.

Resultat del tram: el grup té una referència clara de què vol dir "entorn executable".

### 1:00-1:25. Adaptació del repositori individual

Tasques:

- recuperar el repositori individual clonat en `R1S1`;
- comprovar `git status` i que el remot apunta al repositori assignat pel professorat;
- obrir issue mare de `R1`;
- crear o adaptar la configuració d'entorn;
- ordenar l'estructura inicial.

Resultat del tram: el mateix repositori del curs queda preparat per arrancar serveis.

### 1:25-1:50. Arrencada i lectura d'errors

L'alumnat arranca l'entorn, revisa ports, serveis i logs, i documenta qualsevol bloqueig.

Resultat del tram: l'entorn arranca o hi ha un error amb log, hipòtesi i pròxima acció.

### 1:50-2:20. Landing inicial servida pel backend

L'alumnat crea una landing inicial del producte amb contingut propi i CSS senzill. Pot usar IA per obtindre una primera proposta d'HTML/CSS, però ha d'adaptar-la al seu projecte i verificar que la resposta està servida pel backend.

Resultat del tram: hi ha una URL documentada que mostra la landing del producte i que el professorat pot obrir des de l'entorn executat.

### 2:20-2:30. README executable

Tasques:

- escriure requisits;
- indicar com arrancar i parar;
- indicar URL de comprovació;
- explicar com detectar que funciona.

Resultat del tram: una altra persona podria repetir l'arrencada sense informació oral oculta.

### 2:30-2:45. Documentació i evidències de R1

L'alumnat deixa dins del repositori la fitxa de `R1M1`, la decisió tècnica, incidències i evidències.

Resultat del tram: la documentació de `R1` és localitzable i prepara el pas a `R2`.

### 2:45-2:50. Checkpoint docent

Cada equip fa una demo curta o mostra el bloqueig documentat.

Pregunta de tancament: quin fitxer respon a la petició que estàs ensenyant i quin servei l'executa?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Recuperar el repositori individual creat pel professorat iniciat en `R1S1`.
- Comprovar que el treball es pujarà al remot correcte.
- Obrir issue mare de `R1` amb tasques de `R1M2`.
- Crear o adaptar la configuració d'entorn.
- Arrancar serveis o documentar l'error amb hipòtesi i pròxima acció.
- Crear una landing inicial del producte servida pel backend, amb HTML i CSS senzill.
- Deixar un `healthcheck` o endpoint d'estat només com a comprovació tècnica, si és útil.
- Fer un microcanvi i comprovar que la resposta canvia.
- Escriure el `README` amb passos reals.
- Guardar fitxa, decisió, incidències i evidències dins del repositori.
- Fer commits significatius.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Repositori | és el repositori individual del curs, amb estructura clara i commits significatius |
| Entorn | arranca o documenta un bloqueig amb log, hipòtesi i pròxima acció |
| Landing inicial | URL documentada, contingut propi del producte i CSS senzill servit pel backend |
| Comprovació tècnica | `healthcheck` o endpoint d'estat opcional, sense substituir la landing |
| README | inclou requisits, arrencada, parada, URL i comprovació |
| Evidència de prova | captura, log, URL o demo |
| Documentació | fitxa, decisió tècnica, incidències i evidències localitzables |
| Ús d'IA | AI log quan hi haja ús rellevant |

## Criteris d'èxit

El microrepte està aconseguit si:

- el projecte arranca o el bloqueig està documentat amb precisió tècnica;
- el README permet repetir els passos sense informació oral oculta;
- la landing inicial ve del backend i està connectada amb el producte;
- l'alumnat pot explicar què fa cada servei i quin fitxer respon a la petició;
- la documentació de `R1` està dins del repositori i prepara el pas a `R2`.

## Què no és suficient

- Entregar una carpeta copiada que no es pot explicar.
- Tindre Docker definit però no comprovar cap servei.
- Crear una pàgina estàtica oberta com a fitxer sense execució de servidor.
- Entregar només un `healthcheck` sense landing inicial del producte.
- Escriure un README genèric que no arranca el projecte real.
- Deixar la fitxa de `R1M1` o les decisions fora del repositori.
- Avançar formularis o login sense haver tancat l'entorn base.

## Ús de la IA

La IA pot ajudar a diagnosticar errors de configuració, explicar logs o revisar el README.

Control obligatori:

- cada proposta s'ha de verificar en execució;
- s'ha de registrar l'ús rellevant en l'AI log;
- es penalitza incloure instruccions generades que no funcionen en el repositori real.

## Suport per a alumnat amb dificultat

- Reduir l'objectiu a serveis mínims i una landing molt simple del producte.
- Acceptar una ruta `/health` només com a comprovació tècnica auxiliar.
- Treballar amb una taula "servei, per a què servix, com el comprove".
- Acceptar temporalment un error documentat si inclou log, hipòtesi i pròxima acció concreta.

Frase guia: "No afegis funcionalitat de R2 fins que pugues arrancar, obrir i explicar una landing inicial servida pel backend."

## Ampliació per a alumnat avançat

- Afegir una nota tècnica de decisió inicial sobre l'estructura triada.
- Incorporar una prova manual documentada més completa.
- Afegir una pàgina `Sobre el projecte` o una navegació mínima entre dos pàgines.
- Preparar un endpoint d'estat que mostre versió o configuració no sensible.
- Deixar una issue preparada per al primer formulari de `R2`.

## Checklist de tancament

- [ ] El repositori té estructura clara i commits significatius.
- [ ] L'entorn arranca o l'error està ben documentat.
- [ ] Hi ha landing inicial servida pel backend.
- [ ] El `healthcheck`, si existeix, és només comprovació tècnica.
- [ ] El README permet arrancar, parar i comprovar.
- [ ] La documentació de `R1` està dins del repositori.
- [ ] Hi ha decisió tècnica o nota tècnica breu.
- [ ] L'alumnat pot fer una defensa breu.

## Connexió amb el microrepte posterior

`R2M1` partirà d'esta base per introduir entrada de dades i validació bàsica en servidor. Per això `R1M2` ha de tancar un entorn executable i una landing inicial comprensible, sense avançar encara formularis, sessions, login ni persistència funcional.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT02. README executable i commit defensable](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT02-README-executable-i-commit-defensable.pdf)
- **Teoria o material associat**: [Stack servidor i entorn executable](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R1-Stack-servidor-i-entorn-executable.pdf)

## Microtaller associat

- **Microtaller**: `MT02. README executable i commit defensable`
- **Moment recomanat**: després de comprovar que l'entorn arranca i abans del commit de tancament de `R1`.
- **Evidència mínima**: README amb arrencada real, landing inicial verificada i commit explicable.

## Registre de l’ampliació global al final de R1

En R1M2 es recull una única proposta d’ampliació del repte (0–1), amb declaració `docs/r1-ampliacio.md`. En la presentació el professorat comprova mínims, demo i comprensió, valida els punts i deixa observació. El programa calcula `0,9 × mitjana ponderada del nucli + ampliació validada`; no suma en les dimensions del microrepte ni en cada RA. Pendent de revisió no és zero.
