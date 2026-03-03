import React, { useState, useContext, useEffect } from 'react';
import { InventoryContext } from '../context';
import '../styles/pages.css';

function Inventory() {
  const { inventory } = useContext(InventoryContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  useEffect(() => {
    // Filter inventory based on search term
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>
      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="btn-primary">Add Item</button>
      </div>
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Reorder Point</th>
              <th>Unit Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.stock_level}</td>
                <td>{item.reorder_point}</td>
                <td>${item.unit_cost}</td>
                <td>
                  <span className={`status-badge ${item.stock_level <= item.reorder_point ? 'low' : 'ok'}`}>
                    {item.stock_level <= item.reorder_point ? 'Low' : 'OK'}
                  </span>
                </td>
                <td>
                  <button className="btn-small">Edit</button>
                  <button className="btn-small">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
