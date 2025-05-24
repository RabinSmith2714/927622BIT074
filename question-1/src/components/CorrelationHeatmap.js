import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

function getColor(value) {
  // Return color from red (-1) to white (0) to green (+1)
  const red = value < 0 ? 255 : Math.floor(255 - 255 * value);
  const green = value > 0 ? 255 : Math.floor(255 + 255 * value);
  return `rgba(${red},${green},0,0.5)`;
}

export default function CorrelationHeatmap({ stocks, correlationMatrix }) {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            {stocks.map((stock) => (
              <TableCell key={stock} align="center">
                {stock}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((rowStock, i) => (
            <TableRow key={rowStock}>
              <TableCell>{rowStock}</TableCell>
              {stocks.map((colStock, j) => {
                const val = correlationMatrix[i][j];
                return (
                  <TableCell
                    key={colStock}
                    align="center"
                    sx={{
                      backgroundColor: getColor(val),
                      color: 'black',
                      fontWeight: i === j ? 'bold' : 'normal',
                    }}
                  >
                    {val.toFixed(2)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box mt={2}>
        <Typography variant="caption">
          Correlation values range from -1 (red) to +1 (green). Values near zero are white.
        </Typography>
      </Box>
    </TableContainer>
  );
}
