# R5S2. Connexió amb la font externa i recuperació real

## Finalitat de la sessió

Esta sessió treballa el microrepte `R5M2`. L'objectiu és implementar una connexió funcional amb la font externa triada i demostrar que el projecte recupera una resposta real, controlant almenys un cas d'error.

Al final de la sessió, l'alumnat ha de tindre un connector, client HTTP, consulta, webhook o mecanisme equivalent que es puga executar i explicar.

## Encaix dins del Repte 5

- **Repte**: `R5. Integració híbrida i tancament`
- **Microrepte**: `R5M2`
- **Sessió**: `R5S2`
- **Duració orientativa**: `3 hores`
- **Focus**: connexió real, configuració, resposta externa, error controlat i evidència de recuperació
- **No entra encara**: mapping complet, integració final en pantalla o defensa completa

## Relació amb RA i criteris de treball

| Element | Concreció en el microrepte |
|---|---|
| `RA9.c` | accés funcional a una font externa |
| `RA9.f` | control bàsic d'errors o respostes inesperades |
| `RA7.d` | petició a servei web si la font és API |
| `RA7.e` | interpretació de resposta i codis si la font és API |
| Evidència central | connector executable amb cas positiu i cas d'error |
| Verificació docent | execució guiada i explicació de què pertany a la font externa |

## Producte esperat

Una primera connexió funcional que incloga:

- codi separat per al connector o client;
- configuració mínima sense secrets exposats;
- execució del cas positiu;
- captura, log o registre de la resposta real;
- tractament d'error bàsic;
- nota breu sobre com repetir la prova.

## Preparació prèvia del professorat

- Revisar que les fonts validades en `R5S1` siguen accessibles.
- Preparar recordatori sobre `.env`, claus, tokens i secrets.
- Portar exemple de resposta correcta i resposta d'error.
- Definir què es considera connexió real i què només és simulació.

## Seqüència d'aula de 3 hores

Aplicar el [protocol de retorn i consolidació](retorn_i_consolidacio_microreptes.md). Els blocs següents ja incorporen la consolidació dins de les tres hores: prioritzar mínims i proves, i reajustar el treball nou si persistixen bloquejos del grup.

### 0:00-0:15. Retorn i explicació dels errors anteriors

Revisar les evidències i els dubtes del punt de partida, explicar dos o tres errors comuns amb un exemple breu i fer predir el resultat. No donar per assolit el microrepte anterior pel fet d’haver canviat de sessió.

### 0:15-0:30. Correcció guiada o consolidació

Qui té un pendent aplica una correcció concreta i torna a provar-la amb ajuda. Qui ja ha assolit el mínim comprova variants o millora les proves. Si falta treball, començar per la peça mínima necessària; si falta comprensió, modificar i explicar un exemple.

### 0:30-0:35. Comprovació de la base per continuar

Demanar una execució, modificació o explicació curta de la peça necessària per al treball de hui. Si el bloqueig continua, acordar ajuda durant el treball guiat i comprovar la comprensió en l’obertura següent. És consolidació per continuar, no recuperació ni recorrecció del microrepte.

### 0:35-0:50. Relectura del mapa d'integració

Cada equip recupera la font triada i identifica la primera petició o acció mínima executable.

### 0:50-1:10. Modelatge del connector mínim

El professorat mostra una peça separada que encapsula la connexió, llig configuració i retorna un resultat controlat.

### 1:10-1:45. Implementació de la connexió positiva

L'alumnat implementa la crida o mecanisme d'accés i registra la resposta real.

### 1:45-2:15. Error controlat

Es provoca una errada assumible: URL incorrecta, paràmetre invàlid, clau absent, resposta buida o servei no disponible.

### 2:15-2:35. Evidència reproduïble

Es documenta com executar la connexió i quin resultat s'espera.

### 2:35-2:50. Checkpoint docent

El professorat comprova una execució real i fa una pregunta sobre la frontera entre sistema propi i font externa.

### 2:50-3:00. Diagnòstic individual i següent pas

Amb les evidències observades durant la sessió, comprovar què funciona i què entén cada alumne. Registrar la base que domina, la dificultat i l’ajuda necessària per continuar. Reprendre els dubtes en l’obertura següent com a consolidació, sense reentrega ni recorrecció del microrepte. La recuperació, si cal, es planteja sobre el repte complet en el seu tancament. No cal fer totes les demos completes en estos deu minuts.

## Tasques concretes de l'alumnat

- Crear o adaptar el connector.
- Afegir configuració mínima i segura.
- Executar la connexió positiva.
- Registrar la resposta real.
- Implementar o simular un error controlat.
- Documentar com repetir la prova.

## Evidències mínimes

| Evidència | Mínim acceptable |
|---|---|
| Connector | codi localitzable i separat del flux principal |
| Configuració | no exposa secrets reals |
| Cas positiu | recupera resposta real o verificable |
| Cas d'error | no trenca l'aplicació sense control |
| Registre | mostra què s'ha rebut i com repetir-ho |

## Criteris d'èxit

- La connexió és executable.
- Hi ha diferència clara entre resposta externa i dades pròpies.
- L'error està controlat mínimament.
- El connector no està dispers per tota l'aplicació.

## Què no és suficient

- Copiar una resposta fixa i presentar-la com a connexió.
- Posar tokens o claus privades al repositori.
- Fer una crida que només funciona en la màquina d'una persona.
- No registrar cap prova d'error.

## Ús de la IA

La IA pot ajudar a interpretar documentació o generar un primer client, però cal revisar dependències, secrets, errors i resposta real. Si la IA proposa codi, l'alumnat ha d'explicar cada paràmetre rellevant.

## Suport i ampliació

Per a suport, usar una font pública sense autenticació o reduir la connexió a una consulta concreta. Com ampliació, afegir timeout, retry, cache simple o adaptador per a dues fonts compatibles.

## Checklist de tancament

- [ ] Connector o client localitzable.
- [ ] Configuració segura.
- [ ] Cas positiu executat.
- [ ] Resposta real registrada.
- [ ] Cas d'error controlat.
- [ ] Instruccions mínimes de reproducció.

## Connexió amb el microrepte posterior

`R5M3` transformarà la resposta externa perquè tinga sentit dins del domini del projecte. Sense una resposta real i estable, el mapping serà fictici.

## Materials associats per a portar a l'aula

- **Presentació associada**: [MT13. Secrets, .env i claus](https://cipfpbatoi.github.io/dwes2627/recursos/Tallers/MT13-Secrets-env-i-claus.pdf)
- **Teoria o material associat**: [Integració externa i flux híbrid](https://cipfpbatoi.github.io/dwes2627/recursos/Teoria/Teoria-R5-Integracio-externa-i-flux-hibrid.pdf)

## Microtaller associat

- **Microtaller**: `MT13. Secrets, .env i claus`
- **Moment recomanat**: abans de provar la connexió amb serveis externs o credencials.
- **Evidència mínima**: `.env.example`, `.gitignore` revisat i prova de configuració sense secrets al repositori.
