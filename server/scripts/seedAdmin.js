import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/africraft-rwanda';

const userSchema = new mongoose.Schema({
  fullName: String, email: String, passwordHash: String,
  role: { type: String, default: 'customer' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String, description: String, imageUrl: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User     = mongoose.models.User     || mongoose.model('User',     userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const USERS = [
  { fullName: 'Admin User',    email: 'admin@dellcraft.rw',    password: 'Admin@2026!', role: 'admin'    },
  { fullName: 'Vendor User',   email: 'vendor@dellcraft.rw',   password: 'Admin@2026!', role: 'vendor'   },
  { fullName: 'Rider User',    email: 'rider@dellcraft.rw',    password: 'Admin@2026!', role: 'rider'    },
  { fullName: 'Test Customer', email: 'customer@dellcraft.rw', password: 'Admin@2026!', role: 'customer' },
];

const CATEGORIES = [
  { name: 'Baskets',              description: 'Handwoven sisal and banana fiber baskets',       imageUrl: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg' },
  { name: 'Paintings',            description: 'Traditional Imigongo and canvas art',             imageUrl: 'https://murukali.com/cdn/shop/files/Imigongo-African-wall-art-_sets-of-three_-Murukali-LTD-55781293_276x414.jpg?v=1747511673' },
  { name: 'Wood Carvings',        description: 'Hand-carved wooden sculptures and décor',         imageUrl: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg' },
  { name: 'Jewelry',              description: 'Beaded necklaces, bracelets and earrings',        imageUrl: 'https://kalifano.com/cdn/shop/products/kalifano-gemstone-necklaces-multi-gemstone-beaded-necklace-gold-ngp-015-36887422107842.jpg?v=1677942061&width=3000' },
  { name: 'Pottery',              description: 'Handmade clay vases, bowls and mugs',             imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80' },
  { name: 'Home Décor',           description: 'Woven runners, pillows and wall art',             imageUrl: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg' },
  { name: 'Bags',                 description: 'Leather handbags and woven tote bags',            imageUrl: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg' },
  { name: 'Gifts',                description: 'Rwandan coffee, tea and artisan hampers',         imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81JfJ6IR9uL._SS400_.jpg' },
  { name: 'Kitchen',              description: 'Wooden trays, bowls and kitchen accessories',     imageUrl: 'https://m.media-amazon.com/images/I/71dgtX5E2RL.jpg' },
  { name: 'Games',                description: 'Hand-carved chess sets and traditional games',    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Storage',              description: 'Handwoven storage baskets for the home',          imageUrl: 'http://mawuafrica.com/cdn/shop/files/1_71671e07-0786-4b2f-8c9f-5d360a4c0a0e.png?v=1747750568' },
  { name: 'Musical Instruments',  description: 'Traditional Rwandan drums and instruments',       imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80' },
];

await mongoose.connect(MONGO_URI);

// Seed users
for (const u of USERS) {
  const hash = await bcrypt.hash(u.password, 10);
  await User.findOneAndUpdate(
    { email: u.email },
    { fullName: u.fullName, email: u.email, passwordHash: hash, role: u.role, isActive: true },
    { upsert: true, new: true }
  );
  console.log(`✓ ${u.role}: ${u.email}`);
}

// Seed categories
for (const c of CATEGORIES) {
  await Category.findOneAndUpdate(
    { name: c.name },
    { ...c, isActive: true },
    { upsert: true, new: true }
  );
  console.log(`✓ category: ${c.name}`);
}

await mongoose.disconnect();
console.log('\nAll done. Users: 4, Categories: ' + CATEGORIES.length);
