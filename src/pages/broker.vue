<script setup lang="ts">
	import { ref, watchEffect, watch } from "vue";
	import { io } from "socket.io-client";
	import axios from "axios";

	import { FwbModal, FwbButton } from "flowbite-vue";
	import { IStock, IBroker } from "../interfaces/interfaces.ts";
	import { updateBrokerData, sendRequest } from "../services/broker.service.ts";

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
				borderColor: "rgb(89, 28, 147)",
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

	const stocks = ref<IStock[]>([]);
	const socket = ref<any>();

	const stockCount = ref<number>(1);
	const isShowModal = ref<boolean>(false);

	const balance = ref<number>(JSON.parse(sessionStorage.getItem("broker")).balance ?? 0);
	const name = ref<string>(JSON.parse(sessionStorage.getItem("broker")).name || "");
	const counts = ref<any>({});

	JSON.parse(sessionStorage.getItem("broker") || "{}").stocks.forEach((stock: any) => {
		counts.value[stock.id] = stock.prices.length;
	});

	function closeModal() {
		isShowModal.value = false;
	}

	function showModal() {
		isShowModal.value = true;
	}

	function pushDot(value: number) {
		const chart = graphic.current;
		if (!chart){
			return;
		}

		chart.data.datasets[0].data.push(value);
		chart.data.labels?.push(chart.data.datasets[0].data.length - 1);
		chart.update();
	}


	watchEffect(async () => {
		stocks.value = (await axios.get<IStock[]>("http://localhost:3001/stocks")).data;
		const newSocket = io("http://localhost:3002", { transports: ["websocket"] });
		socket.value = newSocket;

		socket.value?.open();
		socket.value?.emit("updatePrices");
		socket.value?.on("updatePrices", (data: any) => {
			stocks.value = data;
			pushDot(data[0].price);
		});
	});

	async function buyStock(stock: IStock) {
		const response = await sendRequest("http://localhost:3001/auction/buy", "POST", {
			brokerId: JSON.parse(sessionStorage.getItem("broker")).id || 1,
			stockId: stock.id,
			price: stock.price,
			count: stockCount.value,
		});


		if(response.reason) {
			alert(response.reason);
		}
		else {
			// update broker data
			await updateBrokerData();

			JSON.parse(sessionStorage.getItem("broker")).stocks.forEach((stock: any) => {
				counts.value[stock.id] = stock.prices.length;
			});
			balance.value = JSON.parse(sessionStorage.getItem("broker")).balance;
		}
	}

	async function sellStock(stock: IStock) {
		const response = await sendRequest("http://localhost:3001/auction/sell", "POST", {
			brokerId: JSON.parse(sessionStorage.getItem("broker")).id || 1,
			stockId: stock.id,
			price: stock.price,
			count: stockCount.value,
		});
		
		if(response.reason) {
			alert(response.reason);
		}
		else {
			await updateBrokerData();

			JSON.parse(sessionStorage.getItem("broker") || "{}").stocks.forEach((stock: any) => {
				counts.value[stock.id] = stock.prices.length;
			});
			balance.value = JSON.parse(sessionStorage.getItem("broker")).balance;
		}
	}
</script>

<template>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;500;700&family=Ubuntu&family=Ubuntu+Mono&display=swap" rel="stylesheet">

	<div class="broker-info">
		<p>Добрый день, {{ name }}! На вашем счету ${{ balance }}</p>
	</div>

	<img src="../img/monkey-with-money.gif">

	<template v-for="stock in stocks" :key="stock.id">
			<div class="stock-info">
				<p class="stock-label">Акции {{ stock.label }}</p>
				<div>
					<p>Количество: {{ counts[stock.id] || 0 }}</p>
					<p>Текущая цена: ${{ stock.price }}</p>
				</div>
				<div class="buttons">
					<fwb-button color="purple" outline @click="buyStock(stock)">Buy</fwb-button>
					<fwb-button color="purple" outline @click="sellStock(stock)">Sell</fwb-button>
					<input type="number" placeholder="count" v-model="stockCount" />
					<fwb-button color="purple" outline @click="showModal"> View trand </fwb-button>
				</div>
			</div>
	</template>
	
	<fwb-modal v-if="isShowModal" @close="closeModal">
		<template #header> <h1>Trand</h1> </template>
		<template #body>
			<canvas ref="canvasElement"></canvas>
		</template>
	</fwb-modal>
</template>

<style>
	* {
		font-family: 'Ubuntu Mono', sans-serif;
		font-size: 20px;
	}

	img { 
		width: 256px;
		height: 256px;
		float: left;
		position: absolute;
	}

	button {
		margin: 10px;
	}

	.stock-label {
		font-size: 26px;
	}

	.broker-info {
		font-size: 26px;
	}

	.stock-info {
		display: flex;
  	justify-content: center;
  	align-items: center;
  	flex-direction: column;

		padding-bottom: 15px;
	}

</style>