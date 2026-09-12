# R2S4. Estat, sessio i cookies

## Finalitat de la sessio

Esta sessio introdueix el manteniment d'informacio temporal entre peticions. Després de rebre dades, conservar reintents, guardar funcionalment casos correctes i aplicar una regla del projecte, el backend ha de poder recordar informacio provisional del flux sense confondre-la amb persistencia del domini.

L'objectiu és que l'alumnat distingisca estat, sessio, cookie i guardat funcional, implemente un mecanisme real de recuperacio i demostre una invalidacio controlada. En esta sessio el mínim ja no és “sessio o cookie”: cal usar **sessio i cookie**, cadascuna amb una responsabilitat diferent i significativa dins del projecte.

També s'introdueix un punt tècnic que prepararà el codi per a créixer: un fitxer comú de configuracio o bootstrap amb una ruta base del projecte perquè els `include` / `require` partisquen del mateix lloc. Això evita rutes fràgils quan els fitxers canvien de carpeta.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M4`
- **Sessio**: `R2S4`
- **Duracio orientativa**: `3 hores`
- **Focus**: dada significativa en `$_SESSION`, preferencia o rastre no sensible en cookie, lectura acotada de `$_SERVER`, recuperacio posterior, invalidacio i base comuna per a includes
- **No entra encara**: login complet, rols, autoritzacio complexa, base de dades com a centre o arquitectura MVC

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA4.a` | identificacio de mecanismes per conservar informacio entre peticions |
| `RA4.b` | ús de sessio per conservar estat temporal del flux en servidor |
| `RA4.c` | ús de cookie no sensible en client i lectura acotada de context de peticio |
| Organitzacio mínima | fitxer comú amb ruta base per a `include` / `require` |
| Evidencia central | sessio i cookie recuperables, context `$_SERVER` explicat i invalidacio demostrada |
| Verificacio docent | execucio abans/després i pregunta sobre client, servidor, cookie, `$_SERVER`, includes i persistencia |

## Producte esperat

Una evolucio del flux que incloga, com a minim:

- una dada temporal amb sentit dins del producte;
- guardat d'eixa dada en `$_SESSION` o mecanisme equivalent de servidor;
- lectura de la dada de sessio en una peticio posterior;
- una cookie pròpia no sensible amb sentit funcional, per exemple preferencia de vista, últim filtre, idioma, avís vist o última seccio consultada;
- lectura de la cookie en una peticio posterior;
- lectura acotada d'almenys una dada de `$_SERVER` útil per al projecte o per a la depuracio del flux, com `REQUEST_METHOD`, `HTTP_USER_AGENT` o `REMOTE_ADDR` tractada amb prudencia;
- un fitxer comú de configuracio o bootstrap que definisca una ruta base, per exemple `BASE_PATH`, i que permeta fer includes des d'un punt estable;
- accio de neteja, reinici o invalidacio;
- demo abans/després de la invalidacio;
- nota al `README`, issue o registre explicant què es guarda en sessio, què es guarda en cookie, què es llig de `$_SERVER`, on està la ruta base i per què tot això és temporal.

## Preparacio previa del professorat

Convé tindre preparat:

- exemple mínim de `session_start()`, escriptura, lectura i neteja;
- exemple visual de cookie pròpia en el navegador;
- exemple curt de `setcookie`, lectura de `$_COOKIE` i caducitat o neteja;
- exemple segur de lectura de `$_SERVER['REQUEST_METHOD']` i `$_SERVER['HTTP_USER_AGENT']`;
- exemple de `config.php` o `bootstrap.php` amb `define('BASE_PATH', dirname(__DIR__));`;
- exemple d'include robust: `require_once BASE_PATH . '/src/regles.php';`;
- comparacio entre estat temporal i guardat funcional;
- llista de dades que no s'han de posar en cookies sense criteri;
- pauta per triar dades significatives: pas del flux o esborrany en sessio; preferencia o últim filtre no sensible en cookie.

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Aclariment conceptual

El professorat separa quatre idees:

- estat: informacio que cal recordar durant un flux;
- sessio: estat associat a un client i guardat al servidor;
- cookie: dada en el navegador que pot identificar o recordar informacio limitada;
- persistencia: dada estable del domini.

Resultat: cada equip identifica una dada temporal per a sessio i una dada no sensible per a cookie.

### 0:55-1:15. Modelatge docent

Mostrar:

- inici de sessio;
- guardat d'una dada;
- creacio d'una cookie pròpia;
- lectura en una altra peticio;
- inspeccio de cookie;
- lectura acotada de `$_SERVER`;
- fitxer `config.php` o `bootstrap.php` amb ruta base;
- neteja o destruccio de la dada.

Resultat: l'alumnat veu on viu cada part del mecanisme.

### 1:15-1:35. Implementacio de sessio significativa

Tasques:

- decidir què cal recordar temporalment en servidor;
- guardar-ho en `$_SESSION`;
- recuperar-ho en una pantalla posterior;
- mostrar una resposta clara quan la dada existeix.

Resultat: el flux recupera informacio de sessio entre peticions.

### 1:35-1:55. Cookie pròpia i context de client

Tasques:

- triar una cookie no sensible amb sentit en el projecte;
- guardar-la amb `setcookie` o mecanisme equivalent;
- llegir-la amb `$_COOKIE` o equivalent;
- inspeccionar-la al navegador;
- llegir una dada de `$_SERVER` útil per explicar el context de peticio;
- no usar `$_SERVER` com si identificara una persona autenticada.

Resultat: el projecte diferencia estat de servidor, dada en client i context de peticio.

### 1:55-2:15. Base comuna per a includes

Tasques:

- crear o revisar un fitxer `config.php`, `bootstrap.php` o equivalent;
- definir una ruta base del projecte;
- importar eixe fitxer des de les pàgines principals;
- usar la ruta base per incloure almenys una llibreria pròpia o fitxer compartit;
- comprovar que l'include no depén de la carpeta des d'on s'executa casualment.

Resultat: els includes parteixen d'un punt estable del projecte.

### 2:15-2:35. Invalidacio i comprovacio

Tasques:

- afegir accio de neteja, reinici o eixida del flux;
- comprovar què passa abans i després en sessio;
- caducar o netejar la cookie pròpia si toca;
- revisar la cookie i l'estat visible;
- evitar que la dada temporal continue afectant el flux després de netejar-la.

Resultat: hi ha invalidacio controlada.

### 2:35-2:45. Contrast amb guardat funcional

Tasques:

- identificar què és temporal i què és dada del producte;
- explicar per què esta dada no substitueix la persistencia;
- ajustar noms i missatges si confonen.

Resultat: queda clara la frontera conceptual.

### 2:45-2:50. Checkpoint docent

Cada equip mostra:

- dada de sessio guardada i recuperada;
- cookie pròpia creada, llegida i observada;
- dada de `$_SERVER` usada i explicada;
- fitxer de base/configuracio per a includes;
- invalidacio o neteja;
- explicacio de què queda en client, què queda en servidor i què només és context de peticio.

Pregunta: quina informacio recorda el sistema en sessio, quina queda en cookie, quina ve de `$_SERVER` i com evites que els includes depenguen de rutes fràgils?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Triar una dada temporal significativa del flux per a sessio.
- Guardar-la en `$_SESSION` o mecanisme equivalent.
- Recuperar-la en una peticio posterior.
- Crear una cookie pròpia no sensible amb sentit funcional.
- Llegir la cookie en una peticio posterior i observar-la al navegador.
- Llegir almenys una dada de `$_SERVER` amb finalitat clara.
- Crear o usar un fitxer comú de configuracio/bootstrap amb ruta base per a includes.
- Implementar invalidacio.
- Documentar què es guarda en sessio, cookie i què ve de `$_SERVER`, i què no és persistencia.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Sessio | dada temporal significativa guardada i recuperada amb `$_SESSION` o equivalent |
| Cookie | cookie pròpia no sensible creada, llegida i observable |
| `$_SERVER` | dada de context de peticio llegida i explicada amb prudencia |
| Includes | fitxer comú amb ruta base usada per importar fitxers compartits |
| Invalidacio | accio que neteja o reinicia sessio i, si toca, cookie |
| Explicacio | frontera entre sessio, cookie, `$_SERVER`, estat temporal i guardat funcional |
| Documentacio | instruccions per reproduir abans/després |

## Criteris d'exit

- La dada de sessio no és decorativa.
- La cookie té sentit funcional i no conté dades sensibles.
- Sessio i cookie es recuperen en una peticio diferent.
- `$_SERVER` s'usa per context tècnic, no per autenticar.
- Els includes parteixen d'una ruta base comuna.
- La invalidacio és comprovable.
- L'alumnat diferencia client, servidor i persistencia.
- No es guarden dades sensibles en cookies sense criteri.

## Que no és suficient

- Dir que hi ha sessio sense cap dada recuperable.
- Usar només sessio i no crear cap cookie pròpia.
- Crear una cookie sense llegir-la ni usar-la.
- Usar `$_SERVER` per simular autenticacio o identitat fiable.
- Fer includes amb rutes relatives fràgils sense cap base comuna.
- Usar una variable normal que desapareix entre peticions.
- Guardar-ho tot en sessio com si fora base de dades.
- Posar contrasenyes, rols o dades sensibles en cookies sense justificacio.
- No tindre forma de netejar o invalidar.

## Us de la IA

La IA pot ajudar a comparar sessio i cookie, interpretar errors, proposar un `bootstrap.php` senzill o redactar la prova. Control: l'alumnat ha de demostrar en execucio què es guarda, on es guarda, què ve de `$_SERVER`, com es fan els includes i quan desapareix.

## Suport per alumnat amb més dificultat

Reduir-ho a tres peces: pas actual en sessio, preferencia visual en cookie i `REQUEST_METHOD` mostrat o registrat en una pàgina de diagnòstic. Crear un `config.php` amb ruta base i usar-lo per un únic `require_once`.

## Ampliacio per alumnat avançat

- Caducitat funcional d'una dada temporal.
- Preferencia simple en cookie no sensible.
- Missatge diferent si l'estat és invàlid.
- Anonimitzacio o resum de `REMOTE_ADDR` si es mostra.
- Helper propi per llegir context de peticio.
- Bootstrap compartit per carregar diverses llibreries pròpies.
- Taula de proves abans/després.

## Checklist de tancament

- [ ] He triat una dada temporal significativa per a sessio.
- [ ] La guarde en `$_SESSION` o equivalent.
- [ ] La recupere en una peticio posterior.
- [ ] He creat una cookie pròpia no sensible.
- [ ] He llegit i observat la cookie.
- [ ] He llegit una dada de `$_SERVER` amb finalitat clara.
- [ ] He creat o usat una ruta base comuna per als includes.
- [ ] He importat almenys un fitxer compartit des d'eixa base.
- [ ] Puc explicar què queda en client i servidor.
- [ ] He implementat invalidacio.
- [ ] He documentat com provar-ho.

## Connexio amb R2M5

`R2M5` aprofitarà la idea d'estat per construir autenticacio funcional i protegir una operacio real. La pregunta de pas és:

Quina operacio del teu projecte necessita saber qui està actuant o si pot continuar?

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT04. Sessió, cookies i estat](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT04-Sessio-cookies-i-estat.pdf)
- **Teoria o material associat**: [Estat, sessió i cookies](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-Estat-sessio-i-cookies.pdf)

## Microtaller associat

- **Microtaller**: `MT04. Sessió, cookies i estat`
- **Moment recomanat**: abans de decidir què queda en sessió, cookie o persistència.
- **Evidència mínima**: decisió documentada sobre què es guarda, on es guarda i durant quant de temps.
