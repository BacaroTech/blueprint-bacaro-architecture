# blueprint-bacaro-architecture

prerequisiti
- node 18 >
- npm install -g typescript 

componenti archietturali
- fe: angular 15 ok + libreria grafica: 
    - tailwind ko
    - boostrap ok
- be: 
    node express + nodemon ok
    java spring-boot ko
- db: 
    - postgres ok
    - mongo ok
- docker-compose generale 1/2

compilazione:
- mettersi sulla carta src e dare il comando tsc
- copiare il file .env all'interno della cartella dist generata prima

avvio:
- recarsi sulla cartella dist
- eseguire node bacaro-cli.js

errori:
- se bootstrap non va provare ad eseguire: npm config set legacy-peer-deps true e ridare il comando di esecuzione della CLI