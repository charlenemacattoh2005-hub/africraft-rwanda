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
    imageUrl: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg',
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
    imageUrl: 'https://rwandamart.rw/wp-content/uploads/2026/02/UKC-1-3.png',
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
    imageUrl: 'https://trovewarehouse.com/cdn/shop/products/33024.jpg?v=1649348106&width=1080',
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
    imageUrl: 'https://murukali.com/cdn/shop/files/Imigongo-African-wall-art-_sets-of-three_-Murukali-LTD-55781293_276x414.jpg?v=1747511673',
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
    imageUrl: 'https://diybaazar.com/publicuploads/seller/products/handpainted-canvas-wall-art-with-easel-online-1769-2401-1_diybaazar62075ada0fbe8.jpeg',
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
    imageUrl: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg',
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
    imageUrl: 'http://gogalgaistore.com/cdn/shop/files/ElephantCarvingbrown1.jpg?v=1705555886',
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
    imageUrl: 'https://www.australianwoodwork.com.au/cdn/shop/files/IMG_6982s.jpg?v=1685070697',
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
    imageUrl: 'https://m.media-amazon.com/images/I/71dgtX5E2RL.jpg',
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
    imageUrl: 'https://kalifano.com/cdn/shop/products/kalifano-gemstone-necklaces-multi-gemstone-beaded-necklace-gold-ngp-015-36887422107842.jpg?v=1677942061&width=3000',
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
    imageUrl: 'https://annakaytes.com/cdn/shop/files/IMG-7618.jpg',
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
    imageUrl: 'https://i.etsystatic.com/13465317/r/il/8b441b/1420997537/il_fullxfull.1420997537_sym1.jpg',
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
    imageUrl: 'https://cdn.mitchellstores.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOGw5Q2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--c7662245adb39f49a8ce268eb850f56d358235bb/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDam9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2QzNKbGMybDZaVWtpRHpJNE1EQjROREl3TUQ0R093WlVPZ3B6ZEhKcGNGUTZFR0YxZEc4dGIzSnBaVzUwVkRvTWNYVmhiR2wwZVVraUNEYzFKUVk3QmxRPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--2194f4ba90266e988b82b869a61bc64b50c6873c/uploading-986198-jpg20180330-4-92s4.jpg',
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
    imageUrl: 'https://www.themudplace.com/cdn/shop/files/Cozy_Rustic_Mug_Set_Handmade.jpg?v=1781884621&width=1946',
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
    imageUrl: 'https://i.pinimg.com/736x/72/a0/dd/72a0dd99780274d0b9a14fdee06f809d.jpg',
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
    imageUrl: 'https://cdn.shopify.com/s/files/1/1038/7670/products/picnic-baskets-medium-wicker-picnic-basket-classic-amish-woven-wood-w-lid-plain-29536454541415.jpg?v=1759460480',
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
    imageUrl: 'https://handwovenmagazine.com/cdn-cgi/image/format=auto/https://www.datocms-assets.com/75077/1656656000-wandering-vine-runner-1.jpg?auto=format&w=1600',
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
    imageUrl: 'https://i.etsystatic.com/35749210/r/il/755caa/7676774768/il_fullxfull.7676774768_gdce.jpg',
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
    imageUrl: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg',
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
    imageUrl: 'https://i.etsystatic.com/10838882/r/il/34f880/6418033741/il_570xN.6418033741_bqe0.jpg',
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
    imageUrl: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg',
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
    imageUrl: 'https://img.muji.net/img/item/4550584545320_1260.jpg',
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
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81JfJ6IR9uL._SS400_.jpg',
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
    imageUrl: 'https://yustea.com/cdn/shop/files/remium-tea-sampler-gift-box.jpg?v=1755483251',
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
    imageUrl: 'http://curatedwithconscience.com.au/cdn/shop/files/Love-Your-Work-Appreciation-Hamper_267afd3d-e72c-4abc-af95-91302670e20f.jpg?v=1759062654',
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
    imageUrl: 'http://mawuafrica.com/cdn/shop/files/1_71671e07-0786-4b2f-8c9f-5d360a4c0a0e.png?v=1747750568',
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
