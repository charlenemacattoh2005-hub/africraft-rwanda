import dotenv from 'dotenv';
import { Product } from '../src/models/Product.js';
import mongoose from 'mongoose';

const envPath = new URL('../.env', import.meta.url).pathname;
dotenv.config({ path: envPath });

const products = [
  // Baskets
  {
    name: 'Agaseke Peace Basket',
    description: 'Authentic Rwandan Agaseke peace basket handwoven from sisal and sweetgrass. A symbol of peace and unity, perfect for gifting or home display.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b0?auto=format&fit=crop&w=1000&q=80',
    category: 'Baskets',
    stock: 60,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Handwoven Sisal Basket',
    description: 'Durable sisal basket handwoven by skilled Rwandan artisans. Ideal for storage, shopping, or as a decorative accent.',
    price: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=80',
    category: 'Baskets',
    stock: 80,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  {
    name: 'Banana Fiber Basket',
    description: 'Eco-friendly basket woven from natural banana fiber. Lightweight, sustainable, and uniquely Rwandan.',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?auto=format&fit=crop&w=1000&q=80',
    category: 'Baskets',
    stock: 100,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
  // Paintings
  {
    name: 'Imigongo Wall Art',
    description: 'Traditional Rwandan Imigongo geometric wall art handcrafted using cow dung and natural earth pigments. A unique cultural masterpiece.',
    price: 68000,
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80',
    category: 'Paintings',
    stock: 20,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Hand-Painted Canvas Art',
    description: 'Vibrant hand-painted canvas depicting Rwandan landscapes and culture. Each piece is one-of-a-kind.',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=80',
    category: 'Paintings',
    stock: 15,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Wood Carvings
  {
    name: 'Wooden Gorilla Sculpture',
    description: "Hand-carved wooden gorilla statue representing Rwanda's iconic mountain gorillas. A meaningful gift and collector's piece.",
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=80',
    category: 'Wood Carvings',
    stock: 15,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Wooden Elephant Carving',
    description: 'Beautifully hand-carved wooden elephant, a symbol of strength and wisdom. Makes a stunning home décor piece.',
    price: 72000,
    imageUrl: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=1000&q=80',
    category: 'Wood Carvings',
    stock: 20,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  {
    name: 'Hand-Carved Walking Stick',
    description: 'Intricately carved wooden walking stick with traditional Rwandan motifs. Functional and artistic.',
    price: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    category: 'Wood Carvings',
    stock: 30,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Kitchen
  {
    name: 'Wooden Serving Tray',
    description: 'Handcrafted wooden serving tray with smooth finish. Perfect for breakfast in bed or entertaining guests.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80',
    category: 'Kitchen',
    stock: 50,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  // Jewelry
  {
    name: 'Beaded Necklace',
    description: 'Vibrant handmade African beaded necklace crafted by Rwandan women cooperatives. Lightweight and perfect for everyday wear.',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1000&q=80',
    category: 'Jewelry',
    stock: 80,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Beaded Bracelet Set',
    description: 'Set of colorful handmade beaded bracelets. Mix and match for a vibrant, cultural look.',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&fit=crop&w=1000&q=80',
    category: 'Jewelry',
    stock: 120,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  {
    name: 'Beaded Earrings',
    description: 'Handcrafted beaded earrings with traditional African patterns. Lightweight and elegant for any occasion.',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
    category: 'Jewelry',
    stock: 100,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  {
    name: 'Cow Horn Necklace',
    description: 'Unique necklace crafted from ethically sourced cow horn. A bold statement piece rooted in Rwandan tradition.',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    category: 'Jewelry',
    stock: 40,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
  // Pottery
  {
    name: 'Handmade Clay Vase',
    description: 'Elegant handmade clay vase inspired by traditional Rwandan pottery. Perfect for flowers or as a standalone décor piece.',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
    category: 'Pottery',
    stock: 35,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of handmade ceramic coffee mugs with earthy tones. Great for your morning brew or as a thoughtful gift.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80',
    category: 'Pottery',
    stock: 50,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  {
    name: 'Handmade Clay Bowl',
    description: 'Rustic handmade clay bowl perfect for serving or display. Each piece is unique with natural variations.',
    price: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80',
    category: 'Pottery',
    stock: 45,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Home Décor
  {
    name: 'Woven Picnic Basket',
    description: 'Large handwoven picnic basket with sturdy handles. Perfect for outdoor outings or stylish kitchen storage.',
    price: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80',
    category: 'Home Décor',
    stock: 25,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  {
    name: 'Handwoven Table Runner',
    description: 'Colorful handwoven table runner with traditional Rwandan patterns. Adds warmth and culture to any dining table.',
    price: 34000,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    category: 'Home Décor',
    stock: 40,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  {
    name: 'African Throw Pillow Cover',
    description: 'Vibrant African-print throw pillow cover handmade from quality fabric. Instantly transforms any living space.',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    category: 'Home Décor',
    stock: 70,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
  {
    name: 'Decorative Woven Wall Basket',
    description: 'Intricately woven wall basket for home decoration. A beautiful fusion of art and craft from Rwanda.',
    price: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
    category: 'Home Décor',
    stock: 30,
    isActive: true,
    badge: 'Best Seller',
    featured: false,
  },
  {
    name: 'Decorative Wooden Mask',
    description: 'Hand-carved decorative wooden mask inspired by African traditions. A striking wall art piece.',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1000&q=80',
    category: 'Home Décor',
    stock: 18,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Bags
  {
    name: 'Leather Handbag',
    description: 'Premium handcrafted leather handbag with traditional African stitching. Stylish, spacious, and built to last.',
    price: 80000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
    category: 'Bags',
    stock: 20,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Handwoven Tote Bag',
    description: 'Eco-friendly handwoven tote bag made from natural fibers. Spacious, durable, and perfect for daily use.',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80',
    category: 'Bags',
    stock: 35,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  {
    name: 'Handmade Wallet',
    description: 'Compact handmade wallet crafted from quality leather with African-inspired detailing. A practical everyday accessory.',
    price: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
    category: 'Bags',
    stock: 55,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Gifts
  {
    name: 'Rwandan Coffee Gift Set',
    description: 'Premium Rwandan single-origin coffee gift box. Sourced from the hills of Rwanda and roasted to perfection—ideal for coffee lovers.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80',
    category: 'Gifts',
    stock: 50,
    isActive: true,
    badge: '⭐ Featured',
    featured: true,
  },
  {
    name: 'Traditional Tea Gift Box',
    description: 'Curated gift box of premium Rwandan teas. A warm and thoughtful gift for any occasion.',
    price: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1000&q=80',
    category: 'Gifts',
    stock: 45,
    isActive: true,
    badge: 'Made in Rwanda',
    featured: false,
  },
  {
    name: 'Artisan Gift Hamper',
    description: 'A beautifully curated hamper of Rwandan artisan products—baskets, coffee, jewelry, and more. The ultimate gift.',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1000&q=80',
    category: 'Gifts',
    stock: 15,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
  // Games
  {
    name: 'Handmade Wooden Chess Set',
    description: "Fully hand-carved wooden chess set with African-themed pieces. A collector's item and a great family game.",
    price: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80',
    category: 'Games',
    stock: 12,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
  // Storage
  {
    name: 'Handwoven Storage Basket',
    description: 'Large handwoven storage basket perfect for organizing your home. Strong, stylish, and sustainably made.',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=80',
    category: 'Storage',
    stock: 55,
    isActive: true,
    badge: 'Handmade',
    featured: false,
  },
  // Musical Instruments
  {
    name: 'Traditional Drum (Ingoma)',
    description: 'Authentic hand-crafted Rwandan Ingoma drum made from wood and animal hide. Used in traditional ceremonies and performances.',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1000&q=80',
    category: 'Musical Instruments',
    stock: 10,
    isActive: true,
    badge: 'New Arrival',
    featured: false,
  },
];

function buildBulkOps(items) {
  return items.map((p) => ({
    updateOne: {
      filter: { name: p.name },
      update: { $set: p },
      upsert: true,
    },
  }));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI not set. Provide it as an environment variable when running the script, e.g. $env:MONGODB_URI="mongodb://127.0.0.1:27017/africraft"'
    );
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  const ops = buildBulkOps(products);

  const result = await Product.bulkWrite(ops, { ordered: true });
  console.log('[seedProducts] Done:', {
    matched: result.matchedCount,
    upserted: result.upsertedCount,
  });

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error('[seedProducts] Failed:', err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
