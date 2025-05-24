import React, { useEffect, useState } from 'react';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import StockChart from '../components/StockChart';

const API_BASE = 'http://20.244.56.144/evaluation-service';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY1MjkxLCJpYXQiOjE3NDgwNjQ5OTEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVmZDliZDg3LWI0MDktNGQwZS04MjE5LWY5ZTVkZDNiMDg0YSIsInN1YiI6IjkyNzYyMmJpdDA3NEBta2NlLmFjLmluIn0sImVtYWlsIjoiOTI3NjIyYml0MDc0QG1rY2UuYWMuaW4iLCJuYW1lIjoicmFiaW4gc21pdGggcyIsInJvbGxObyI6IjkyNzYyMmJpdDA3NCIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6IjVmZDliZDg3LWI0MDktNGQwZS04MjE5LWY5ZTVkZDNiMDg0YSIsImNsaWVudFNlY3JldCI6InBzelpGa0hBVHVid3dxcEoifQ.klOvCRCJg7VHbUlyGfXPZKCjE2IuxKfUdshrMJbsEHk'; // Replace with your actual token

export default function StockPage() {
  const [stocks, setStocks] = useState({});
  const [selectedTicker, setSelectedTicker] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch stocks on mount
  useEffect(() => {
    fetch(`${API_BASE}/stocks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks);
        // Select first stock by default
        const firstTicker = Object.values(data.stocks)[0];
        setSelectedTicker(firstTicker);
      })
      .catch(console.error);
  }, []);

  // Fetch price data when selectedTicker or minutes change
  useEffect(() => {
    if (!selectedTicker) return;
    setLoading(true);
    fetch(`${API_BASE}/stocks/${selectedTicker}?minutes=${minutes}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPriceData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedTicker, minutes]);

  // Calculate average price
  const average = priceData.length
    ? priceData.reduce((acc, p) => acc + p.price, 0) / priceData.length
    : 0;

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Stock Price Chart
      </Typography>

      <FormControl sx={{ minWidth: 150, mb: 3 }}>
        <InputLabel>Stock</InputLabel>
        <Select
          value={selectedTicker}
          label="Stock"
          onChange={(e) => setSelectedTicker(e.target.value)}
        >
          {Object.entries(stocks).map(([name, ticker]) => (
            <MenuItem key={ticker} value={ticker}>
              {name} ({ticker})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120, ml: 3, mb: 3 }}>
        <InputLabel>Minutes</InputLabel>
        <Select
          value={minutes}
          label="Minutes"
          onChange={(e) => setMinutes(e.target.value)}
        >
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
        <StockChart priceData={priceData} average={average} />
      )}
    </Box>
  );
}
