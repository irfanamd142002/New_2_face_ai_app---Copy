import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';

const CartIcon = ({ onClick, className = '' }) => {
  const { getCartTotals } = useCart();
  const { itemCount } = getCartTotals();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-primary-600 transition-colors ${className}`}
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;