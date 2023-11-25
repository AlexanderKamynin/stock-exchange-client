<script setup lang="ts">
	import { ref, watchEffect, watch, onMounted } from "vue";
	// @ts-ignore
	import { io } from "socket.io-client";
	import { IStocks, IUser } from "./admin.vue";
	import axios from "axios";

	import { FwbModal, FwbButton } from "flowbite-vue";

	import { formatCurrency } from "../utils/format";

	// @ts-ignore
	import { Chart, registerables } from "chart.js";
	import { config } from "../components/constants";

	const canvasRef = ref<HTMLCanvasElement | undefined>();
	const chartRef = ref<Chart>(null);

	watch(
		() => canvasRef.value,
		() => {
			if (canvasRef.value) {
				const ctx = canvasRef.value.getContext("2d");
				if (ctx) {
					Chart.register(...registerables);

					chartRef.current = new Chart(ctx, config);
				}
			}
		}
	);

	function pushDot(value: number) {
		const chart = chartRef.current;
		if (!chart) return;
		// add new dot to chart
		chart.data.datasets[0].data.push(value);
		chart.data.labels?.push(chart.data.datasets[0].data.length - 1);
		chart.update();
	}

	const stocks = ref<IStocks[]>([]);
	const socket = ref<any>();

	const amount = ref<number>(1);
	const isShowModal = ref<boolean>(false);

	function closeModal() {
		isShowModal.value = false;
	}

	function showModal() {
		isShowModal.value = true;
	}

	watchEffect(async () => {
		stocks.value = (await axios.get<IStocks[]>("http://localhost:3001/stocks")).data;
		const newSocket = io("http://localhost:3002", { transports: ["websocket"] });
		socket.value = newSocket;

		socket.value?.open();
		socket.value?.emit("updatePrices");
		socket.value?.on("updatePrices", (data: any) => {
			stocks.value = data;
			pushDot(data[0].price);
		});
	});

	async function buyStock(stock: IStocks) {
		fetch("http://localhost:3001/auction/buy", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				brokerId: JSON.parse(sessionStorage.getItem("broker") || "{}").id || 1,
				stockId: stock.id,
				price: stock.price,
				count: amount.value,
			}),
		}).then((response) => response.json());
		const brokerID = JSON.parse(sessionStorage.getItem("broker") || "{}").id || 1;
		let broker = (await axios.get<IUser>(`http://localhost:3001/brokers/${brokerID}`)).data;
		sessionStorage.setItem("broker", JSON.stringify(broker));

		JSON.parse(sessionStorage.getItem("broker") || "{}").stocks.forEach((stock: any) => {
			counts.value[stock.id] = stock.prices.length;
		});
	}

	async function sellStock(stock: IStocks) {
		fetch("http://localhost:3001/auction/sell", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				brokerId: JSON.parse(sessionStorage.getItem("broker") || "{}").id || 1,
				stockId: stock.id,
				price: stock.price,
				count: amount.value,
			}),
		})
			.then((response) => response.json())
			.then((result) => console.log(result))
			.catch((error) => console.log("error", error));

		const brokerID = JSON.parse(sessionStorage.getItem("broker") || "{}").id || 1;
		let broker = (await axios.get<IUser>(`http://localhost:3001/brokers/${brokerID}`)).data;
		sessionStorage.setItem("broker", JSON.stringify(broker));

		JSON.parse(sessionStorage.getItem("broker") || "{}").stocks.forEach((stock: any) => {
			counts.value[stock.id] = stock.prices.length;
		});
	}

	const balance = ref<number>(JSON.parse(sessionStorage.getItem("broker") || "{}").balance ?? 1);
	const name = ref<string>(JSON.parse(sessionStorage.getItem("broker") || "{}").name || "");
	const counts = ref<any>({});

	JSON.parse(sessionStorage.getItem("broker") || "{}").stocks.forEach((stock: any) => {
		counts.value[stock.id] = stock.prices.length;
	});
</script>

<template>
	<section class="cards">
		<p>Привет, {{ name }}, У вас (нихукя себе) {{ formatCurrency(balance) }}</p>

		<template v-for="stock in stocks" :key="stock.id">
			<div class="card">
				<h1 class="card__title">{{ stock.label }} x {{ counts[stock.id] || 0 }} ({{ stock.id }})</h1>
				<p>{{ formatCurrency(stock.price) }}</p>
				<div class="buttons">
					<fwb-button @click="buyStock(stock)">Buy</fwb-button>
					<fwb-button @click="sellStock(stock)">Sell</fwb-button>
					<input type="number" placeholder="count" v-model="amount" />
					<fwb-button @click="showModal"> Open modal </fwb-button>
				</div>
			</div>
		</template>
	</section>
	<fwb-modal v-if="isShowModal" @close="closeModal">
		<template #header> <h1>График-хуяфик</h1> </template>
		<template #body>
			<canvas class="graphic" ref="canvasRef"></canvas>
		</template>
		<template #footer> </template>
	</fwb-modal>
</template>

<style scoped>
	.buttons {
		display: flex;
		gap: 20px;
	}
</style>
