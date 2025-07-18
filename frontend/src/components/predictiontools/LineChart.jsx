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
import { useEffect, useState } from "react";
import { BASE_URL } from "../../lib/utils";

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

const LineChart = ({ portfolioData }) => {
  const [realData, setRealData] = useState(null);
  const [calledOnce, setCalledOnce] = useState(false);
  useEffect(() => {
    async function getMode() {
      const response = await fetch(
        `${BASE_URL}/portfolios/model/${portfolioData.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();
      setRealData(data);
    }
    if (!calledOnce) {
      getMode();
      setCalledOnce(true);
    }
  }, []);

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
        data: realData
          ? realData.map((val) => ({ x: val.date, y: val.price }))
          : "",
        borderColor: "rgb(60, 220, 50)",
      },
    ],
  };

  return <Line options={options} data={data} className="p-2" />;
};

export default LineChart;
