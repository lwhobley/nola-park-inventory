import React, { useState } from 'react';
import CostAnalysis from '../components/CostAnalysis';
import '../styles/pages.css';

function Reports() {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('week');

  return (
    <div className="reports-page">
      <h1>Reports & Analytics</h1>
      <div className="reports-controls">
        <select 
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="select-input"
        >
          <option value="inventory">Inventory Report</option>
          <option value="sales">Sales Report</option>
          <option value="waste">Waste Report</option>
          <option value="cogs">COGS Analysis</option>
          <option value="compliance">Compliance Report</option>
        </select>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="select-input"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        <button className="btn-primary">Generate Report</button>
        <button className="btn-secondary">Export as PDF</button>
      </div>
      <CostAnalysis dateRange={dateRange} />
    </div>
  );
}

export default Reports;
