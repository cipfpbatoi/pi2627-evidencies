# R1. Programació d'aula - Kickoff backend

## Finalitat

El `Repte 1` inicia el treball de backend amb una base tècnica mínima, executable i explicable. L'objectiu no és construir encara un producte complet, sinó entendre el model client/servidor, prendre una primera decisió tècnica guiada i deixar un repositori que arranque amb una landing inicial del producte servida pel backend.

El repte queda organitzat en `2` microreptes, un per sessió ordinària:

| Sessió | Microrepte | Duració | Pes | Focus |
|---|---|---:|---:|---|
| `R1S1` | `R1M1. Model client/servidor i decisió tècnica inicial` | `3h` | `25%` | Comprensió del model d'execució i decisió tècnica inicial. |
| `R1S2` | `R1M2. Entorn executable, landing inicial i tancament de R1` | `3h` | `75%` | Entorn executable, landing inicial servida pel backend, documentació i checkpoint. |

## Encaix dins del repte

`R1M1` dona el criteri: què s'executa al navegador, què s'executa al servidor i quina base tècnica inicial té sentit per al projecte. `R1M2` transforma eixa decisió en una base executable real, amb una landing inicial servida pel backend i documentació suficient per poder continuar en `R2`.

Els antics blocs de treball d'entorn executable, landing inicial i verificació final queden unificats dins de `R1M2`. No són microreptes separats: són parts de la mateixa sessió de tancament del kickoff.

La tria de stack en `R1M1` no és una decisió definitiva de framework ni una invitació a instal·lar ja `Laravel`, `Symfony` o `NestJS`. És una decisió inicial per orientar `R1M2`: amb quina base mínima s'arrancarà el backend, quina alternativa es descarta de moment i quin dubte quedarà pendent per revisar abans de l'entrada real a framework en `R3`.

## Relació amb RA, CA i criteris de treball

| Microrepte | RA i CA treballats | Criteris de treball |
|---|---|---|
| `R1M1` | `RA1a`, `RA1b`, `RA1c`, `RA1g` | Diferenciar client i servidor, identificar el paper del backend, reconéixer el servidor d'aplicacions i justificar una tecnologia inicial. |
| `R1M2` | `RA1b`, `RA1c`, `RA1d`, `RA1e`, `RA1f`, `RA1g` | Posar en marxa l'entorn, explicar els serveis, generar una primera resposta del servidor, verificar el funcionament i documentar decisions. |

## R1S1 / R1M1. Model client/servidor i decisió tècnica inicial

### Producte esperat

Un repositori individual ja operatiu amb un primer `push`, més una fitxa breu d'exploració tècnica inicial amb:

- esquema client/servidor aplicat al producte propi;
- exemples de què fa el client i què fa el servidor;
- comparació curta de dues o tres opcions tècniques;
- decisió inicial de stack i alternativa descartada;
- dubtes o límits que encara queden oberts.

La fitxa ha de deixar explícit què es farà en `R1M2` i què queda ajornat fins a `R3`. Una decisió acceptable pot dir que en `R1M2` es començarà amb `Docker + PHP + servidor web` i que un framework concret es revisarà més avant. Una decisió insuficient és limitar-se a dir "usarem Laravel perquè és popular".

### Preparació prèvia del professorat

- Tindre localitzats els materials d'arquitectura web, client/servidor, backend i llenguatges/frameworks.
- Crear els repositoris individuals des de la plantilla, inicialitzar `main` i enviar les invitacions de col·laboració.
- Preparar un exemple docent de producte senzill per modelar la fitxa.
- Preparar una pregunta oral curta per comprovar comprensió individual.

### Continguts a explicar

- Petició HTTP, resposta i paper del navegador.
- Diferència entre codi que s'executa en client i codi que s'executa en servidor.
- Paper del servidor web, runtime de servidor i backend.
- Diferència entre triar una tecnologia amb criteri i triar-la per moda.
- Diferència entre decisió inicial de base tècnica en `R1` i entrada real a framework en `R3`.
- Ús acceptable de la IA per explorar opcions, sempre amb reformulació pròpia.

### Seqüenciació

| Temps | Activitat |
|---:|---|
| `0:00-0:15` | Presentació del repte, repositori individual, producte esperat i relació amb `R2`. |
| `0:15-0:35` | Acceptació i clonatge del repositori individual. |
| `0:35-0:55` | Explicació guiada del flux client/servidor amb un exemple concret. |
| `0:55-1:15` | Modelatge docent de la fitxa d'exploració tècnica i del `README.md` inicial. |
| `1:15-1:55` | Treball individual: esquema, exemples i primera comparació tècnica. |
| `1:55-2:20` | Contrast per parelles i detecció d'incoherències. |
| `2:20-2:40` | Tancament de la decisió inicial de stack: què va a `R1M2`, què es descarta i què queda per a `R3`. |
| `2:40-2:55` | Commit i `push` inicial amb `README.md` i fitxa localitzable. |
| `2:55-3:00` | Checkpoint `CP-R1.1`: revisió ràpida i pregunta oral. |

### Tasques concretes de l'alumnat

