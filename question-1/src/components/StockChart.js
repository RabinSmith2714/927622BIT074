import React from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function StockChart({ priceData, average }) {
  const labels = priceData.map((item) =>
    new Date(item.lastUpdatedAt).toLocaleTimeString()
  );

  const prices = priceData.map((item) => item.price);

  const averageLine = Array(priceData.length).fill(average);

  const data = {
    labels,
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: 'blue',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Average',
        data: averageLine,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Box>
      {priceData.length ? (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Last Updated: {new Date(priceData[priceData.length - 1].lastUpdatedAt).toLocaleString()}
          </Typography>
          <Line data={data} options={options} />
        </>
      ) : (
        <Typography>No price data available.</Typography>
      )}
    </Box>
  );
}
