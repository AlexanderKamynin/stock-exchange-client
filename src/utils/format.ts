export function formatCurrency(num: number) {
	return new Intl.NumberFormat("ja-JP", {
		style: "currency",
		currency: "JPY",
		minimumFractionDigits: 2,
	}).format(num);
}
