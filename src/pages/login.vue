<script setup lang="ts">
	import { ref } from "vue";
	import { IUser } from "./admin.vue";
	import axios from "axios";

	const brokerID = ref<number>(1);

	async function login() {
		let broker = (await axios.get<IUser>(`http://localhost:3001/brokers/${brokerID.value}`)).data;
		if (broker) 
		{
			sessionStorage.setItem("broker", JSON.stringify(broker));
			window.location.href = "/broker";
		} 
		else 
		{
			alert("Нет пользователя с таким ID");
		}
	}
</script>

<template>
	<h1>Вход</h1>
	<input type="number" placeholder="Your ID" v-model="brokerID" />
	<button @click="login()">Login</button>
</template>