import React, { useState } from 'react';
import { Container, Tabs, Tab } from '@mui/material';
import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';

export default function App() {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newVal) => setTab(newVal);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Stock Prices" />
        <Tab label="Correlation Heatmap" />
      </Tabs>
      {tab === 0 && <StockPage />}
      {tab === 1 && <HeatmapPage />}
    </Container>
  );
}
