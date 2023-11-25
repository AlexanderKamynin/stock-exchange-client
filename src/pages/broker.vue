<script setup lang="ts">
	import { ref, watchEffect, watch } from "vue";
	import { io } from "socket.io-client";
	import { IStocks, IUser } from "./admin.vue.js";
	import axios from "axios";

	import { FwbModal, FwbButton } from "flowbite-vue";

	// @ts-ignore
	import { Chart, registerables } from "chart.js";
	const GraphicConfig = {
	type: "line",
	data: {
		labels: [0],
		datasets: [
			{
				data: [0],
				fill: false,
				label: "Цена акции",
				borderColor: "rgb(75, 192, 192)",
			},
		],
	},
};

	Chart.register(...registerables);
	const canvasElement = ref<HTMLCanvasElement>();
	const graphic = ref<Chart>(null);

	watch
	(
		() => canvasElement.value,
		function callback() 
		{
			if (canvasElement.value) {
				const canvasContext = canvasElement.value.getContext("2d");
				if (canvasContext) {
					graphic.current = new Chart(canvasContext, GraphicConfig);
				}
			}
		}
	);

	function pushDot(value: number) {
		const chart = graphic.current;
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
		<p>Добрый день, {{ name }}! На вашем счету {{ balance }}</p>

		<template v-for="stock in stocks" :key="stock.id">
			<div class="card">
				<h1 class="card__title">{{ stock.label }} x {{ counts[stock.id] || 0 }} ({{ stock.id }})</h1>
				<p>{{ stock.price }}</p>
				<div class="buttons">
					<fwb-button color="purple" outline @click="buyStock(stock)">Buy</fwb-button>
					<fwb-button color="purple" outline @click="sellStock(stock)">Sell</fwb-button>
					<input type="number" placeholder="count" v-model="amount" />
					<fwb-button color="purple" outline @click="showModal"> Open modal </fwb-button>
				</div>
			</div>
		</template>
	</section>
	<fwb-modal v-if="isShowModal" @close="closeModal">
		<template #header> <h1>График</h1> </template>
		<template #body>
			<canvas class="graphic" ref="canvasElement"></canvas>
		</template>
		<template #footer> </template>
	</fwb-modal>
</template>

<style>
button {
	margin: 10px;
}
</style>