const fs = require("fs");
const readline = require("readline");
const { spawn, exec, fork } = require("child_process");
const glob = require("glob");
// const child = spawn("sqlite3", ["transactions.db"])
const proInfinity = require("cli-infinity-progress");
const sqlite3 = require("sqlite3").verbose();
const { populateTransactions } = require("./transaction");

const pi = new proInfinity();

const filePath = "./files/transactions.csv";
const dbPath = "./prisma/db/portofolio-dapp.db";
const tempFilePath = "_tmp/*.csv";
const tableName = "txs";

async function createSQLiteTable() {
	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(dbPath, (error) => {
			if (error) {
				console.error("(!) Create SQLite Error: ", error.message);
				reject(error);
			}
			console.log("(i) Connected to the transactions database.");
			db.run(
				`CREATE TABLE ${tableName} (
          timestamp BIGINT,
          transaction_type TEXT,
          token TEXT,
          amount FLOAT
        )`,
				(error) => {
					if (error) {
						console.error("(!) Create Table Error: ", error.message);
						reject(error);
					}
					console.log(`(i) Table ${tableName} created.`);
					resolve(db);
				}
			);
		});
	});
}

async function readAndSplitCSV() {
	return new Promise(async (resolve, reject) => {
		let dataStr = "";
		let csvCount = 0;
		let lineCount = 0;

		pi.start();
		const startTime = Date.now();

		// remove existing temporary files
		const csvFiles = await new Promise((resolveListFiles, rejectListFiles) => {
			glob("_tmp/*.csv", (err, files) => {
				if (err) {
					console.error("(!) Temporary CSV to clean-up, Error: ", err);
					return rejectListFiles(err);
				}

				console.log("(i) Temporary CSV to clean-up: ", files);
				resolveListFiles(files);
			});
		});
		csvFiles.map((file) => {
			fs.unlinkSync(file);
		});

		console.log();

		// begin to read stream from large csv file
		console.log("(i) Read stream CSV..");
		const readStream = fs.createReadStream(filePath, "utf8");
		let rl = readline.createInterface({ input: readStream });

		// columns:
		// timestamp | transaction_type | token | amount

		rl.on("line", (line) => {
			if (csvCount === 0 && lineCount === 0) {
				console.log("@@ csvCount === 0 && lineCount === 0", line);
				lineCount++;
				return;
			}

			if (lineCount <= 7500000) {
				dataStr = dataStr + line + "\n";
				lineCount++;
			} else {
				csvCount++;
				fs.writeFileSync(`./_tmp/tx_${csvCount}.csv`, dataStr, (error) => {
					if (error) {
						console.error("(!) Write File Error: ", error.message);
						reject(error);
					}
					console.log(`(i) Write File tx_${csvCount}.csv completed`);
				});

				lineCount = 1;
				dataStr = "";
				dataStr = dataStr + line + "\n";
			}
		});

		rl.on("error", (error) => {
			pi.stop();
			console.log("(!) ReadLine Error: ", error.message);
			reject(error);
		});
		rl.on("close", () => {
			if (dataStr.length > 0) {
				csvCount++;
				fs.writeFileSync(`./_tmp/tx_${csvCount}.csv`, dataStr, (error) => {
					if (error) {
						console.error("(!) Write File Error: ", error.message);
						reject(error);
					}
					console.log(`(i) Write File tx_${csvCount}.csv completed`);
				});
			}

			pi.stop();
			console.log("(i) Split CSV completed");

			const endTime = Date.now();
			const duration = (endTime - startTime) / 1000;
			console.log(`(i) Duration: ${duration} seconds`);
			console.log("----------------------------------------\n");

			resolve(true);
		});

		readStream.on("error", (error) => {
			pi.stop();
			console.error("(!) ReadStream Error: ", error.message);
			reject(error);
		});
	});
}

async function importCSVToSQLite() {
	return new Promise(async (resolve, reject) => {
		const startTime = Date.now();

		const csvFiles = await new Promise((resolveListFiles, rejectListFiles) => {
			glob(tempFilePath, (err, files) => {
				if (err) {
					console.error("(i) Listing exported CSV error: ", err);
					return rejectListFiles(err);
				}

				console.log("(i) Listing exported CSV: ", files);
				resolveListFiles(files);
			});
		});

		const postResults = [];
		const iterReqs = new Promise(async (resolveIterReqs, rejectIterReqs) => {
			const iterResp = await csvFiles.reduce(async (prev, curr, idx) => {
				await prev;
				try {
					console.log(`\n(i) Sending post data to SQLite: ${curr}:`);
					pi.start();

					const result = await new Promise((resolveImport, rejectImport) => {
						const child = spawn("sqlite3", [
							"-csv",
							"-header",
							dbPath,
							`.import ${curr} ${tableName}`,
						]);

						child.stdout.on("data", (data) => {
							console.log(`@stdout: ${data}`);
						});
						child.stderr.on("data", (data) => {
							pi.stop();
							console.error(`@stderr: ${data}`);
							postResults.push(data);
							// rejectImport(data)
						});
						child.on("close", (code) => {
							console.log(`(i) Child process done! exited with code ${code}`);
							postResults.push(true);

							pi.stop();
							resolveImport(true);
						});
					});
					return postResults;
				} catch (err) {
					console.error(`(!) Sending post data to SQLite Error: `, err);
					postResults.push(!!err.messages ? err.messages : err);
					return postResults;
				}
			}, Promise.resolve());
			resolveIterReqs(iterResp);
		});

		await iterReqs;

		pi.stop();

		console.log();
		console.log(`(i) start transfering data to Transaction table`);
		await populateTransactions();
		console.log(`(i) done populating Transactions table`);
		console.log();

		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;
		console.log(`(i) Duration: ${duration} seconds`);

		resolve(postResults);
	});
}

/**
 * CLI
 * (1) init >> import >> db ready
 * (2) db/data ready, exec command:
 *  a) get tx by date (date)
 *  b) get tx by token (token)
 * (3) portofolio
 *  a) get currency rate from cryptocompare
 *  b) get token balance (token)
 *    1) WD = minus, DEPO = plus
 *    2) grouping by token
 *    3) aggreate sum by token
 **/

module.exports = {
	createSQLiteTable,
	readAndSplitCSV,
	importCSVToSQLite,
};
