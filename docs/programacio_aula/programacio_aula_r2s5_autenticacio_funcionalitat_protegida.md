# R2S5. Autenticacio i funcionalitat protegida

## Finalitat de la sessio

Esta sessio connecta l'estat de `R2M4` amb una necessitat real del producte: una operacio que no pot executar qualsevol visitant. L'objectiu no és crear una pantalla de login decorativa, sinó demostrar identificacio, registre mínim, autenticacio i una restriccio funcional sobre una accio del domini.

En esta sessio ja no és suficient tindre credencials escrites en clar dins d'una condicio. El mínim demana veure un registre o alta d'usuari controlada, encara que siga simple, i guardar la contrasenya amb hash en un array, fitxer o estructura equivalent del projecte. El login ha de verificar eixe hash amb `password_verify` o mecanisme equivalent.

Al final de la sessio, l'alumnat ha de poder mostrar un cas permés i un cas denegat, i assenyalar exactament on el servidor pren la decisio.

## Encaix dins del Repte 2

- **Repte**: `R2. Processament bàsic, estat, autenticació i primera funcionalitat protegida`
- **Microrepte**: `R2M5`
- **Sessio**: `R2S5`
- **Duracio orientativa**: `3 hores`
- **Focus**: registre mínim, contrasenya amb hash, login, sessio autenticada, operacio protegida, cas autoritzat i cas denegat
- **No entra encara**: sistema complet de rols, recuperacio de contrasenya, registre públic complet, OAuth, JWT o arquitectura completa

## Relacio amb RA i criteris de treball

| Element | Concrecio en el microrepte |
|---|---|
| `RA4.d` | registre i autenticacio funcional mínima amb contrasenya hashejada |
| `RA4.e` | restriccio d'accés a una operacio real |
| Evidencia central | operacio protegida amb cas permés i denegat |
| Verificacio docent | execucio directa de la ruta o accio protegida i pregunta sobre el punt de control |

## Producte esperat

Una evolucio del flux que incloga:

- formulari o mecanisme de registre mínim;
- guardat de l'usuari en array, fitxer o estructura equivalent;
- contrasenya guardada amb hash, per exemple `password_hash`;
- formulari o mecanisme de login;
- comprovacio de credencials amb `password_verify` o mecanisme equivalent;
- guardat d'usuari autenticat en sessio o equivalent;
- logout o invalidacio;
- una operacio real del domini protegida;
- cas no autenticat denegat;
- cas autenticat permés;
- cas autenticat però no autoritzat si el projecte ja té rol, propietat o restriccio simple;
- documentacio d'usuaris de prova, forma de registre i casos.

## Preparacio previa del professorat

Convé preparar:

- exemple mínim de registre amb `password_hash`;
- exemple d'array d'usuaris amb contrasenyes hashejades;
- exemple de login amb `password_verify`;
- esquema identificacio -> autenticacio -> autoritzacio;
- exemple de proteccio al servidor abans d'executar l'operacio;
- pauta per triar una operacio real, no una pàgina buida;
- recordatori que no s'han de guardar contrasenyes en clar ni tan sols en esta versio mínima.

## Seqüencia d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:55. Marc conceptual

Diferenciar:

- identificacio: l'usuari diu qui és;
- registre: el sistema crea o prepara una identitat amb credencial hashejada;
- autenticacio: el sistema ho comprova;
- autoritzacio: el sistema decideix què pot fer;
- operacio protegida: accio real del producte sotmesa a restriccio.

Resultat: cada equip tria una operacio a protegir.

### 0:55-1:15. Modelatge docent

Mostrar:

- formulari de login;
- formulari de registre o alta mínima;
- guardat de hash en array, fitxer o estructura equivalent;
- comprovacio de credencials amb `password_verify`;
- sessio autenticada;
- proteccio d'una operacio;
- resposta denegada;
- logout.

Resultat: queda clar que el control ha d'estar en servidor.

### 1:15-1:40. Registre i guardat de credencial segura

Tasques:

- crear o adaptar registre;
- validar mínimament usuari i contrasenya;
- generar hash de la contrasenya;
- guardar usuari i hash en array, fitxer o estructura equivalent;
- comprovar que la contrasenya no queda en clar.

Resultat: hi ha una credencial de prova guardada amb hash.

### 1:40-2:00. Implementacio d'autenticacio

Tasques:

- crear o adaptar login;
- recuperar usuari registrat o de prova;
- comprovar credencials amb `password_verify` o equivalent;
- guardar usuari autenticat;
- mostrar error si fallen;
- implementar logout o invalidacio.

Resultat: hi ha sessio autenticada comprovable.

### 2:00-2:25. Proteccio d'una operacio real

Tasques:

