import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";



export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => {
      return acc + order.totalPrice;
    }, 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,  
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

   
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

  
    if (order.status === "Delivered") {
      return res.status(400).json({
        message: "Order already delivered. Status cannot be changed.",
      });
    }

    
    if (status === "Cancelled" && order.status === "Delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled.",
      });
    }

  
    order.status = status;

  
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 



export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

