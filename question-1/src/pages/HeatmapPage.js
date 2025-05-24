import React, { useEffect, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import CorrelationHeatmap from '../components/CorrelationHeatmap';

const API_BASE = 'http://20.244.56.144/evaluation-service';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY1MjkxLCJpYXQiOjE3NDgwNjQ5OTEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVmZDliZDg3LWI0MDktNGQwZS04MjE5LWY5ZTVkZDNiMDg0YSIsInN1YiI6IjkyNzYyMmJpdDA3NEBta2NlLmFjLmluIn0sImVtYWlsIjoiOTI3NjIyYml0MDc0QG1rY2UuYWMuaW4iLCJuYW1lIjoicmFiaW4gc21pdGggcyIsInJvbGxObyI6IjkyNzYyMmJpdDA3NCIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6IjVmZDliZDg3LWI0MDktNGQwZS04MjE5LWY5ZTVkZDNiMDg0YSIsImNsaWVudFNlY3JldCI6InBzelpGa0hBVHVid3dxcEoifQ.klOvCRCJg7VHbUlyGfXPZKCjE2IuxKfUdshrMJbsEHk'; // Replace with your actual token

// Helper functions for statistics
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stdDev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}
function covariance(x, y) {
  const meanX = mean(x);
  const meanY = mean(y);
  let cov = 0;
  for (let i = 0; i < x.length; i++) {
    cov += (x[i] - meanX) * (y[i] - meanY);
  }
  return cov / x.length;
}
function pearsonCorrelation(x, y) {
  return covariance(x, y) / (stdDev(x) * stdDev(y));
}

export default function HeatmapPage() {
  const [stocks, setStocks] = useState({});
  const [minutes, setMinutes] = useState(30);
  const [priceHistories, setPriceHistories] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch stocks on mount
  useEffect(() => {
    fetch(`${API_BASE}/stocks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks);
      })
      .catch(console.error);
  }, []);

  // Fetch price data for all stocks when minutes or stocks change
  useEffect(() => {
    if (!Object.keys(stocks).length) return;

    setLoading(true);

    // Fetch price history for all stocks in parallel
    Promise.all(
      Object.values(stocks).map((ticker) =>
        fetch(`${API_BASE}/stocks/${ticker}?minutes=${minutes}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => ({ ticker, data }))
          .catch(() => ({ ticker, data: [] }))
      )
    )
      .then((results) => {
        const histories = {};
        results.forEach(({ ticker, data }) => {
          histories[ticker] = data.map((item) => item.price);
        });
        setPriceHistories(histories);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [minutes, stocks]);

  // Compute correlation matrix (pearson) between stocks
  const tickers = Object.keys(priceHistories);
  const correlationMatrix = [];

  for (let i = 0; i < tickers.length; i++) {
    correlationMatrix[i] = [];
    for (let j = 0; j < tickers.length; j++) {
      const x = priceHistories[tickers[i]] || [];
      const y = priceHistories[tickers[j]] || [];
      // Align arrays length by trimming to shortest length
      const minLen = Math.min(x.length, y.length);
      if (minLen === 0) {
        correlationMatrix[i][j] = 0;
      } else {
        const xTrim = x.slice(-minLen);
        const yTrim = y.slice(-minLen);
        correlationMatrix[i][j] = pearsonCorrelation(xTrim, yTrim);
      }
    }
  }

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Correlation Heatmap
      </Typography>

      <FormControl sx={{ minWidth: 120, mb: 3 }}>
        <InputLabel>Minutes</InputLabel>
        <Select value={minutes} label="Minutes" onChange={(e) => setMinutes(e.target.value)}>
          {[5, 10, 15, 30, 60].map((m) => (
            <MenuItem key={m} value={m}>
              Last {m} min
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <CorrelationHeatmap
          stocks={tickers}
          correlationMatrix={correlationMatrix}
          priceHistories={priceHistories}
        />
      )}
    </Box>
  );
}