- triar una accio del domini ja existent;
- impedir-la sense autenticacio;
- aplicar restriccio simple si hi ha rol o propietat;
- comprovar que no es pot saltar cridant directament la URL.

Resultat: l'operacio queda protegida al servidor.

### 2:25-2:40. Prova de casos

Casos mínims:

- registre o alta amb hash;
- usuari no autenticat intenta l'operacio;
- usuari autenticat executa l'operacio;
- credencial incorrecta rebutjada;
- logout i nou intent;
- usuari no autoritzat si aplica.

Resultat: hi ha cas permés i denegat reproduïbles.

### 2:40-2:50. Checkpoint docent

Cada equip mostra:

- login;
- registre o estructura d'usuaris amb hash;
- verificacio amb `password_verify` o equivalent;
- sessio activa;
- operacio protegida;
- cas permés;
- cas denegat;
- codi on es comprova la restriccio.

Pregunta: on es crea o guarda el hash de la contrasenya, on es verifica i quina operacio real queda protegida?

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Implementar registre o alta mínima.
- Guardar usuari i contrasenya hashejada en array, fitxer o estructura equivalent.
- Implementar login mínim.
- Comprovar credencials amb verificacio de hash.
- Guardar usuari autenticat.
- Protegir una operacio real.
- Provar accés permés, denegat i logout.
- Documentar usuaris de prova i casos.

## Evidencies minimes

| Evidencia | Minim acceptable |
|---|---|
| Registre | alta mínima o estructura d'usuaris creada pel projecte |
| Hash | contrasenya guardada amb `password_hash` o equivalent |
| Login | formulari o mecanisme funcional |
| Autenticacio | credencials comprovades en servidor amb verificacio de hash |
| Sessio | usuari autenticat recuperable |
| Operacio protegida | accio real del domini |
| Denegacio | cas no autenticat bloquejat |
| Permís | cas autenticat permés |
| Documentacio | usuaris de prova i passos |

## Criteris d'exit

- El login no és només visual.
- Hi ha registre o estructura d'usuari amb hash.
- No es guarda la contrasenya en clar.
- La comprovacio usa `password_verify` o equivalent.
- La proteccio està en servidor.
- L'operacio protegida té valor dins del projecte.
- Hi ha cas permés i denegat.
- Logout o invalidacio funciona.
- L'alumnat diferencia autenticacio i autoritzacio.

## Que no és suficient

- Protegir només una pàgina buida.
- Guardar contrasenyes en clar.
- Comparar directament la contrasenya escrita amb un literal.
- Simular registre però no guardar cap hash ni estructura d'usuari.
- Ocultar un botó però deixar l'operacio executable.
- Fer login sense sessio o estat autenticat.
- No provar accés directe a la ruta.
- Confondre usuari autenticat amb usuari autoritzat.

## Us de la IA

La IA pot ajudar a revisar diferències conceptuals, recordar `password_hash` / `password_verify` o detectar punts d'accés no protegits. Control: l'alumnat ha de fer una demo sense IA de registre, login correcte, login incorrecte, cas no autenticat, cas autenticat permés i logout.

## Suport per alumnat amb més dificultat

Usar un únic usuari de prova guardat en un array amb hash i una única operacio protegida. No afegir rols fins que registre/hash/login/logout funcionen.

## Ampliacio per alumnat avançat

- Restriccio per rol o propietari.
- Persistir usuaris en fitxer de manera controlada si el projecte ho permet.
- Missatges diferenciats d'autenticacio i autoritzacio.
- Proves manuals documentades amb més precisio.

## Checklist de tancament

- [ ] Tinc registre o estructura d'usuari.
- [ ] Guarde la contrasenya amb hash.
- [ ] Tinc login funcional.
- [ ] Comprove credencials en servidor amb verificacio de hash.
- [ ] Guarde usuari autenticat.
- [ ] He triat una operacio real.
- [ ] La bloquege sense autenticacio.
- [ ] La permeta amb autenticacio vàlida.
- [ ] He provat logout.
- [ ] He documentat usuaris i casos.

## Connexio amb R2M6

`R2M6` convertirà el flux complet en una bateria mínima de proves. La pregunta de pas és:

Quins casos demostren que el flux no és una demo puntual?

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT05. Auth mínima defensable](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT05-Auth-minima-defensable.pdf)
- **Teoria o material associat**: [Autenticació, autorització i operació protegida](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R2-Autenticacio-autoritzacio-i-operacio-protegida.pdf)

## Microtaller associat

- **Microtaller**: `MT05. Auth mínima defensable`
- **Moment recomanat**: quan ja existeix login o identificació i cal protegir una operació real.
- **Evidència mínima**: cas permés, cas denegat i punt del codi on es comprova l'accés.
