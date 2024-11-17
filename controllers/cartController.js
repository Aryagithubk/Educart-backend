const Product = require("../models/Product");
const Cart = require("../models/Cart");

// Assuming this is your addToCart API in your backend
const addToCart = async (req, res) => {
  const { id } = req.params; // Get productId from req.params
  const { quantity } = req.body; // Get quantity from req.body
  const productId = id;

  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  const userId = req.user.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingProductIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingProductIndex !== -1) {
        cart.items[existingProductIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    const updatedCart = await cart.save();
    res.status(200).json({ message: "Product added to cart", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// Get all products in the cart
const getCart = async (req, res) => {
  const userId = req.user.userId; // Access userId from authenticated user

  try {
    const cart = await Cart.findOne({ userId }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error getting cart:", error.message);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// Clear the cart
const clearCart = async (req, res) => {
  const userId = req.user.userId; // Access userId from authenticated user

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = { addToCart, getCart, clearCart };
