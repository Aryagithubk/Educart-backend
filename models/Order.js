// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: { type: Number, default: 1 },
//         price: { type: Number, required: true }, // Store price at the time of order
//       },
//     ],
//     totalPrice: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "paid", "delivered"],
//       default: "pending", // Default to 'pending' until payment is processed or delivered
//     },
//     deliveryDate: {
//       type: Date,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["Paid", "Cash on Delivery"],
//       default: "Cash on Delivery", // Default to Cash on Delivery if no transaction is made
//     },
//     transactionId: {
//       type: String,
//       default: null, // Store transaction ID if payment is made via an external service like Stripe
//     },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true } // Mongoose will automatically add `createdAt` and `updatedAt` timestamps
// );

// module.exports = mongoose.model("Order", orderSchema);
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 }, // percentage discount
        extraFees: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        itemTotal: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    deliveryDate: { 
      type: Date, 
      required: true,
      default: Date.now()
    },
    paymentType: {
      type: String,
      enum: ["cod", "paid"],
      default: "cod",
    },
    transactionId: { type: String }, // Optional, used for paid orders
    isDelivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
