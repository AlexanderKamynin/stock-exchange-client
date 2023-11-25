export const config = {
	type: "line" as const,
	data: {
		labels: [0],
		datasets: [
			{
				data: [0],
				fill: false,
				tension: 0.4,
				label: "Stock Price" as const,
				borderColor: "rgb(75, 192, 192)" as const,
			},
		],
	},

	options: {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: "Chart.js Line Chart - Cubic interpolation mode" as const,
			},
		},
		interaction: {
			intersect: false,
		},
		scales: {
			x: {
				display: true,
				title: {
					text: "hour" as const,
					display: true,
					padding: 10 as const,
				},
			},
			y: {
				display: true,
				title: {
					display: true,

					text: "$" as const,
				},
			},
		},
	},
};