- Escriure quin producte vol iniciar i quin paper tindrà el backend.
- Acceptar la invitació de col·laboració, clonar el repositori individual i identificar `README.md`, `ENTREGA.md`, `docs/` i `evidence/`.
- Dibuixar o descriure el flux client/servidor.
- Escriure tres exemples del projecte: acció del client, acció del servidor i resposta.
- Comparar de manera breu dues o tres opcions tècniques del marc docent.
- Tancar una decisió inicial i una alternativa descartada.
- Indicar què queda ajornat fins a `R3` si es parla de framework complet.
- Registrar un dubte tècnic real.
- Fer un primer commit i `push` a `main`.

### Evidències mínimes

- Repositori individual amb invitació acceptada, clonat i amb primer `push`.
- `README.md` inicial amb `R1M1`, projecte base, flux client/servidor i decisió inicial.
- Fitxa d'exploració tècnica inicial localitzable.
- Esquema client/servidor aplicat al producte.
- Decisió tècnica inicial justificada.
- Alternativa descartada amb motiu.
- Dubte o límit tècnic registrat.
- Límit temporal clar: què es farà en `R1M2` i què queda per a `R3`.

### Criteris d'èxit

- La fitxa parla del producte concret i no només de tecnologies genèriques.
- L'alumnat pot explicar què passa al navegador i què passa al servidor.
- La decisió tècnica és coherent amb el curs i amb el pas a `R1M2`.
- La decisió no substitueix l'objectiu de `R1M2`: arrancar una base executable mínima.

### Què no és suficient

- Llistar frameworks sense explicar per a què servixen.
- Copiar una resposta d'IA sense entendre-la.
- Dir "usarem Laravel perquè és popular" sense relació amb el projecte.
- Confondre backend amb base de dades.
- Instal·lar un framework complet sense poder explicar encara el flux client/servidor ni la base executable.

### Ús de la IA

La IA pot ajudar a comparar opcions i aclarir conceptes, però la fitxa ha d'estar escrita amb llenguatge propi. El control es farà amb una pregunta oral i amb la coherència entre fitxa, decisió i projecte.

### Suport per a alumnat amb dificultat

- Donar una plantilla de quatre caixes: navegador, servidor web, codi de servidor i dades.
- Reduir la comparació a dues opcions.
- Demanar una resposta curta de cinc línies abans de completar tota la fitxa.

### Ampliació per a alumnat avançat

- Afegir una nota tècnica breu de decisió.
- Comparar la mateixa funcionalitat en `PHP` pla i en un framework.
- Explicar què canviaria si el client fora una app mòbil.

### Checklist de tancament

- [ ] La fitxa està completa.
- [ ] El repositori individual està amb invitació acceptada, clonat i amb primer `push`.
- [ ] Hi ha esquema client/servidor.
- [ ] Hi ha decisió tècnica i alternativa descartada.
- [ ] La decisió diferencia què es farà en `R1M2` i què queda per a `R3`.
- [ ] Hi ha dubte tècnic registrat.
- [ ] L'alumne pot respondre una pregunta oral curta.

### Connexió amb el microrepte posterior

`R1M2` parteix de la decisió tècnica de `R1M1` i la converteix en un repositori executable. Si la decisió no està clara, l'entorn posterior quedarà com una còpia sense criteri. Si la decisió és massa ambiciosa, cal reduir-la al mínim executable i deixar el framework complet per al moment previst del curs.

## R1S2 / R1M2. Entorn executable, landing inicial i tancament de R1

### Producte esperat

Un repositori que permeta:

- arrancar un entorn amb `Docker` o equivalent;
- executar `PHP` darrere d'un servidor web;
- disposar de base de dades i phpMyAdmin quan corresponga al model docent;
- obrir una landing inicial del producte servida pel backend;
- usar una ruta tècnica com `/health` només com a comprovació auxiliar;
- seguir un `README` executable;
- localitzar la documentació i decisions del repte;
- entendre què queda preparat per a `R2`.

### Preparació prèvia del professorat

- Preparar un model mínim d'entorn executable, sense convertir-lo en solució final tancada.
- Tindre un error controlat per modelar lectura de logs.
- Preparar una checklist de revisió: arrencada, serveis, landing inicial, README i documentació.

### Continguts a explicar

- Estructura mínima d'un repositori backend.
- Paper de `docker-compose.yml`, servidor web, `PHP`, base de dades i phpMyAdmin.
- Diferència entre infraestructura i funcionalitat.
- Landing inicial del producte servida pel backend.
- Diferència entre landing de producte i `healthcheck` tècnic.
- README executable, documentació tècnica i evidències.
- Verificació abans de passar a `R2`.

### Seqüenciació

| Temps | Activitat |
|---:|---|
| `0:00-0:15` | Recuperació de `R1M1` i confirmació de la base tècnica triada. |
| `0:15-0:35` | Modelatge docent de l'entorn mínim i dels serveis. |
| `0:35-1:10` | Creació o adaptació del repositori, estructura i configuració d'arrencada. |
| `1:10-1:40` | Arrencada, lectura d'errors, ajustos de ports o serveis i prova del servidor web. |
| `1:40-2:20` | Creació de la landing inicial del producte servida pel backend, amb HTML i CSS senzill. |
| `2:20-2:35` | README amb requisits, arrencada, parada, URL i comprovacions. |
| `2:35-2:50` | Documentació del repte: fitxa de `R1M1`, decisió tècnica, incidències i evidències. |
| `2:50-3:00` | Checkpoint `CP-R1.2`: demo curta, pregunta tècnica i pas a `R2`. |

