import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowTopRightOnSquareIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';

const ShoppingCart = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotals } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const totals = getCartTotals();

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      onClose();
      // In a real app, you would redirect to a payment processor or order confirmation
    }, 2000);
  };

  const handleExternalCheckout = (item) => {
    if (item.ecommerceUrl) {
      window.open(item.ecommerceUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started</p>
                <Button
                  as={Link}
                  to="/products"
                  variant="primary"
                  onClick={onClose}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">₹{item.price}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            disabled={item.quantity >= item.stock}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* External Buy Option */}
                        {item.ecommerceUrl && (
                          <button
                            onClick={() => handleExternalCheckout(item)}
                            className="text-xs text-primary-600 hover:text-primary-700 mt-1 flex items-center"
                          >
                            Buy directly <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 mt-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Totals and Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST 18%)</span>
                  <span>₹{totals.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-green-50 rounded-lg p-3 space-y-1">
                <div className="flex items-center text-xs text-green-700">
                  <TruckIcon className="h-3 w-3 mr-1" />
                  <span>Free shipping on orders over ₹500</span>
                </div>
                <div className="flex items-center text-xs text-green-700">
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={CreditCardIcon}
                  onClick={() => window.location.href = '/checkout'}
                  disabled={items.length === 0}
                >
                  Checkout - ₹{totals.total.toFixed(2)}
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 text-center">
                <p>
                  This is a demo checkout. In production, this would integrate with 
                  payment processors like Razorpay, Stripe, or PayPal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;