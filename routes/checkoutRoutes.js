const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Cart model
const Order = require('../models/Order'); // Order model
const Product = require('../models/Product'); // Product model
const mongoose = require('mongoose');
const authMiddleware = require("../config/authMiddleware");

// Checkout Route
router.post('/checkout', authMiddleware("user"), async (req, res) => {
  const { address, paymentType, transactionId } = req.body;
  const userId = req.user.userId; // Assuming user info is stored in req.user (via JWT)

  if (!address || !paymentType || (paymentType === 'paid' && !transactionId)) {
    return res.status(400).json({ message: 'Please provide all required fields: address, payment type, and transaction ID (if paid).' });
  }

  try {
    // Fetch the cart for the user
    const cart = await Cart.findOne({ userId: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Calculate the subtotal and prepare the cart items for order
    let totalPrice = 0;
    const cartItems = [];

    for (let item of cart.items) {
      const product = await Product.findById(item.product);

      // Check if product exists, if not, handle the error
      if (!product) {
        return res.status(400).json({ message: `Product not found for ID: ${item.product}` });
      }

      // Calculate item total price (price * quantity)
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      // Push item details into cartItems array for order
      cartItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        itemTotal, // Store the calculated itemTotal
      });
    }

    // Create a new order document
    const order = new Order({
      buyerId: userId, // Note: Use `buyerId` since your schema expects it
      address,
      paymentType,
      transactionId: paymentType === 'paid' ? transactionId : null, // Only attach transactionId if paid
      items: cartItems,
      totalPrice, // Use the calculated total price
      deliveryDate: new Date(), // Optional: Modify as necessary
    });

    // Save the order to the database
    await order.save();

    // Clear the user's cart after the order is placed
    await Cart.updateOne({ userId: userId }, { $set: { items: [] } });

    // Respond with a success message and the order details
    res.status(200).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: 'Error placing order, please try again.' });
  }
});

module.exports = router;
