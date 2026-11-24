# natale-leo

Lista dei desideri di Natale della famiglia, da mandare ai parenti su WhatsApp. Pubblicata con GitHub Pages dalla radice del ramo `main`: `https://mauriziotarsia-dev.github.io/natale-leo/`. Creata il 24 novembre 2026.

## Come è fatta

- `index.html` è tutta l'app: stile e script dentro la pagina, niente build e niente dipendenze.
- `foto/` contiene le foto dei regali del volantino, con un pezzo di hash nel nome: un file cambiato va salvato con un nome nuovo, così i telefoni non tengono la versione vecchia.
- `og.jpg` è l'anteprima che WhatsApp mostra sotto il link; `icona.png` è l'icona per la Home.
- `leo.html` è l'ingresso del gioco di Leo: aperta in Safari spiega come aggiungerla alla Home (icona `icona-leo.png`); aperta dalla Home va subito a `index.html#leo`.
- `lib/zxing-0.23.0.min.js` (con `lib/zxing-LICENSE.txt`, Apache 2.0) legge i codici a barre dalle foto; si carica solo quando serve.

## Funzioni

- **Categorie** (`categoria` nel database, anche più di una separate da virgola): dinosauri, veicoli, playset, costruzioni, giochi, musica, creativita, peluche, vestiti, altro. Tabella `CATEGORIE` in `index.html`. Filtri nella lista dei parenti, nel gioco e nella classifica.
- **Gioco «quale preferisci»** (area genitori, scheda «Gioco con Leo», oppure `#leo`): due regali per volta, Leo tocca quello che preferisce; partite da 12 scelte; ogni 6 scelte torna una coppia già vista a lati invertiti. Le scelte stanno nella tabella privata `natale.confronti` (funzioni `natale_g_confronti*`, con il codice dei genitori) e in una coda sul telefono se la rete manca. Classifica con Bradley-Terry pesato: una scelta vale la metà dopo 14 giorni (`EMIVITA_GIORNI`).
- **Regali nuovi**: un regalo con meno di 3 confronti, quando il resto ne ha almeno 3, è «nuovo»; la figura 🆕 nel gioco lo mette contro regali già in classifica di forza simile, così bastano circa 4 scelte per piazzarlo.
- **Aggiunta regali** dall'area genitori: da foto, da nota o da codice a barre (il numero diventa una ricerca Amazon, `link_stato` `ricerca`).
- In modalità Leo la lista non si vede; senza codice salvato sul telefono si passa dal login dei genitori e poi si torna al gioco. Sulla Home di iPhone il salvataggio è separato da quello di Safari, quindi il codice va inserito anche lì.

## Dati

- Regali, prenotazioni, altri regali, proposte e impostazioni stanno nel progetto Supabase `natale-leo` (ref `smglmkaykgomgehfarqh`), nello schema privato `natale`. Lo schema non è esposto: la pagina passa solo dalle funzioni RPC `natale_*` (SECURITY DEFINER, `search_path` vuoto), che controllano il token del dispositivo o il codice dei genitori.
- La pagina contiene solo l'indirizzo del progetto e la chiave pubblicabile. Il repository è pubblico: niente nomi, messaggi o altri dati della famiglia nei file o nei commit. Titolo, nome del bambino e testi stanno nel database.
- I parenti si riconoscono con nome e un token casuale salvato sul telefono (`natale.token`, `natale.nome` in localStorage); nel database c'è solo l'hash del token.
- L'area genitori è `#genitori` e chiede il codice dei genitori (bcrypt nel database, cambiabile dalle impostazioni dell'area). Il codice non sta nel repository. Dopo 25 tentativi sbagliati in 10 minuti le richieste vengono rifiutate.
- Un progetto Supabase gratuito va in pausa dopo circa una settimana senza richieste: se la pagina smette di caricare i regali, va riattivato dalla dashboard di Supabase.

## Commit

Autore: l'indirizzo noreply di GitHub del genitore, mai la sua email personale.
