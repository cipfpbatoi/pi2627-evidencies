# Proves recomanades

1. Executar el flux i guardar una dada significativa en sessio.
2. Crear o actualitzar una cookie pròpia no sensible.
3. Fer una peticio posterior i comprovar que la sessio i la cookie es recuperen.
4. Inspeccionar la cookie en el navegador o eina equivalent.
5. Revisar la dada de `$_SERVER` usada i la seua finalitat.
6. Revisar el fitxer de configuracio/bootstrap amb ruta base.
7. Comprovar que almenys un `include` o `require` usa eixa ruta base.
8. Executar l'accio d'invalidacio.
9. Repetir la peticio posterior i comprovar que les dades temporals ja no s'apliquen.
