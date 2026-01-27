import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const WealthChart = ({ data, primaryColor, secondaryColor, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={12} tickMargin={10} />
          <YAxis 
            fontSize={12} 
            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
          />
          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
          <Legend />
          <Area
            type="monotone"
            dataKey="TotalValue"
            stroke={primaryColor}
            fillOpacity={1}
            fill="url(#colorTotal)"
            name="Total Maturity Value"
          />
          <Area
            type="monotone"
            dataKey="Invested"
            stroke={secondaryColor}
            fill="#94A3B8"
            fillOpacity={0.3}
            name="Invested Amount"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WealthChart;