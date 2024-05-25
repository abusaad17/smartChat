#choose the proper node image.... https://hub.docker.com/
FROM node:18-alpine as BUILD_Image

WORKDIR /app/react-app

#copy package.json
COPY package.json .

#install all our dependencies
RUN npm install

#copy all our remaining files
COPY . .

#Finally build our project
RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "preview"]