### Tasques concretes de l'alumnat

- Recuperar el repositori individual creat pel professorat iniciat en `R1S1`.
- Comprovar que el treball es pujarà al remot correcte.
- Obrir issue mare de `R1` amb tasques de `R1M2`.
- Crear o adaptar la configuració d'entorn.
- Arrancar serveis o documentar l'error amb hipòtesi i pròxima acció.
- Crear una landing inicial del producte servida pel backend, amb HTML i CSS senzill.
- Usar IA com a suport per al primer HTML/CSS si cal, però adaptant i verificant el resultat.
- Deixar un `healthcheck` o endpoint d'estat només com a comprovació tècnica, si és útil.
- Fer un microcanvi i comprovar que la resposta canvia.
- Escriure el `README` amb passos reals.
- Guardar fitxa, decisió, incidències i evidències dins del repositori.
- Fer commits significatius.

### Evidències mínimes

- Repositori usable.
- Configuració Docker o equivalent.
- README executable.
- Landing inicial servida pel backend o error documentat amb pla de correcció.
- Evidència de prova: URL, captura, log o demo.
- Documentació localitzable dins del repositori.
- Justificació tècnica curta o nota tècnica de decisió inicial.
- AI log quan hi haja ús rellevant d'IA.

### Criteris d'èxit

- El projecte arranca o el bloqueig està documentat amb precisió tècnica.
- El README permet repetir els passos sense informació oral oculta.
- La landing inicial ve del backend i està connectada amb el producte.
- L'alumnat pot explicar què fa cada servei i quin fitxer respon a la petició.
- La documentació de `R1` està dins del repositori i prepara el pas a `R2`.

### Què no és suficient

- Entregar una carpeta copiada que no es pot explicar.
- Tindre Docker definit però no comprovar cap servei.
- Crear una pàgina estàtica oberta com a fitxer sense execució de servidor.
- Entregar només un `healthcheck` sense landing inicial del producte.
- Escriure un README genèric que no arranca el projecte real.
- Deixar la fitxa de `R1M1` o les decisions fora del repositori.

### Ús de la IA

La IA pot ajudar a diagnosticar errors de configuració, explicar logs o revisar el README. Cada proposta s'ha de verificar en execució. Es penalitza incloure instruccions generades que no funcionen en el repositori real.

### Suport per a alumnat amb dificultat

- Reduir l'objectiu a serveis mínims i una landing molt simple del producte.
- Acceptar una ruta `/health` només com a comprovació tècnica auxiliar.
- Treballar amb una taula "servei, per a què servix, com el comprove".
- Acceptar temporalment un error documentat si inclou log, hipòtesi i pròxima acció concreta.

### Ampliació per a alumnat avançat

- Afegir una nota tècnica de decisió inicial sobre l'estructura triada.
- Incorporar una prova manual documentada més completa.
- Afegir una pàgina `Sobre el projecte` o una navegació mínima entre dos pàgines.
- Preparar un endpoint d'estat que mostre versió o configuració no sensible.
- Deixar una issue preparada per al primer formulari de `R2`.

### Checklist de tancament

- [ ] El repositori té estructura clara i commits significatius.
- [ ] L'entorn arranca o l'error està ben documentat.
- [ ] Hi ha landing inicial servida pel backend.
- [ ] El `healthcheck`, si existeix, no és l'única entrega.
- [ ] El README permet arrancar, parar i comprovar.
- [ ] La documentació de `R1` està dins del repositori.
- [ ] Hi ha decisió tècnica o nota tècnica breu.
- [ ] L'alumnat pot fer una defensa breu.

### Connexió amb el microrepte posterior

`R2M1` partirà d'esta base per introduir entrada de dades i validació bàsica en servidor. Per això `R1M2` ha de tancar un entorn executable i una landing inicial comprensible, sense avançar encara formularis, sessions, login ni persistència funcional.

## Evidències globals del Repte 1

- Fitxa breu d'exploració tècnica inicial.
- Explicació del model client/servidor aplicada al producte.
- Decisió tècnica inicial.
- Repositori usable i amb commits significatius.
- Entorn executable amb `Docker`, `PHP`, servidor web, BBDD i phpMyAdmin quan corresponga.
- README executable.
- Landing inicial servida pel backend.
- Documentació localitzable dins del repositori.
- Justificació tècnica breu o nota tècnica de decisió inicial.
- AI log quan hi haja ús rellevant d'IA.
- Defensa tècnica breu o checkpoint.

## Criteri pràctic de tancament

`R1` queda preparat quan el professorat pot veure una decisió tècnica guiada, una base executable adaptada, una landing inicial servida pel backend i una documentació suficient per continuar cap a `R2` sense tornar a començar.
