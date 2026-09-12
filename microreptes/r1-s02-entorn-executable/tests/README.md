# Tests del microrepte

Estratègia de comprovació manual:

- executar o revisar `docker compose up` o ordre equivalent;
- obrir la URL del servei web documentada;
- comprovar que existeixen serveis per a `PHP`, servidor web, BBDD i phpMyAdmin quan corresponga;
- obrir phpMyAdmin o revisar que el servei està definit i accessible;
- obrir la URL de la landing documentada;
- comprovar que la landing ve del backend, té contingut propi del producte i no és només una maqueta estàtica oberta fora del servidor;
- revisar el `healthcheck` o endpoint d'estat només com a comprovació tècnica auxiliar, si existeix;
- seguir el `README` buscant passos ocults;
- revisar documentació, decisió tècnica, incidències i pendent de pas a R2;
- demanar a l'alumne què fa cada servei, quin fitxer respon a la petició i què ha adaptat respecte del model docent.

Si l'entorn no arranca, comprova que hi ha log d'error, hipòtesi de causa, canvi intentat i pròxima acció. Si no hi ha landing inicial servida pel backend, la sessió no acredita el tancament de R1.

Ampliació opcional del repte: declaració en `docs/r1-ampliacio.md`, amb referències a implementació i proves. Es revisa separadament en R1M2; el professorat valida 0–1 en la presentació. No altera la nota del microrepte.
