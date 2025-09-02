# blueprint-bacaro-architecture
La **Bacaro CLI** è uno strumento sviluppato in **Node.js** che permette di generare in modo rapido e automatizzato una struttura completa di progetto **full-stack**, pronta all’uso.  

L’obiettivo è semplificare la creazione di ambienti di sviluppo moderni, fornendo un template base personalizzabile sia lato **frontend** che **backend**, con il supporto al **database** e al **docker-compose**(wip).

## ✅ Prerequisiti
- **Node.js** `>= 18`
- **TypeScript** installato globalmente:
  ```bash
  npm install -g typescript

## 🏗️ Componenti Architetturali

Frontend:

    Angular 15 ✔️

Librerie grafiche:

    Bootstrap ✔️

Backend:

    Node.js + Express + Nodemon ✔️

Database:

    PostgreSQL ✔️
    MongoDB ✔️

Contenitori:

    Docker Compose (wip)

⚙️ Compilazione

- Posizionarsi nella cartella src
- Eseguire: tsc
- Copiare il file .env all’interno della cartella dist generata.

▶️ Avvio

- Entrare nella cartella dist
- Eseguire: node bacaro-cli.js

🐞 Errori Possibili
Se Bootstrap non funziona, provare ad eseguire:
npm config set legacy-peer-deps true
e rilanciare il comando di esecuzione della CLI.
