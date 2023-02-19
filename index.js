const { Command } = require("commander");
const {
	getTransaction,
	getTransactionPortofolio,
} = require("./services/transaction");
const {
	createSQLiteTable,
	readAndSplitCSV,
	importCSVToSQLite,
} = require("./services/csv");
const { getRateBySymbols } = require("./services/cryptocompare");

const program = new Command();

program
	.command("initData")
	.description("To populate transaction date to sqlite if no data exists")
	.action(async () => {
		//check if transaction already populated and exists in database
		const { transaction } = await getTransaction();
		if (transaction !== null && transaction !== undefined) {
			console.log("Transaction table has been populated");
			return;
		}

		// populate Transaction Table
		await createSQLiteTable().then(() => {
			readAndSplitCSV().then(() => {
				importCSVToSQLite().then(() => {
					console.log("(i) done importing csv data to sqlite");
				});
			});
		});
	});

program
	.command("portofolio")
	.description("to get the portofolio data")
	.option("-d, --date <date>", "date of the transaction")
	.option("-t, --token <token>", "name of the token")
	.action(async (str, options) => {
		const queryBody = {};
		if (str.date) {
			const date = new Date(str.date);
			const seconds = date.getTime() / 1000; //1440516958
			queryBody.timestamp = seconds;
		}
		if (str.token) queryBody.token = str.token.toUpperCase().substring(0, 4);

		const transactionData = await getTransactionPortofolio(queryBody);

		const tokenSymbolsArray = transactionData.transactions.map(
			(token) => token.token
		);

		const currencyRate = await getRateBySymbols(tokenSymbolsArray);

		const Portofolio = {};

		transactionData.transactions.forEach((transaction) => {
			const amount =
				Portofolio[transaction.token] && Portofolio[transaction.token].balance
					? transaction.transaction_type == "WITHDRAWAL"
						? Portofolio[transaction.token].amount - transaction.amount
						: Portofolio[transaction.token].amount + transaction.amount
					: transaction.amount;
			Portofolio[transaction.token] = {
				token: transaction.token,
				amount: amount,
				balance: amount * currencyRate[transaction.token].Price.USD,
			};
		});

		console.log("(i) Portofolio - ", Portofolio);
	});

program.parse();
