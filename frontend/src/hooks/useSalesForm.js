import { useState } from 'react';

export function useSalesForm() {
  const [items, setItems] = useState([]);

  const addItem = () => {
    setItems(prev => [...prev, { product_id: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value, products = []) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index][field] = value;

      // Auto-populate rate when product is selected
      if (field === 'product_id') {
        const product = products.find(p => p.id === parseInt(value));
        if (product) {
          newItems[index].rate = product.dealer_price;
        }
      }

      // Calculate amount
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
      return newItems;
    });
  };

  const calculateTotals = (discountPercent = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    return { subtotal, discount, total };
  };

  const resetItems = () => {
    setItems([]);
  };

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    calculateTotals,
    resetItems
  };
}
