import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';
import { User } from '../src/models/User.js';

// ── Categories ──────────────────────────────────────────────────────────────
const categories = [
  { name: 'Baskets',              description: 'Handwoven sisal and sweetgrass baskets.',         imageUrl: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg' },
  { name: 'Paintings',            description: 'Traditional and contemporary Rwandan art.',        imageUrl: 'https://murukali.com/cdn/shop/files/Imigongo-African-wall-art-_sets-of-three_-Murukali-LTD-55781293_276x414.jpg?v=1747511673' },
  { name: 'Wood Carvings',        description: 'Hand-carved wooden sculptures and décor.',         imageUrl: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg' },
  { name: 'Kitchen',              description: 'Handcrafted kitchen and dining accessories.',      imageUrl: 'https://m.media-amazon.com/images/I/71dgtX5E2RL.jpg' },
  { name: 'Jewelry',              description: 'Beaded necklaces, bracelets, and earrings.',       imageUrl: 'https://annakaytes.com/cdn/shop/files/IMG-7618.jpg' },
  { name: 'Pottery',              description: 'Handmade clay and ceramic pieces.',                imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Home Décor',           description: 'Woven and carved home decoration items.',          imageUrl: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg' },
  { name: 'Bags',                 description: 'Handcrafted leather and woven bags.',              imageUrl: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg' },
  { name: 'Gifts',                description: 'Curated Rwandan gift sets and hampers.',           imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81JfJ6IR9uL._SS400_.jpg' },
  { name: 'Games',                description: 'Handmade wooden games and puzzles.',               imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Storage',              description: 'Handwoven storage baskets and organizers.',        imageUrl: 'http://mawuafrica.com/cdn/shop/files/1_71671e07-0786-4b2f-8c9f-5d360a4c0a0e.png?v=1747750568' },
  { name: 'Musical Instruments',  description: 'Traditional Rwandan drums and instruments.',       imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1000&q=80' },
];

// ── Products ─────────────────────────────────────────────────────────────────
const products = [
  { name: 'Agaseke Peace Basket', description: 'Authentic Rwandan Agaseke peace basket handwoven from sisal and sweetgrass.', price: 45000, imageUrl: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg', category: 'Baskets', stock: 60, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Handwoven Sisal Basket', description: 'Durable sisal basket handwoven by skilled Rwandan artisans.', price: 38000, imageUrl: 'https://rwandamart.rw/wp-content/uploads/2026/02/UKC-1-3.png', category: 'Baskets', stock: 80, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Banana Fiber Basket', description: 'Eco-friendly basket woven from natural banana fiber.', price: 32000, imageUrl: 'https://trovewarehouse.com/cdn/shop/products/33024.jpg?v=1649348106&width=1080', category: 'Baskets', stock: 100, isActive: true, badge: 'New Arrival', featured: false },
  { name: 'Imigongo Wall Art', description: 'Traditional Rwandan Imigongo geometric wall art handcrafted using cow dung and natural earth pigments.', price: 68000, imageUrl: 'https://murukali.com/cdn/shop/files/Imigongo-African-wall-art-_sets-of-three_-Murukali-LTD-55781293_276x414.jpg?v=1747511673', category: 'Paintings', stock: 20, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Hand-Painted Canvas Art', description: 'Vibrant hand-painted canvas depicting Rwandan landscapes and culture.', price: 55000, imageUrl: 'https://diybaazar.com/publicuploads/seller/products/handpainted-canvas-wall-art-with-easel-online-1769-2401-1_diybaazar62075ada0fbe8.jpeg', category: 'Paintings', stock: 15, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Wooden Gorilla Sculpture', description: "Hand-carved wooden gorilla statue representing Rwanda's iconic mountain gorillas.", price: 85000, imageUrl: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg', category: 'Wood Carvings', stock: 15, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Wooden Elephant Carving', description: 'Beautifully hand-carved wooden elephant, a symbol of strength and wisdom.', price: 72000, imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=80', category: 'Wood Carvings', stock: 20, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Hand-Carved Walking Stick', description: 'Intricately carved wooden walking stick with traditional Rwandan motifs.', price: 50000, imageUrl: 'https://www.australianwoodwork.com.au/cdn/shop/files/IMG_6982s.jpg?v=1685070697', category: 'Wood Carvings', stock: 30, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Wooden Serving Tray', description: 'Handcrafted wooden serving tray with smooth finish.', price: 28000, imageUrl: 'https://m.media-amazon.com/images/I/71dgtX5E2RL.jpg', category: 'Kitchen', stock: 50, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Beaded Necklace', description: 'Vibrant handmade African beaded necklace crafted by Rwandan women cooperatives.', price: 32000, imageUrl: 'https://kalifano.com/cdn/shop/products/kalifano-gemstone-necklaces-multi-gemstone-beaded-necklace-gold-ngp-015-36887422107842.jpg?v=1677942061&width=3000', category: 'Jewelry', stock: 80, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Beaded Bracelet Set', description: 'Set of colorful handmade beaded bracelets.', price: 18000, imageUrl: 'https://annakaytes.com/cdn/shop/files/IMG-7618.jpg', category: 'Jewelry', stock: 120, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Beaded Earrings', description: 'Handcrafted beaded earrings with traditional African patterns.', price: 15000, imageUrl: 'https://i.etsystatic.com/13465317/r/il/8b441b/1420997537/il_fullxfull.1420997537_sym1.jpg', category: 'Jewelry', stock: 100, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Cow Horn Necklace', description: 'Unique necklace crafted from ethically sourced cow horn.', price: 40000, imageUrl: 'https://cdn.mitchellstores.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOGw5Q2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--c7662245adb39f49a8ce268eb850f56d358235bb/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDam9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2QzNKbGMybDZaVWtpRHpJNE1EQjROREl3TUQ0R093WlVPZ3B6ZEhKcGNGUTZFR0YxZEc4dGIzSnBaVzUwVkRvTWNYVmhiR2wwZVVraUNEYzFKUVk3QmxRPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--2194f4ba90266e988b82b869a61bc64b50c6873c/uploading-986198-jpg20180330-4-92s4.jpg', category: 'Jewelry', stock: 40, isActive: true, badge: 'New Arrival', featured: false },
  { name: 'Handmade Clay Vase', description: 'Elegant handmade clay vase inspired by traditional Rwandan pottery.', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80', category: 'Pottery', stock: 35, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Ceramic Coffee Mug Set', description: 'Set of handmade ceramic coffee mugs with earthy tones.', price: 35000, imageUrl: 'https://www.themudplace.com/cdn/shop/files/Cozy_Rustic_Mug_Set_Handmade.jpg?v=1781884621&width=1946', category: 'Pottery', stock: 50, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Handmade Clay Bowl', description: 'Rustic handmade clay bowl perfect for serving or display.', price: 30000, imageUrl: 'https://i.pinimg.com/736x/72/a0/dd/72a0dd99780274d0b9a14fdee06f809d.jpg', category: 'Pottery', stock: 45, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Woven Picnic Basket', description: 'Large handwoven picnic basket with sturdy handles.', price: 60000, imageUrl: 'https://cdn.shopify.com/s/files/1/1038/7670/products/picnic-baskets-medium-wicker-picnic-basket-classic-amish-woven-wood-w-lid-plain-29536454541415.jpg?v=1759460480', category: 'Home Décor', stock: 25, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Handwoven Table Runner', description: 'Colorful handwoven table runner with traditional Rwandan patterns.', price: 34000, imageUrl: 'https://handwovenmagazine.com/cdn-cgi/image/format=auto/https://www.datocms-assets.com/75077/1656656000-wandering-vine-runner-1.jpg?auto=format&w=1600', category: 'Home Décor', stock: 40, isActive: true, badge: 'Handmade', featured: false },
  { name: 'African Throw Pillow Cover', description: 'Vibrant African-print throw pillow cover handmade from quality fabric.', price: 25000, imageUrl: 'https://i.etsystatic.com/35749210/r/il/755caa/7676774768/il_fullxfull.7676774768_gdce.jpg', category: 'Home Décor', stock: 70, isActive: true, badge: 'New Arrival', featured: false },
  { name: 'Decorative Woven Wall Basket', description: 'Intricately woven wall basket for home decoration.', price: 48000, imageUrl: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg', category: 'Home Décor', stock: 30, isActive: true, badge: 'Best Seller', featured: false },
  { name: 'Decorative Wooden Mask', description: 'Hand-carved decorative wooden mask inspired by African traditions.', price: 65000, imageUrl: 'https://i.etsystatic.com/10838882/r/il/34f880/6418033741/il_570xN.6418033741_bqe0.jpg', category: 'Home Décor', stock: 18, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Leather Handbag', description: 'Premium handcrafted leather handbag with traditional African stitching.', price: 80000, imageUrl: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg', category: 'Bags', stock: 20, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Handwoven Tote Bag', description: 'Eco-friendly handwoven tote bag made from natural fibers.', price: 55000, imageUrl: 'https://img.muji.net/img/item/4550584545320_1260.jpg', category: 'Bags', stock: 35, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Handmade Wallet', description: 'Compact handmade wallet crafted from quality leather with African-inspired detailing.', price: 30000, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80', category: 'Bags', stock: 55, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Rwandan Coffee Gift Set', description: 'Premium Rwandan single-origin coffee gift box.', price: 45000, imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81JfJ6IR9uL._SS400_.jpg', category: 'Gifts', stock: 50, isActive: true, badge: '⭐ Featured', featured: true },
  { name: 'Traditional Tea Gift Box', description: 'Curated gift box of premium Rwandan teas.', price: 38000, imageUrl: 'https://yustea.com/cdn/shop/files/remium-tea-sampler-gift-box.jpg?v=1755483251', category: 'Gifts', stock: 45, isActive: true, badge: 'Made in Rwanda', featured: false },
  { name: 'Artisan Gift Hamper', description: 'A beautifully curated hamper of Rwandan artisan products.', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80', category: 'Gifts', stock: 15, isActive: true, badge: 'New Arrival', featured: false },
  { name: 'Handmade Wooden Chess Set', description: "Fully hand-carved wooden chess set with African-themed pieces.", price: 90000, imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80', category: 'Games', stock: 12, isActive: true, badge: 'New Arrival', featured: false },
  { name: 'Handwoven Storage Basket', description: 'Large handwoven storage basket perfect for organizing your home.', price: 40000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80', category: 'Storage', stock: 55, isActive: true, badge: 'Handmade', featured: false },
  { name: 'Traditional Drum (Ingoma)', description: 'Authentic hand-crafted Rwandan Ingoma drum made from wood and animal hide.', price: 120000, imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1000&q=80', category: 'Musical Instruments', stock: 10, isActive: true, badge: 'New Arrival', featured: false },
];

// ── Admin user ────────────────────────────────────────────────────────────────
const ADMIN = {
  fullName: 'DellCraft Admin',
  email: 'admin@dellcraft.rw',
  password: 'Admin@2026!',
  role: 'admin',
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');

  await mongoose.connect(uri);
  console.log('[seed] Connected to MongoDB');

  // Seed categories
  const catOps = categories.map((c) => ({
    updateOne: { filter: { name: c.name }, update: { $set: c }, upsert: true },
  }));
  const catResult = await Category.bulkWrite(catOps);
  console.log(`[seed] Categories — upserted: ${catResult.upsertedCount}, matched: ${catResult.matchedCount}`);

  // Seed products
  const prodOps = products.map((p) => ({
    updateOne: { filter: { name: p.name }, update: { $set: p }, upsert: true },
  }));
  const prodResult = await Product.bulkWrite(prodOps);
  console.log(`[seed] Products — upserted: ${prodResult.upsertedCount}, matched: ${prodResult.matchedCount}`);

  // Seed admin user
  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`[seed] Admin user already exists: ${ADMIN.email}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN.password, 12);
    await User.create({ fullName: ADMIN.fullName, email: ADMIN.email, passwordHash, role: 'admin' });
    console.log(`[seed] Admin user created: ${ADMIN.email}`);
  }

  await mongoose.connection.close();
  console.log('[seed] Done.');
}

main().catch(async (err) => {
  console.error('[seed] Failed:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
