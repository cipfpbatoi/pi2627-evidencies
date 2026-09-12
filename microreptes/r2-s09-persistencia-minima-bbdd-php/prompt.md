# R2M9. Persistència mínima amb BBDD en PHP

Revisa si el lliurament incorpora una persistència mínima real amb BBDD en `PHP` pur.

No valores com a obligatori cap `ORM`, framework, migration, seeder o arquitectura completa. El mínim és:

- una dada significativa del projecte;
- una taula o `schema.sql` reproduïble;
- configuració de connexió separada;
- cap secret real pujat al repositori;
- connexió amb `PDO` o equivalent justificat;
- una alta amb dades validades del flux;
- una lectura posterior;
- consultes preparades quan entren dades d'usuari;
- instruccions de reproducció;
- comprovació que el flux principal continua funcionant.

Quan revises, fixa't especialment en si l'alumne ha confós sessió, cookie, array o fitxer provisional amb BBDD. També has de comprovar que no concatena directament dades d'usuari dins de l'SQL.

Pregunta docent recomanada: quina dada sobreviu ara a tancar sessió o reiniciar el navegador, i on es veu la consulta preparada?

## Ampliació global del repte

Este és l'únic microrepte que recull la proposta d'ampliació del repte complet. Avalua el nucli sobre 10 sense sumar ni penalitzar l'ampliació en les dimensions o en ra_scores. Si el payload inclou repte_extension, completa la proposta separada segons els criteris adjunts, de 0 a 1 en passos de 0.25. L'absència d'ampliació dona una proposta 0, no una penalització del nucli. La proposta no és una validació docent. Indica evidències concretes i preguntes pendents per a la presentació; no inventes una defensa oral. No sumes punts al resultat final_score_over_10: el programa farà el càlcul global 0.9 × nucli ponderat + ampliació validada, una sola vegada.
