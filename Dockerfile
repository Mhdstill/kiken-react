# Définit l'image de base à utiliser
FROM node:16-alpine

# Définit le répertoire de travail dans l'image Docker
WORKDIR /app

# Copie package.json
COPY ./app/package*.json /app/

# Installe les dépendances de l'application
RUN npm install

# Construit l'application React.js pour la production
#RUN npm run build

# Expose le port 80 pour que l'application soit accessible depuis l'extérieur du conteneur
EXPOSE 3000

# Lance l'application une fois le conteneur démarré
CMD ["npm", "start"]