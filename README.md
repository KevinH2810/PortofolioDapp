# HOW TO USE
## 1. To clone the project
```
$ git clone git@github.com:KevinH2810/PortofolioDapp.git
```

## 2. Install dependencies
```
$ npm i
```

then rename the file .env.example to .env and fill out the necessary data
(Note: make sure field CRYPTO_COMPARE_KEY is filled with your cryptocompare api key)

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


# Designs Reasons
1. the usage of [commander](https://www.npmjs.com/package/commander#declaring-program-variable) library is because the ease of use of the library for generating cli command   s. The command can be generated per file but based on the scope of the task, i put all of the commands in one file for ease of use

2. separating the services per module for easier maintenance and reuse of modules whenever its needed. 

3. the database from csv is moved to sqlite, for easier data access, if its still placed in csv file, it will be taking quite some time just to query the data from csv file. when moving from csv to sqlite, i separate the csv into 4 chunks of file for faster import to database. although when moving the database i'm using `createReadStream` method to access the csv file which makes the nodejs read the lines one by one, by far its the most reliable way to transform the data into smaller format

# Task Description
# NO FILTER
## Given no parameters, return the latest portfolio value per token in USD
command to test : 
### sample command & format 
```
$ node index.js portofolio
```

### sample result
```
(i) Portofolio -  {
  BTC: {
    token: 'BTC',
    amount: 1200425.1521680313,
    balance: 29752165264.68748
  },
  ETH: {
    token: 'ETH',
    amount: 901704.2831249118,
    balance: 1538289472.9254372
  },
  XRP: { token: 'XRP', amount: 903332.98137308, balance: 357448.8607293278 }
}
```
----------------------------------------------------------------
# TOKEN
## Given a token, return the latest portfolio value for that token in USD
### format 
```
$ node index.js portofolio -t <token symbol>
```
or
```
$ node index.js portofolio --token <token symbol>
```
### sample command : 
```
$ node index.js portofolio -t ETH
```
### sample result :
```
(i) Portofolio -  {
  ETH: {
    token: 'ETH',
    amount: 901704.2831249118,
    balance: 1536954950.5864122
  }
}
```
----------------------------------------------------------------
# DATE
## Given a date, return the portfolio value per token in USD on that date (24 hour)
### format 
```
$ node index.js portofolio -d <date yyyy-mm-dd>
```
or
```
node index.js portofolio --date <date yyyy-mm-dd>
```
### sample command
```
$ node index.js portofolio --date 2018-10-04
```

### sample result
```
(i) Portofolio -  {
  BTC: {
    token: 'BTC',
    amount: 9.531808000000005,
    balance: 236098.88080064015
  },
  ETH: {
    token: 'ETH',
    amount: 2.4294280000000015,
    balance: 4143.851045320002
  },
  XRP: {
    token: 'XRP',
    amount: -0.6131580000000012,
    balance: -0.24268793640000047
  }
}
```
----------------------------------------------------------------
# DATE & TOKEN
## Given a date and a token, return the portfolio value of that token in USD on that date
### format 
```
node index.js portofolio -d <date. yyyy-mm-dd> -t <token symbol>
```
or
```
node index.js portofolio --date <date. yyyy-mm-dd> -t <token symbol>
```
or
```
node index.js portofolio -d <date. yyyy-mm-dd> --token <token symbol>
```
or
```
node index.js portofolio --date <date. yyyy-mm-dd> --token <token symbol>
```
### sample command
```
$ node index.js portofolio --date 2019-03-04 --token XRP
```

### sample result 
```
(i) Portofolio -  {
  XRP: {
    token: 'XRP',
    amount: 40.631238999999994,
    balance: 16.085907520099997
  }
}
```