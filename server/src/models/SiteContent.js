import mongoose from 'mongoose';

const heroBannerSchema = new mongoose.Schema({
  title:    { type: String, trim: true, maxlength: 200, default: '' },
  subtitle: { type: String, trim: true, maxlength: 500, default: '' },
  imageUrl: { type: String, trim: true, maxlength: 1000, default: '' },
  linkUrl:  { type: String, trim: true, maxlength: 500, default: '' },
  linkLabel:{ type: String, trim: true, maxlength: 80,  default: '' },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { _id: true });

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },

    // Hero section
    heroTitle:    { type: String, trim: true, maxlength: 200, default: 'Discover authentic artisan treasures' },
    heroSubtitle: { type: String, trim: true, maxlength: 500, default: 'Support local makers, find meaningful gifts.' },
    heroImageUrl: { type: String, trim: true, maxlength: 1000, default: '' },

    // Hero banners (carousel)
    heroBanners: { type: [heroBannerSchema], default: [] },

    // Featured section labels
    featuredTitle:     { type: String, trim: true, maxlength: 120, default: 'Featured products' },
    featuredSubtitle:  { type: String, trim: true, maxlength: 300, default: 'A handpicked selection of our finest artisan pieces' },
    newArrivalsTitle:  { type: String, trim: true, maxlength: 120, default: 'New arrivals' },
    bestSellersTitle:  { type: String, trim: true, maxlength: 120, default: 'Best sellers' },

    // Platform settings
    deliveryFeeThreshold: { type: Number, default: 20000 },    // free delivery above this RWF amount
    platformFeePercent:   { type: Number, default: 15 },       // vendor platform fee %
    riderEarningsPerDelivery: { type: Number, default: 2000 }, // RWF per delivery

    // Announcement bar
    announcementBar: { type: String, trim: true, maxlength: 300,
      default: '🌿 Free delivery on orders over RWF 20,000 · Authentic Rwandan crafts · Support local artisans' },
    announcementActive: { type: Boolean, default: true },

    // Contact info
    contactEmail: { type: String, trim: true, maxlength: 200, default: 'hello@africraft.rw' },
    contactPhone: { type: String, trim: true, maxlength: 30,  default: '+250 794 049 090' },
    contactAddress:{ type: String, trim: true, maxlength: 300, default: 'Kigali, Rwanda' },

    // Social links
    facebookUrl:  { type: String, trim: true, maxlength: 500, default: '' },
    instagramUrl: { type: String, trim: true, maxlength: 500, default: '' },
    twitterUrl:   { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);

/** Get or create the singleton site settings doc */
export async function getSiteContent() {
  let doc = await SiteContent.findOne({ key: 'main' });
  if (!doc) doc = await SiteContent.create({ key: 'main' });
  return doc;
}
