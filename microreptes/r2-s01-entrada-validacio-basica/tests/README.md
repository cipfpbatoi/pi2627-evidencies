# Tests del microrepte

Estratègia de comprovació manual:

- obrir el formulari o entrada equivalent;
- enviar un cas incorrecte documentat;
- comprovar que el servidor mostra un error visible;
- enviar un cas corregit;
- comprovar que la resposta correcta es genera;
- revisar el fragment que llig `$_POST` o equivalent;
- enviar un valor manipulat fora del catàleg permés i comprovar que el servidor
  el rebutja;
- enviar text amb marques HTML i comprovar que apareix com a text inert;
- revisar que els camps absents no provoquen avisos ni continuen com a vàlids;
- comprovar que no hi ha bolcats de petició o dades sensibles accessibles;
- revisar la condició simple que genera l'error;
- preguntar a l'alumne què passa si el checkbox no està marcat.

No cal executar proves sobre arrays d'errors, fitxers, checkbox múltiple,
autenticació o CSRF en esta sessió. CSRF serà exigible quan el flux canvie estat
o depenga d'una sessió autenticada.
