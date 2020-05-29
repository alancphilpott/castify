# Introduction

A backend Movie Rental Service built with Node.js, the Express Web Framework and Mongoose Object Modelling Tool.

# Setup
These steps explain how to get the application running on a local machine.

## Install MongoDB
Download and install the latest version of MongoDB from https://docs.mongodb.com/manual/administration/install-community/.
Once installed, ensure the service is running on your system.

## Install Dependencies
Navigate to the project directory and run the following command.
```
npm i
```

## Run Tests
Ensure everything is working correctly.
```
npm test
```

## Start Server
Now run the application.
```
node index.js
```

This will start the application on port number 3000.
To change this, navigate to **config/default.json**.

Use http://localhost:3000/api/movies to confirm app is running.

## Env Vars
When a user is created/logs in, a key is used to encrypt JSON Web Tokens.
This key is called **jwtPrivateKey** and can be found in **config/default.json**.
Below shows how to set this env var to a default value.

Windows
```
set vidly_jwtPrivateKey=yourSecretKey
```

Mac
```
export vidly_jwtPrivateKey=yourSecretKey
```