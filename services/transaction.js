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
	async getTransactionPortofolio({ timestamp, token }) {
		await prisma.$connect();
		try {
			//sanitize token by only allows char up to 3 for current data cases
			//timestamp is transformed from initial date to seconds

			const conditions = [];
			const timeRange = 86400; // 1 day -> second
			if (timestamp) {
				conditions.push(
					`timestamp between ${timestamp} AND (${timestamp} + ${timeRange})`
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

			const query = `SELECT token, transaction_type, SUM(amount) as amount from Transactions ${whereQuery} GROUP BY token, transaction_type`;

			const transactions = await prisma.$queryRawUnsafe(query);
			await prisma.$disconnect();
			return { transactions, null: null };
		} catch (err) {
			await prisma.$disconnect();
			return { null: null, err };
		}
	},
};
