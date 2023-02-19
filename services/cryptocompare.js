// import axios from "axios";
const axios = require("axios");
const URL = "https://min-api.cryptocompare.com";
const API_KEY = process.env.CRYPTO_COMPARE_KEY;

module.exports = {
	getRateBySymbols: async (symbols) => {
		const config = {
			headers: {
				authorization: `Apikey ${API_KEY}`,
			},
		};
		const res = await axios.get(
			`${URL}/data/blockchain/mining/calculator?fsyms=${symbols.toString()}&tsyms=USD`,
			config
		);

		return res.data.Data;
	},
};
