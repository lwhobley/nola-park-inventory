import React, { useEffect, useState, useContext } from 'react';
import { InventoryContext } from '../context';

function InventoryDashboard() {
  const { inventory } = useContext(InventoryContext);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (inventory && inventory.length > 0) {
      const lowStockCount = inventory.filter(
        (item) => item.stock_level <= item.reorder_point
      ).length;
      const outOfStockCount = inventory.filter(
        (item) => item.stock_level === 0
      ).length;
      const totalValue = inventory.reduce(
        (sum, item) => sum + (item.stock_level * item.unit_cost),
        0
      );

      setStats({
        totalItems: inventory.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue,
      });
    }
  }, [inventory]);

  return (
    <div className="inventory-dashboard">
      <div className="stat-card">
        <h3>Total Items</h3>
        <p className="stat-value">{stats.totalItems}</p>
      </div>
      <div className="stat-card warning">
        <h3>Low Stock</h3>
        <p className="stat-value">{stats.lowStock}</p>
      </div>
      <div className="stat-card danger">
        <h3>Out of Stock</h3>
        <p className="stat-value">{stats.outOfStock}</p>
      </div>
      <div className="stat-card">
        <h3>Total Inventory Value</h3>
        <p className="stat-value">${stats.totalValue.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default InventoryDashboard;
