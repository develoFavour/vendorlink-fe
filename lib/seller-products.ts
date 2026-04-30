export type SellerProduct = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  stock: number;
  soldCount: number;
  averageRating: number;
  totalReviews: number;
  brand: string;
  shortDescription: string;
  category: string;
  status: "Published" | "Draft";
  image: string;
  gallery: string[];
  color: string;
  dateListed: string;
  description: string;
  sku: string;
  weight: string;
  deliveryNote: string;
  sizes: string[];
  tags: string[];
  specifications: {
    material: string;
    care: string;
    packageDimensions: string;
    department: string;
    protection: string;
    dateFirstAvailable: string;
  };
  stylingIdeas: {
    name: string;
    price: number;
    image: string;
  }[];
};

export const sellerProducts: SellerProduct[] = [
  {
    id: "PROD-101",
    name: "Wireless Noise-Cancelling Headphones",
    price: 15000,
    compareAtPrice: 22000,
    discountPercent: 32,
    stock: 12,
    soldCount: 0,
    averageRating: 0,
    totalReviews: 0,
    brand: "VendorLink Audio",
    shortDescription: "Wireless listening with noise cancellation for commutes and work.",
    category: "Electronics",
    status: "Published",
    image: "/product_headphones.png",
    gallery: ["/product_headphones.png", "/hero_lifestyle.png", "/product_headphones.png"],
    color: "#E8EDF3",
    dateListed: "May 15, 2026",
    description: "Compact wireless headphones with active noise cancellation and long battery life.",
    sku: "VL-ELEC-101",
    weight: "0.45kg",
    deliveryNote: "Same-day pickup available within Lagos mainland.",
    sizes: ["One Size"],
    tags: ["wireless", "audio", "electronics"],
    specifications: {
      material: "ABS plastic, soft foam ear pads",
      care: "Wipe with a dry microfiber cloth",
      packageDimensions: "18 x 16 x 8 cm; 450 g",
      department: "Unisex",
      protection: "Padded travel case included",
      dateFirstAvailable: "May 15, 2026",
    },
    stylingIdeas: [
      { name: "Portable Charging Cable", price: 2500, image: "/product_headphones.png" },
      { name: "Soft Travel Pouch", price: 3500, image: "/hero_lifestyle.png" },
    ],
  },
  {
    id: "PROD-102",
    name: "Ankara Royal Print Fabric (6 Yards)",
    price: 12500,
    compareAtPrice: 16000,
    discountPercent: 22,
    stock: 24,
    soldCount: 0,
    averageRating: 0,
    totalReviews: 0,
    brand: "Lagos Couture",
    shortDescription: "Premium royal print fabric for custom outfits and event wear.",
    category: "Fashion",
    status: "Published",
    image: "/hero_lifestyle.png",
    gallery: ["/hero_lifestyle.png", "/product_headphones.png", "/hero_lifestyle.png"],
    color: "#F3EDE5",
    dateListed: "May 12, 2026",
    description: "Premium Ankara fabric bundle for custom outfits, events, and everyday wear.",
    sku: "VL-FASH-102",
    weight: "0.9kg",
    deliveryNote: "Folded and packaged in moisture-safe wrapping.",
    sizes: ["6 Yards", "12 Yards"],
    tags: ["ankara", "fabric", "fashion"],
    specifications: {
      material: "Cotton wax print",
      care: "Hand wash cold, dry away from direct sunlight",
      packageDimensions: "27.3 x 24.8 x 4.9 cm; 180 g",
      department: "Women",
      protection: "Moisture wrapping, easy care",
      dateFirstAvailable: "May 12, 2026",
    },
    stylingIdeas: [
      { name: "Tailor Measuring Tape", price: 1200, image: "/product_headphones.png" },
      { name: "Fashion Button Set", price: 1800, image: "/hero_lifestyle.png" },
    ],
  },
  {
    id: "PROD-103",
    name: "Sleek Leather Crossbody Bag",
    price: 18000,
    compareAtPrice: 24500,
    discountPercent: 27,
    stock: 5,
    soldCount: 0,
    averageRating: 0,
    totalReviews: 0,
    brand: "Urban Craft",
    shortDescription: "Minimal crossbody bag with everyday storage and adjustable strap.",
    category: "Fashion",
    status: "Published",
    image: "/hero_lifestyle.png",
    gallery: ["/hero_lifestyle.png", "/product_headphones.png", "/hero_lifestyle.png"],
    color: "#F3E8E5",
    dateListed: "May 10, 2026",
    description: "Minimal leather crossbody bag with adjustable strap and inner compartments.",
    sku: "VL-FASH-103",
    weight: "0.65kg",
    deliveryNote: "Protective dust bag included.",
    sizes: ["Small", "Medium"],
    tags: ["bag", "leather", "fashion"],
    specifications: {
      material: "Synthetic leather, cotton lining",
      care: "Clean with soft damp cloth",
      packageDimensions: "22 x 18 x 7 cm; 650 g",
      department: "Women",
      protection: "Dust bag included",
      dateFirstAvailable: "May 10, 2026",
    },
    stylingIdeas: [
      { name: "Leather Care Kit", price: 3500, image: "/product_headphones.png" },
      { name: "Matching Wallet", price: 6500, image: "/hero_lifestyle.png" },
    ],
  },
  {
    id: "PROD-104",
    name: "Organic Honeycomb Jar",
    price: 4500,
    compareAtPrice: 6000,
    discountPercent: 25,
    stock: 0,
    soldCount: 0,
    averageRating: 0,
    totalReviews: 0,
    brand: "Market Fresh",
    shortDescription: "Locally sourced honeycomb jar for natural sweetening.",
    category: "Groceries",
    status: "Draft",
    image: "/product_headphones.png",
    gallery: ["/product_headphones.png", "/hero_lifestyle.png", "/product_headphones.png"],
    color: "#EDF3E8",
    dateListed: "May 02, 2026",
    description: "Locally sourced honeycomb jar for breakfast, baking, and natural sweetening.",
    sku: "VL-GROC-104",
    weight: "0.5kg",
    deliveryNote: "Restock required before publishing.",
    sizes: ["500g", "1kg"],
    tags: ["honey", "groceries", "organic"],
    specifications: {
      material: "Raw honeycomb",
      care: "Store sealed at room temperature",
      packageDimensions: "10 x 10 x 14 cm; 500 g",
      department: "Groceries",
      protection: "Sealed jar packaging",
      dateFirstAvailable: "May 02, 2026",
    },
    stylingIdeas: [
      { name: "Breakfast Oats", price: 2200, image: "/hero_lifestyle.png" },
      { name: "Herbal Tea Pack", price: 3000, image: "/product_headphones.png" },
    ],
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const getSellerProductById = (id: string) =>
  sellerProducts.find((product) => product.id.toLowerCase() === id.toLowerCase());
