# HOW TO USE
## 1. To clone the project
```
$ git clone git@github.com:KevinH2810/PortofolioDapp.git
```

## 2. Install dependencies
```
$ npm i
```

## 3. CSV file
due to the size of the csv file, please download the transactions and place the [transactions.csv](https://gist.github.com/liangzan/4436cb8b083c66b3517e7f4d80939f06#:~:text=logged%20in%20a-,CSV%20file,-.%20Write%20a%20command) file in `./files` to allows the code to import the csv to sqlite.

## 4. env file
Rename the file `.env.example` to `.env` and fill out the necessary data
(Note: make sure field `CRYPTO_COMPARE_KEY` is filled with your cryptocompare api key)

# HOW TO USAGE

## Firstly init the database setup run command 
```
$ npm start
```
it will run the prisma command to create the database and also populate the database with transactions data

## To use the cli command
```
$ node index.js portofolio -d <date format. ex: 2018-10-02> -t <token symbol. ex: BTC, ETH, XRP>
```
example command : 
```
$ node index.js portofolio -d 2018-10-10 -t BTC
```
