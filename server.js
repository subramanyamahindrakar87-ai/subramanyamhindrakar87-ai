const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- In-Memory Datasets ---
const foodItems = [
  {
    id: 1,
    name: "Artisanal Margherita Pizza",
    price: 14.99,
    category: "Pizza",
    restaurantId: 1,
    restaurantName: "Bella Italia",
    veg: true,
    vegan: false,
    glutenFree: false,
    rating: 4.8,
    reviewsCount: 142,
    prepTime: "20-25 min",
    calories: 850,
    image: "assets/images/margherita_pizza.png",
    description: "Authentic Italian wood-fired pizza topped with San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves, and extra virgin olive oil.",
    ingredients: ["Wood-fired dough", "San Marzano tomatoes", "Buffalo mozzarella", "Fresh basil", "Olive oil"],
    nutrition: { calories: 850, protein: "32g", carbs: "98g", fat: "28g" }
  },
  {
    id: 2,
    name: "Gourmet Crispy Chicken Burger",
    price: 11.49,
    category: "Burgers",
    restaurantId: 2,
    restaurantName: "Burger Central",
    veg: false,
    vegan: false,
    glutenFree: false,
    rating: 4.9,
    reviewsCount: 230,
    prepTime: "15-20 min",
    calories: 720,
    image: "assets/images/chicken_burger.png",
    description: "Crispy fried buttermilk chicken breast topped with melted sharp cheddar cheese, fresh lettuce, tomato, tangy house mayo on a toasted brioche bun.",
    ingredients: ["Buttermilk chicken", "Brioche bun", "Cheddar cheese", "Lettuce & Tomato", "Secret Mayo"],
    nutrition: { calories: 720, protein: "45g", carbs: "52g", fat: "34g" }
  },
  {
    id: 3,
    name: "Premium Deluxe Sushi Platter",
    price: 24.99,
    category: "Sushi",
    restaurantId: 3,
    restaurantName: "Sakura Sushi Bar",
    veg: false,
    vegan: false,
    glutenFree: true,
    rating: 4.9,
    reviewsCount: 189,
    prepTime: "25-30 min",
    calories: 580,
    image: "assets/images/sushi_platter.png",
    description: "Chef's selection of fresh Atlantic salmon nigiri, spicy tuna maki rolls, avocado rolls, served with pickled ginger, wasabi, and low-sodium soy sauce.",
    ingredients: ["Fresh Salmon", "Saku Tuna", "Sushi Rice", "Nori seaweed", "Avocado", "Wasabi"],
    nutrition: { calories: 580, protein: "38g", carbs: "64g", fat: "14g" }
  },
  {
    id: 4,
    name: "Royal Butter Chicken & Naan",
    price: 16.99,
    category: "Indian",
    restaurantId: 4,
    restaurantName: "Spice Symphony",
    veg: false,
    vegan: false,
    glutenFree: false,
    rating: 4.7,
    reviewsCount: 310,
    prepTime: "25-30 min",
    calories: 920,
    image: "assets/images/butter_chicken.png",
    description: "Tender chicken tikka cooked in a rich, velvety tomato, butter, and cashew gravy. Served with warm butter garlic naan.",
    ingredients: ["Charcoal chicken", "Tomato butter sauce", "Heavy cream", "Garlic Naan", "Kasuri Methi"],
    nutrition: { calories: 920, protein: "42g", carbs: "75g", fat: "48g" }
  },
  {
    id: 5,
    name: "Green Power Buddha Bowl",
    price: 13.50,
    category: "Healthy",
    restaurantId: 5,
    restaurantName: "Green Leaf Bistro",
    veg: true,
    vegan: true,
    glutenFree: true,
    rating: 4.8,
    reviewsCount: 96,
    prepTime: "15 min",
    calories: 450,
    image: "assets/images/buddha_bowl.png",
    description: "Organic quinoa, creamy avocado slices, spiced roasted chickpeas, steamed edamame, shredded red cabbage, and lemon tahini dressing.",
    ingredients: ["Quinoa", "Avocado", "Roasted Chickpeas", "Edamame", "Red Cabbage", "Tahini"],
    nutrition: { calories: 450, protein: "18g", carbs: "58g", fat: "16g" }
  },
  {
    id: 6,
    name: "Molten Chocolate Lava Cake",
    price: 7.99,
    category: "Desserts",
    restaurantId: 1,
    restaurantName: "Bella Italia",
    veg: true,
    vegan: false,
    glutenFree: false,
    rating: 4.9,
    reviewsCount: 215,
    prepTime: "12 min",
    calories: 510,
    image: "assets/images/chocolate_lava.png",
    description: "Warm dark chocolate cake with a rich oozing molten chocolate center, served with a scoop of Madagascar vanilla bean ice cream.",
    ingredients: ["Belgian Dark Chocolate", "Butter", "Eggs", "Vanilla Ice Cream", "Mint Leaf"],
    nutrition: { calories: 510, protein: "8g", carbs: "62g", fat: "26g" }
  }
];

const restaurants = [
  { id: 1, name: "Bella Italia", cuisine: "Italian", rating: 4.8, deliveryTime: "25-30 min", deliveryFee: 2.99, image: "assets/images/margherita_pizza.png", badge: "Super Partner" },
  { id: 2, name: "Burger Central", cuisine: "American", rating: 4.9, deliveryTime: "20-25 min", deliveryFee: 1.99, image: "assets/images/chicken_burger.png", badge: "Trending" },
  { id: 3, name: "Sakura Sushi Bar", cuisine: "Japanese", rating: 4.9, deliveryTime: "30-35 min", deliveryFee: 3.49, image: "assets/images/sushi_platter.png", badge: "Chef's Choice" },
  { id: 4, name: "Spice Symphony", cuisine: "Indian", rating: 4.7, deliveryTime: "25-30 min", deliveryFee: 2.49, image: "assets/images/butter_chicken.png", badge: "Top Rated" },
  { id: 5, name: "Green Leaf Bistro", cuisine: "Healthy", rating: 4.8, deliveryTime: "15-20 min", deliveryFee: 1.99, image: "assets/images/buddha_bowl.png", badge: "Organic" }
];

