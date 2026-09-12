# Proves recomanades

La revisio pot triar qualsevol cas de la taula i demanar executar-lo.

Casos mínims:

- dades vàlides;
- dades invàlides;
- reintent;
- regla amb dos resultats;
- estat recuperat i invalidat;
- no autenticat;
- autenticat;
- logout i nou intent.

Prova automàtica mínima:

- una comanda `curl` documentada;
- o un script `.sh` en `tests/`;
- o un script PHP senzill;
- o una col·leccio de peticions documentada.

Exemples acceptables:

```bash
curl -i http://localhost:8000/protegida.php
```

```bash
curl -c cookies.txt -d "email=a@a.com&password=secret" http://localhost:8000/login.php
curl -b cookies.txt http://localhost:8000/protegida.php
```

No cal exigir `PHPUnit` ni proves unitàries en este microrepte.
