# Prompt base del corrector

Avalua la sessió d'autocorrecció `r1-s02-entorn-executable` només amb les evidències disponibles al repositori de l'alumne.

Esta autocorrecció correspon a la sessió `R1-S02` i al microrepte `R1M2` del `Repte 1`: entorn executable, landing inicial servida pel backend, documentació tècnica, verificació i checkpoint de pas a R2.

Comprova si el repositori inclou una base tècnica adaptada al producte:

- `docker-compose.yml`, `compose.yaml` o configuració equivalent;
- servei web i execució de `PHP`;
- servei de base de dades i phpMyAdmin, o justificació si encara no s'ha pogut completar;
- `README` amb requisits, arrencada, parada, ports, URL i comprovacions;
- prova d'arrencada, captura, log o error documentat amb hipòtesi de causa;
- issue mare, microtasques, commits o registre d'incidències;
- explicació de què s'ha adaptat respecte del model docent.

Comprova també si hi ha una landing inicial del producte servida pel backend:

- ruta `/` o URL equivalent amb landing inicial del producte;
- HTML i CSS senzill adaptat al producte;
- `/health`, `/estat` o endpoint bàsic només com a comprovació tècnica auxiliar, si n'hi ha;
- relació amb el producte: nom, propòsit, estat inicial o pròxim flux;
- prova visible en execució local, captura, log o URL documentada;
- commit o canvi localitzable;
- explicació del flux de petició, execució en servidor i resposta.

Comprova finalment si el repte queda tancat i defensable:

- documentació dins del repositori;
- fitxa de `R1M1`, decisió tècnica, incidències i comprovacions incorporades al repo;
- índex, apartat d'`README.md` o pàgina visible que permeta localitzar eixa documentació;
- justificació tècnica curta o nota tècnica de decisió inicial;
- evidència de verificació de l'entorn i de la landing;
- AI log quan hi haja ús rellevant d'IA;
- pendent o primer pas previst cap a R2.

No penalitzes que encara no hi haja formularis, validació, sessió, login o persistència rica: això pertany a reptes posteriors o ampliacions. Sí que has de penalitzar que siga només un `healthcheck`, decoració estàtica oberta fora del servidor, una pàgina genèrica sense relació amb el producte, que no es puga provar, que la documentació no corresponga amb el sistema real o que l'entorn siga una còpia plana no explicable.

Sigues prudent: si no pots verificar un punt, no l'assumisques com a correcte. Marca revisió docent si la confiança és baixa, si falta evidència crítica o si apareixen flags.

## Ampliació global del repte

Este és l'únic microrepte que recull la proposta d'ampliació del repte complet. Avalua el nucli sobre 10 sense sumar ni penalitzar l'ampliació en les dimensions o en ra_scores. Si el payload inclou repte_extension, completa la proposta separada segons els criteris adjunts, de 0 a 1 en passos de 0.25. L'absència d'ampliació dona una proposta 0, no una penalització del nucli. La proposta no és una validació docent. Indica evidències concretes i preguntes pendents per a la presentació; no inventes una defensa oral. No sumes punts al resultat final_score_over_10: el programa farà el càlcul global 0.9 × nucli ponderat + ampliació validada, una sola vegada.
