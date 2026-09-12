# Estratègia de prova recomanada

1. Intentar accedir a l'accio protegida sense autenticar.
2. Fer login amb usuari demo autoritzat.
3. Executar l'accio protegida i comprovar resultat.
4. Fer login amb usuari sense permís o rol inadequat, si n'hi ha.
5. Comprovar resposta denegada controlada.
6. Fer logout o invalidar sessio/token.
7. Reintentar l'accio protegida.