const coupons = {
  "FRESH20": { discountPercent: 20, description: "20% OFF on all items" },
  "FRESHFREE": { freeDelivery: true, description: "Free Delivery Fee" },
  "WELCOME10": { fixedDiscount: 10, description: "$10 Flat Discount" }
};

let serverOrders = [];

// --- REST API Routes ---

// GET /api/food
app.get('/api/food', (req, res) => {
  let items = [...foodItems];
  const { category, diet, search, sort } = req.query;

  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (diet) {
    if (diet === 'veg') items = items.filter(i => i.veg);
    if (diet === 'nonveg') items = items.filter(i => !i.veg);
    if (diet === 'vegan') items = items.filter(i => i.vegan);
    if (diet === 'glutenfree') items = items.filter(i => i.glutenFree);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }

  if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
  if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/food/:id
app.get('/api/food/:id', (req, res) => {
  const item = foodItems.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  res.json({ success: true, data: restaurants });
});

// POST /api/coupons/apply
app.post('/api/coupons/apply', (req, res) => {
  const { code } = req.body;
  if (!code || !coupons[code.toUpperCase()]) {
    return res.status(400).json({ success: false, message: 'Invalid promo code. Try FRESH20' });
  }
  res.json({ success: true, code: code.toUpperCase(), coupon: coupons[code.toUpperCase()] });
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const { items, address, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
  }

  let subtotal = 0;
  const processedItems = items.map(cItem => {
    const food = foodItems.find(f => f.id === cItem.itemId);
    const itemTotal = (food ? food.price : 0) * cItem.quantity;
    subtotal += itemTotal;
    return {
      id: cItem.itemId,
      name: food ? food.name : 'Food Item',
      price: food ? food.price : 0,
      qty: cItem.quantity
    };
  });

  let deliveryFee = 2.99;
  let tax = subtotal * 0.05;
  let discount = 0;

  if (couponCode && coupons[couponCode.toUpperCase()]) {
    const c = coupons[couponCode.toUpperCase()];
    if (c.discountPercent) discount = subtotal * (c.discountPercent / 100);
    if (c.fixedDiscount) discount = Math.min(subtotal, c.fixedDiscount);
    if (c.freeDelivery) deliveryFee = 0;
  }

  const grandTotal = Math.max(0, subtotal + tax + deliveryFee - discount);

  const newOrder = {
    id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    items: processedItems,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total: grandTotal,
    status: 'Preparing',
    address: address || '742 Evergreen Terrace, Springfield',
    paymentMethod: paymentMethod || 'Credit Card'
  };

  serverOrders.unshift(newOrder);
  res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const order = serverOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    user: {
      name: "Alex Morgan",
      email: email || "alex.morgan@example.com",
      phone: "+1 (555) 234-5678",
      token: "demo-jwt-token-freshbite-2026"
    }
  });
});

// POST /api/payment/process (Online Payment Gateway Simulation)
app.post('/api/payment/process', (req, res) => {
  const { paymentMethod, cardDetails, upiId, amount } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Payment method selection is required' });
  }

  if (paymentMethod === 'card') {
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
      return res.status(400).json({ success: false, message: 'Please complete all card details (Card Number, Expiry, CVV)' });
    }
    const cleanNum = cardDetails.cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 13) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }
  }

  if (paymentMethod === 'upi') {
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid UPI VPA ID (e.g. alex@gpay)' });
    }
  }

  const transactionId = `TXN-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;

  res.json({
    success: true,
    message: 'Payment authorized and processed successfully',
    transactionId,
    paymentStatus: 'PAID',
    paymentMethod,
    amount: amount || 0,
    timestamp: new Date().toISOString()
  });
});

// POST /api/food (Add New Food Item)
app.post('/api/food', (req, res) => {
  const { name, price, category, restaurantName, veg, vegan, glutenFree, image, description, ingredients, calories } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Item name, price, and category are required' });
  }

  const newItem = {
    id: foodItems.length > 0 ? Math.max(...foodItems.map(i => i.id)) + 1 : 1,
    name: name.trim(),
    price: parseFloat(price),
    category: category,
    restaurantId: 1,
    restaurantName: restaurantName || "Chef's Kitchen",
    veg: Boolean(veg),
    vegan: Boolean(vegan),
    glutenFree: Boolean(glutenFree),
    rating: 5.0,
    reviewsCount: 1,
    prepTime: "20 min",
    calories: parseInt(calories) || 450,
    image: image && image.trim() !== '' ? image.trim() : "assets/images/margherita_pizza.png",
    description: description && description.trim() !== '' ? description.trim() : "Freshly prepared gourmet dish crafted with high quality ingredients.",
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map(s => s.trim()) : ["Fresh Ingredients"]),
    nutrition: { calories: parseInt(calories) || 450, protein: "24g", carbs: "52g", fat: "18g" }
  };

  foodItems.unshift(newItem);
  res.status(201).json({ success: true, message: 'Food item added successfully', data: newItem });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(` FreshBite Server running at http://localhost:${PORT}`);
});
