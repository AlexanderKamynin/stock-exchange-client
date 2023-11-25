<script setup lang="ts">
	import { closeModal, confirmModal } from "@kolirt/vue-modal";

	const props = defineProps({
		test: {},
	});
</script>

<template>
	<SimpleModal title="Test modal" size="sm">
		<pre>props: {{ props }}</pre>

		<template #footer>
			<button @click="confirmModal({ value: 'some values' })" class="btn btn-primary">Confirm</button>
			<button @click="closeModal()" class="btn btn-primary">Close</button>
		</template>
	</SimpleModal>
</template>
