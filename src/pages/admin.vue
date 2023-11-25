<script setup lang="ts">
	import { ref, watch } from "vue";
	import axios from "axios";

	export interface IUser {
		id: number;
		name: string;
		balance: number;
		stocks: {
			id: number;
			prices: {
				date: string;
				price: number;
			}[];

			profit?: number;
		}[];
	}

	export interface IStocks {
		id: number;
		label: string;
		name: string;
		price: number;
	}

	export interface IBuyStock {
		brokerId: number;
		stockId: number;
		date?: string;
		price: number;
		count: number;
	}

	export interface ISellStock extends IBuyStock {}

	const users = ref<IUser[]>([]);
	const stocks = ref<IStocks[] | null>([]);
	const timer = ref<any>(1);

	watch(
		() => timer.value,
		async () => {
			users.value = (await axios.get<IUser[]>("http://localhost:3001/brokers")).data;

			stocks.value = (await axios.get<IStocks[]>("http://localhost:3001/stocks")).data;

			setTimeout(() => {
				timer.value++;
			}, 1000);

			users.value.forEach((user) => {
				user.stocks.forEach((stock) => {
					const actualPrice = stocks.value?.find((s) => s.id === stock.id);

					stock.profit =
						stock.prices.length * (actualPrice?.price || 0) -
						stock.prices.reduce((acc, cur) => acc + cur.price, 0);
				});
			});
		},
		{ immediate: true }
	);
</script>
<template>
	<section class="cards">
		<div v-for="user in users" :key="user.id" class="card">
			<div class="card__header">
				<h1 class="card__title">{{ user.name }} ({{ user.id }})</h1>
				<p>{{ user.balance }}</p>
			</div>
			<h2 class="card__stock-title" v-if="user.stocks.reduce((l, a) => l + a.prices.length, 0)">
				User Stocks:
			</h2>
			<div v-for="stock in user.stocks.filter((a) => a.prices.length)" :key="stock.id" class="card__stock">
				<h3 class="stock__title">
					{{ stocks?.find((el) => el.id === stock.id)?.label }} x {{ stock.prices.length }}
				</h3>
				<sup :class="(stock.profit || 0) > 0 ? 'card__green' : 'card__red'">
					{{ stock.profit || 0) }}
				</sup>
			</div>
		</div>
	</section>
</template>

<style>
	.card {
		border: 1px solid black;
		padding: 1rem;
		border-radius: 5px;
	}

	.card__green {
		color: green;
	}

	.card__red {
		color: red;
	}

	.card__stock {
		display: flex;
		align-items: center;
		border-radius: 5px;
		border: 1px solid black;
		padding: 0.5rem;
	}

	.card__title {
		margin: 0;
		font-size: 1.2rem;
	}

	.card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stock__title {
		margin: 0;
	}
	.card__stock-title {
		margin: 0.5rem 0 0.5rem 0;
		font-size: 1.1rem;
		font-weight: 300;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 30px;
		margin: 1rem;
	}
</style>
