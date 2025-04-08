'use client';

import React from 'react';
import styles from './RevenueWidget.module.scss';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueWidget = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [
      {
        label: 'This Period',
        data: [1500, 3000, 2000, 2500, 1800, 4000, 3400],
        borderColor: 'rgba(0, 255, 0, 0.8)',
        borderWidth: 2,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Last Period',
        data: [1600, 2200, 2400, 2000, 2600, 3500, 3200],
        borderColor: 'rgba(128, 128, 128, 0.8)',
        borderWidth: 2,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'start',
        labels: {
          boxWidth: 25,
          boxHeight: 2,
          padding: 15,
          color: 'rgba(255, 255, 255, 1)',
          font: {
            size: 11,
            weight: '400',
          },
          usePointStyle: false,
          generateLabels: function (chart) {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: 'transparent',
              strokeStyle: dataset.borderColor,
              lineWidth: 2,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            }));
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#aaa',
          padding: 5,
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        position: 'right',
        grid: {
          display: false,
        },
        ticks: {
          color: '#aaa',
          padding: 5,
          font: {
            size: 11,
          },
          callback: function (value) {
            return value.toLocaleString() + ' EUR';
          },
        },
        border: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 5,
        top: 10,
        bottom: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0,
      },
    },
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Monthly Recurring Revenue</h2>
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueWidget;
