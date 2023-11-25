<script setup lang="ts">
	import { ref, watchEffect, watch } from "vue";
	import { IUser } from "./admin.vue";
	import axios from "axios";
	import { FwbButton } from "flowbite-vue";

	const brokerID = ref<number>(1);

	async function login() {
		console.log(brokerID.value);
		let broker = (await axios.get<IUser>(`http://localhost:3001/brokers/${brokerID.value}`)).data;
		console.log(broker);
		if (broker) {
			sessionStorage.setItem("broker", JSON.stringify(broker));
			window.location.href = "/";
		} else {
			alert("Нет пользователя с таким ID");
		}
	}
</script>

<template>
	<h1>Вход</h1>

	<input type="number" placeholder="Your name" v-model="brokerID" />

	<fwb-button @click="login()">Login</fwb-button>
</template>

<style scoped></style>
