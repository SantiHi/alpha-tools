import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// above imports all using Chart-js library!

// dummay data, mostly just to understand how to format my TC #2 data!
const dummyData = [
  { date: "2025-01-01", price: 100.74 },
  { date: "2025-01-02", price: 102.45 },
  { date: "2025-01-03", price: 101.63 },
  { date: "2025-01-04", price: 101.07 },
  { date: "2025-01-05", price: 102.95 },
  { date: "2025-01-06", price: 101.64 },
  { date: "2025-01-07", price: 102.37 },
  { date: "2025-01-08", price: 102.9 },
  { date: "2025-01-09", price: 104.65 },
  { date: "2025-01-10", price: 106.29 },
  { date: "2025-01-11", price: 105.22 },
  { date: "2025-01-12", price: 107.15 },
  { date: "2025-01-13", price: 106.96 },
  { date: "2025-01-14", price: 108.96 },
  { date: "2025-01-15", price: 109.31 },
  { date: "2025-01-16", price: 107.36 },
  { date: "2025-01-17", price: 107.0 },
  { date: "2025-01-18", price: 108.24 },
  { date: "2025-01-19", price: 106.53 },
  { date: "2025-01-20", price: 108.06 },
  { date: "2025-01-21", price: 108.81 },
  { date: "2025-01-22", price: 109.57 },
  { date: "2025-01-23", price: 110.01 },
  { date: "2025-01-24", price: 111.13 },
  { date: "2025-01-25", price: 109.61 },
  { date: "2025-01-26", price: 108.96 },
  { date: "2025-01-27", price: 110.7 },
  { date: "2025-01-28", price: 111.73 },
  { date: "2025-01-29", price: 111.89 },
  { date: "2025-01-30", price: 112.11 },
  { date: "2025-01-31", price: 111.19 },
  { date: "2025-02-01", price: 113.19 },
  { date: "2025-02-02", price: 112.17 },
  { date: "2025-02-03", price: 111.38 },
  { date: "2025-02-04", price: 110.55 },
  { date: "2025-02-05", price: 112.4 },
  { date: "2025-02-06", price: 113.44 },
  { date: "2025-02-07", price: 114.32 },
  { date: "2025-02-08", price: 115.01 },
  { date: "2025-02-09", price: 114.61 },
  { date: "2025-02-10", price: 116.1 },
  { date: "2025-02-11", price: 117.26 },
  { date: "2025-02-12", price: 118.76 },
  { date: "2025-02-13", price: 120.47 },
  { date: "2025-02-14", price: 119.15 },
  { date: "2025-02-15", price: 120.72 },
  { date: "2025-02-16", price: 121.55 },
  { date: "2025-02-17", price: 121.7 },
  { date: "2025-02-18", price: 120.91 },
  { date: "2025-02-19", price: 120.87 },
  { date: "2025-02-20", price: 118.91 },
  { date: "2025-02-21", price: 117.74 },
  { date: "2025-02-22", price: 119.32 },
  { date: "2025-02-23", price: 119.09 },
  { date: "2025-02-24", price: 119.02 },
  { date: "2025-02-25", price: 120.68 },
  { date: "2025-02-26", price: 120.61 },
  { date: "2025-02-27", price: 121.82 },
  { date: "2025-02-28", price: 121.72 },
  { date: "2025-03-01", price: 122.49 },
  { date: "2025-03-02", price: 121.83 },
  { date: "2025-03-03", price: 122.04 },
  { date: "2025-03-04", price: 120.68 },
  { date: "2025-03-05", price: 119.63 },
  { date: "2025-03-06", price: 121.15 },
  { date: "2025-03-07", price: 121.98 },
  { date: "2025-03-08", price: 120.65 },
  { date: "2025-03-09", price: 119.55 },
  { date: "2025-03-10", price: 118.3 },
  { date: "2025-03-11", price: 118.93 },
  { date: "2025-03-12", price: 120.93 },
  { date: "2025-03-13", price: 120.64 },
  { date: "2025-03-14", price: 121.72 },
  { date: "2025-03-15", price: 122.72 },
  { date: "2025-03-16", price: 120.83 },
  { date: "2025-03-17", price: 120.6 },
  { date: "2025-03-18", price: 121.91 },
  { date: "2025-03-19", price: 121.0 },
  { date: "2025-03-20", price: 122.47 },
  { date: "2025-03-21", price: 121.71 },
  { date: "2025-03-22", price: 120.53 },
  { date: "2025-03-23", price: 119.17 },
  { date: "2025-03-24", price: 119.76 },
  { date: "2025-03-25", price: 118.08 },
  { date: "2025-03-26", price: 117.44 },
  { date: "2025-03-27", price: 117.4 },
  { date: "2025-03-28", price: 116.33 },
  { date: "2025-03-29", price: 118.24 },
  { date: "2025-03-30", price: 119.75 },
  { date: "2025-03-31", price: 117.9 },
  { date: "2025-04-01", price: 119.6 },
  { date: "2025-04-02", price: 120.92 },
  { date: "2025-04-03", price: 122.69 },
  { date: "2025-04-04", price: 124.59 },
  { date: "2025-04-05", price: 125.87 },
  { date: "2025-04-06", price: 123.93 },
  { date: "2025-04-07", price: 124.21 },
  { date: "2025-04-08", price: 125.57 },
  { date: "2025-04-09", price: 124.41 },
  { date: "2025-04-10", price: 125.66 },
];

const LineChart = ({ portfolioData }) => {
  const options = {
    responsive: true,
    ticks: {
      autoSkip: true,
      maxTicksLimit: 8,
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: portfolioData.name,
        font: {
          size: 15,
        },
        color: "black",
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "black",
          font: {
            size: 16,
          },
        },
        ticks: {
          color: "black",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price ($)",
          color: "black",
          font: {
            size: 16,
          },
        },
        ticks: {
          color: "black",
        },
      },
    },
  };

  const data = {
    datasets: [
      {
        label: "Preformance Prediciton",
        data: dummyData.map((val) => ({ x: val.date, y: val.price })),
        borderColor: "rgb(60, 220, 50)",
      },
    ],
  };

  return <Line options={options} data={data} className="p-2" />;
};

export default LineChart;
