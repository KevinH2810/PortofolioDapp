const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	async populateTransactions() {
		await prisma.$connect();
		try {
			await prisma.$queryRaw`INSERT INTO Transactions( timestamp, transaction_type, token, amount) SELECT timestamp, transaction_type, token, amount from txs; Drop Table txs`;
			await prisma.$disconnect();
			return { result: true, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
	async createTransaction(transaction) {
		await prisma.$connect();
		try {
			await prisma.transactions.create({ data: transaction });
			await prisma.$disconnect();
			return { result: true, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
	//single transaction
	async getTransaction(where) {
		await prisma.$connect();
		try {
			const transaction = await prisma.transactions.findFirst({
				where,
			});
			await prisma.$disconnect();
			return { transaction, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
	async getTransactionsData(where) {
		await prisma.$connect();
		try {
			const transactions = await prisma.transactions.findMany({
				where,
			});
			await prisma.$disconnect();
			return { transactions, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
	async getTransactionPortofolio({ timestamp, token }) {
		await prisma.$connect();
		try {
			//sanitize token by only allows char up to 3 for current data cases
			//timestamp is transformed from initial data so its already valid

			const conditions = [];
			if (timestamp) {
				conditions.push(
					`timestamp between ${timestamp} AND (${timestamp} + 86400)`
				);
			}

			if (token) {
				conditions.push(`token = '${token}'`);
			}

			let whereQuery = `WHERE 1=1`;
			if (conditions.length > 0) {
				conditions.map((where) => {
					whereQuery = `${whereQuery} AND ${where} `;
				});
			}

			const query = `SELECT token, SUM(CASE WHEN transaction_type = 'WITHDRAW' THEN (amount * -1) ELSE amount END) as amount from Transactions ${whereQuery} GROUP BY token`;

			const transactions = await prisma.$queryRawUnsafe(query);
			await prisma.$disconnect();
			return { transactions, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
};
