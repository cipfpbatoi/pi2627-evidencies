# Evidències esperades

Evidències mínimes:

- formulari o entrada equivalent amb text, llista/opció tancada i checkbox simple;
- recepció de dades en `PHP` amb `$_POST` o mecanisme equivalent;
- lectura defensiva dels camps que poden no arribar;
- opció tancada validada en servidor contra una llista permesa;
- dada de l'usuari escapada abans de mostrar-la en HTML;
- absència de bolcats de petició i dades sensibles exposades;
- observació del checkbox quan està marcat i quan no està marcat;
- una validació bàsica de servidor amb `if/else` o equivalent;
- un missatge d'error visible per a un cas incorrecte;
- reenviament corregit amb resposta correcta;
- nota al `README`, issue o registre indicant com provar el cas correcte i un error;
- commit o traçabilitat del canvi.

Casos de seguretat mínims:

- enviar un valor manipulat que no existix en l'opció tancada i comprovar que el
  servidor el rebutja;
- enviar text amb marques HTML i comprovar que es mostra com a text inert;
- confirmar que no queden `var_dump`, `print_r`, contrasenyes ni tokens visibles.

Queden fora del mínim:

- arrays d'errors;
- checkbox múltiple;
- conservació completa de valors;
- fitxers;
- validació acumulada de tots els controls;
- estat, sessió, login o persistència.
- protecció CSRF mentre el flux de `R2M1` encara no guarde estat ni depenga
  d'una sessió autenticada.
