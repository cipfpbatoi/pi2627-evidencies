# Estratègia de comprovació

Comprovacions recomanades:

1. Executar `POST /api/login` amb credencials correctes.
2. Revisar que retorna `JSON`, `200` i token o mecanisme equivalent.
3. Executar `POST /api/login` amb credencials incorrectes.
4. Revisar que retorna `JSON` i `401`.
5. Executar la ruta protegida sense token.
6. Executar la ruta protegida amb token vàlid.
7. Comprovar que no es retornen contrasenyes ni hashes.
8. Revisar que el contracte documenta mètode, URL, entrada, headers i resposta.
