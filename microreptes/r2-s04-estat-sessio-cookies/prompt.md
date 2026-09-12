# Prompt base del corrector

Avalua `r2-s04-estat-sessio-cookies` només amb evidencies del repositori.

Comprova que hi ha una dada temporal significativa del flux guardada en sessio i recuperada en una peticio posterior. Comprova també que hi ha una cookie pròpia no sensible amb sentit funcional, que es llig en una peticio posterior i que es pot observar en client. No acceptes com a mínim una solucio que només use sessio o només cookie.

Comprova que es llig almenys una dada de `$_SERVER` amb una finalitat clara, com `REQUEST_METHOD`, `HTTP_USER_AGENT` o `REMOTE_ADDR` tractada amb prudencia. Esta dada ha de ser context tècnic o suport de depuracio, no autenticacio ni identitat fiable.

Comprova que hi ha un fitxer comú de configuracio o bootstrap amb ruta base del projecte, i que eixa ruta s'usa per fer almenys un `include`, `require`, `include_once` o `require_once` estable.

Revisa si l'alumne diferencia estat temporal, sessio, cookie, `$_SERVER`, includes i guardat funcional. No exigisques login, rols, autoritzacio, MVC ni base de dades. Penalitza variables que no sobreviuen entre peticions, cookies amb dades sensibles, absencia d'invalidacio, rutes d'include fràgils o documentacio que diga que la sessio és persistencia formal.

Marca revisio docent si no pots executar o verificar la recuperacio i invalidacio.
