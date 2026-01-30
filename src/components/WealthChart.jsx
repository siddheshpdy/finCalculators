import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WealthChart = ({ data, primaryColor, secondaryColor, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} 
                 tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Area type="monotone" dataKey="TotalValue" stroke={primaryColor} strokeWidth={3} fill="url(#colorTotal)" name="Maturity Amount" />
          <Area type="monotone" dataKey="Invested" stroke="#94A3B8" strokeWidth={2} fill="transparent" name="Invested Amount" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WealthChart;