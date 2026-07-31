import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "animax-demo" },
    update: {},
    create: {
      name: "Animax Demo",
      slug: "animax-demo",
      domain: "demo.animax.example",
      locale: "en",
      currency: "USD",
      countryCode: "US",
      status: "ACTIVE",
    },
  });

  const categorySlugs = [
    "accessories",
    "apparel",
    "figures",
    "plushies",
    "posters",
  ];
  await prisma.category.updateMany({
    where: { tenantId: null, slug: { in: categorySlugs } },
    data: { tenantId: tenant.id },
  });

  const existingProducts = await prisma.product.count({
    where: { tenantId: tenant.id },
  });
  if (existingProducts > 0) {
    console.log("Tenant catalog already seeded. Skipping.");
    return;
  }

  const apparelCat = await prisma.category.findUnique({
    where: { slug: "apparel" },
  });
  const figuresCat = await prisma.category.findUnique({
    where: { slug: "figures" },
  });
  const accessoriesCat = await prisma.category.findUnique({
    where: { slug: "accessories" },
  });
  const postersCat = await prisma.category.findUnique({
    where: { slug: "posters" },
  });

  const brands = {
    yokaiStudio: await prisma.brand.create({
      data: {
        tenantId: tenant.id,
        name: "Yokai Studio",
        slug: "yokai-studio",
        description: "Hand-painted anime statues and figures",
        website: "https://yokaistudio.example",
      },
    }),
    kawaraCo: await prisma.brand.create({
      data: {
        tenantId: tenant.id,
        name: "Kawara Co",
        slug: "kawara-co",
        description: "Streetwear and lifestyle apparel",
        website: "https://kawaraco.example",
      },
    }),
  };

  const productTypes = {
    physical: await prisma.productType.create({
      data: {
        tenantId: tenant.id,
        name: "Physical",
        slug: "physical",
        description: "Tangible goods shipped to the customer",
        hasInventory: true,
        requiresShipping: true,
        isPhysical: true,
      },
    }),
    downloadable: await prisma.productType.create({
      data: {
        tenantId: tenant.id,
        name: "Downloadable",
        slug: "downloadable",
        description: "Digital goods delivered instantly",
        hasInventory: false,
        requiresShipping: false,
        isDownloadable: true,
      },
    }),
    subscription: await prisma.productType.create({
      data: {
        tenantId: tenant.id,
        name: "Subscription",
        slug: "subscription",
        description: "Recurring billing products",
        hasInventory: false,
        requiresShipping: false,
      },
    }),
  };

  const taxCategories = {
    standard: await prisma.taxCategory.create({
      data: {
        tenantId: tenant.id,
        name: "Standard",
        code: "STANDARD",
        description: "Default goods and services",
        isDefault: true,
      },
    }),
    reduced: await prisma.taxCategory.create({
      data: {
        tenantId: tenant.id,
        name: "Reduced",
        code: "REDUCED",
        description: "Reduced-rate essentials",
      },
    }),
  };

  await prisma.taxRate.createMany({
    data: [
      {
        tenantId: tenant.id,
        categoryId: taxCategories.standard.id,
        country: "US",
        region: "CA",
        rate: "0.0725",
      },
      {
        tenantId: tenant.id,
        categoryId: taxCategories.standard.id,
        country: "US",
        region: "NY",
        rate: "0.04",
      },
      {
        tenantId: tenant.id,
        categoryId: taxCategories.reduced.id,
        country: "US",
        region: "CA",
        rate: "0.02",
      },
    ],
  });

  const attributes = {
    material: await prisma.attribute.create({
      data: {
        tenantId: tenant.id,
        name: "Material",
        slug: "material",
        type: "SELECT",
        filterable: true,
        options: { values: ["PVC", "ABS", "Resin", "Cotton", "Polyester"] },
      },
    }),
    size: await prisma.attribute.create({
      data: {
        tenantId: tenant.id,
        name: "Size",
        slug: "size",
        type: "SELECT",
        filterable: true,
        sortable: true,
        options: { values: ["S", "M", "L", "XL"] },
      },
    }),
    releaseYear: await prisma.attribute.create({
      data: {
        tenantId: tenant.id,
        name: "Release Year",
        slug: "release-year",
        type: "NUMBER",
        filterable: true,
        sortable: true,
      },
    }),
    edition: await prisma.attribute.create({
      data: {
        tenantId: tenant.id,
        name: "Edition",
        slug: "edition",
        type: "SELECT",
        options: { values: ["Standard", "Collector", "Exclusive"] },
      },
    }),
  };

  const attributeBySlug: Record<string, string> = {
    material: attributes.material.id,
    size: attributes.size.id,
    "release-year": attributes.releaseYear.id,
    edition: attributes.edition.id,
  };

  const collections = {
    newArrivals: await prisma.collection.create({
      data: {
        tenantId: tenant.id,
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Fresh drops from this season",
        isManual: true,
        isPublished: true,
        sortOrder: 1,
      },
    }),
    bestSellers: await prisma.collection.create({
      data: {
        tenantId: tenant.id,
        name: "Best Sellers",
        slug: "best-sellers",
        description: "The most loved items in the store",
        isManual: false,
        isPublished: true,
        sortOrder: 2,
      },
    }),
    limitedEdition: await prisma.collection.create({
      data: {
        tenantId: tenant.id,
        name: "Limited Edition",
        slug: "limited-edition",
        description: "Rare numbered pieces",
        isManual: true,
        isPublished: true,
        sortOrder: 3,
      },
    }),
  };

  await prisma.collectionRule.createMany({
    data: [
      {
        collectionId: collections.bestSellers.id,
        field: "isFeatured",
        operator: "EQUALS",
        value: true,
      },
      {
        collectionId: collections.limitedEdition.id,
        field: "tags",
        operator: "CONTAINS",
        value: "limited",
      },
    ],
  });

  const products = [
    {
      name: "Nova Guardian 1/7 Scale Figure",
      slug: "nova-guardian-figure",
      description:
        "A hand-painted 1/7 scale figure of the Nova Guardian, featuring a dynamic pose and detailed base.",
      price: 12999,
      compareAtPrice: 14999,
      costPrice: 8000,
      stock: 25,
      sku: "AMX-FIG-001",
      brandId: brands.yokaiStudio.id,
      typeId: productTypes.physical.id,
      taxCategoryId: taxCategories.standard.id,
      weightKg: 1.2,
      requiresShipping: true,
      categoryId: figuresCat?.id ?? null,
      isPublished: true,
      isFeatured: true,
      tags: ["limited", "premium"],
      images: [
        { url: "https://placehold.co/800x800?text=Nova+Guardian", alt: "Nova Guardian figure front view", order: 0 },
        { url: "https://placehold.co/800x800?text=Nova+Guardian+Back", alt: "Nova Guardian figure back view", order: 1 },
      ],
      variants: [
        { sku: "AMX-FIG-001-A", name: "Standard Edition", price: 12999, stock: 25, isDefault: true },
        { sku: "AMX-FIG-001-B", name: "Collector Edition", price: 15999, stock: 10 },
      ],
      values: {
        material: "PVC",
        "release-year": 2025,
        edition: "Collector",
      },
    },
    {
      name: "Shadowline Oversized Hoodie",
      slug: "shadowline-hoodie",
      description:
        "Heavyweight cotton-blend hoodie with a relaxed oversized fit and screen-printed artwork.",
      price: 5999,
      costPrice: 2500,
      stock: 120,
      sku: "AMX-APP-001",
      brandId: brands.kawaraCo.id,
      typeId: productTypes.physical.id,
      taxCategoryId: taxCategories.standard.id,
      weightKg: 0.7,
      requiresShipping: true,
      categoryId: apparelCat?.id ?? null,
      isPublished: true,
      isFeatured: true,
      tags: ["streetwear"],
      images: [
        { url: "https://placehold.co/800x800?text=Shadowline+Hoodie", alt: "Shadowline hoodie", order: 0 },
      ],
      variants: [
        { sku: "AMX-APP-001-S", name: "Size S", price: 5999, stock: 30, options: { size: "S" }, isDefault: true },
        { sku: "AMX-APP-001-M", name: "Size M", price: 5999, stock: 40, options: { size: "M" } },
        { sku: "AMX-APP-001-L", name: "Size L", price: 5999, stock: 35, options: { size: "L" } },
        { sku: "AMX-APP-001-XL", name: "Size XL", price: 5999, stock: 15, options: { size: "XL" } },
      ],
      values: {
        material: "Cotton",
        size: "M",
      },
    },
    {
      name: "Ember Glow Desk Lamp",
      slug: "ember-glow-lamp",
      description:
        "Warm ambient LED desk lamp with stepless dimming and a powder-coated metal shade.",
      price: 4599,
      compareAtPrice: 5499,
      costPrice: 2200,
      stock: 60,
      sku: "AMX-HOME-001",
      brandId: brands.kawaraCo.id,
      typeId: productTypes.physical.id,
      taxCategoryId: taxCategories.standard.id,
      weightKg: 0.9,
      requiresShipping: true,
      categoryId: accessoriesCat?.id ?? null,
      isPublished: true,
      tags: ["home"],
      images: [
        { url: "https://placehold.co/800x800?text=Ember+Glow+Lamp", alt: "Ember Glow desk lamp", order: 0 },
      ],
      variants: [
        { sku: "AMX-HOME-001-A", name: "Matte Black", price: 4599, stock: 40, options: { color: "Black" }, isDefault: true },
        { sku: "AMX-HOME-001-B", name: "Ivory", price: 4599, stock: 20, options: { color: "Ivory" } },
      ],
      values: {
        "release-year": 2024,
        material: "Resin",
      },
    },
    {
      name: "Companion Bot Wallpaper Pack",
      slug: "companion-bot-wallpapers",
      description:
        "A downloadable set of 20 HD wallpapers featuring the Companion Bot series in multiple styles.",
      price: 799,
      costPrice: 100,
      stock: 0,
      sku: "AMX-DL-001",
      typeId: productTypes.downloadable.id,
      taxCategoryId: taxCategories.reduced.id,
      requiresShipping: false,
      categoryId: postersCat?.id ?? null,
      isPublished: true,
      tags: ["digital"],
      images: [
        { url: "https://placehold.co/800x800?text=Companion+Bot", alt: "Companion Bot wallpaper preview", order: 0 },
      ],
      variants: [],
      values: {
        "release-year": 2025,
      },
    },
  ];

  for (const p of products) {
    const { images, variants, values, ...productData } = p;
    const product = await prisma.product.create({
      data: {
        ...productData,
        tenantId: tenant.id,
        images: { create: images },
        variants: { create: variants },
      },
    });

    for (const [slug, value] of Object.entries(values)) {
      const attributeId = attributeBySlug[slug];
      if (!attributeId) continue;
      await prisma.productAttributeValue.create({
        data: { productId: product.id, attributeId, value },
      });
    }

    if (p.slug === "nova-guardian-figure") {
      await prisma.collection.update({
        where: { id: collections.newArrivals.id },
        data: { products: { connect: { id: product.id } } },
      });
      await prisma.collection.update({
        where: { id: collections.limitedEdition.id },
        data: { products: { connect: { id: product.id } } },
      });
      await prisma.subscriptionPlan.create({
        data: {
          tenantId: tenant.id,
          productId: product.id,
          name: "Figure of the Month",
          slug: "figure-of-the-month",
          description: "A curated limited figure delivered every month",
          price: 12999,
          interval: "MONTHLY",
          trialDays: 7,
        },
      });
    }
  }

  await prisma.coupon.createMany({
    data: [
      {
        tenantId: tenant.id,
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        minOrderAmount: 5000,
        maxDiscountAmount: 2000,
        usageLimit: 500,
        perCustomerLimit: 1,
        isActive: true,
        description: "10% off your first order over $50",
      },
      {
        tenantId: tenant.id,
        code: "FREESHIP",
        type: "FREE_SHIPPING",
        value: 0,
        minOrderAmount: 7500,
        isActive: true,
        description: "Free shipping on orders over $75",
      },
    ],
  });

  const novaFigure = await prisma.product.findUnique({
    where: { sku: "AMX-FIG-001" },
  });
  if (novaFigure) {
    const demoReview = await prisma.review.create({
      data: {
        tenantId: tenant.id,
        productId: novaFigure.id,
        rating: 5,
        title: "Stunning detail",
        body: "The paintwork and base are exceptional. Highly recommended.",
        status: "APPROVED",
        isVerified: true,
        helpfulCount: 12,
        media: {
          create: {
            url: "https://placehold.co/800x800?text=Review+Photo",
            type: "IMAGE",
          },
        },
      },
    });
    await prisma.reviewMedia.create({
      data: {
        reviewId: demoReview.id,
        url: "https://placehold.co/800x800?text=Review+Photo+2",
        type: "IMAGE",
        sortOrder: 1,
      },
    });
  }

  const aboutPage = await prisma.cmsPage.create({
    data: {
      tenantId: tenant.id,
      title: "About Us",
      slug: "about",
      markdown:
        "Animax Store curates premium anime figures, streetwear, and lifestyle goods.",
      metaTitle: "About Animax Store",
      metaDescription: "Learn more about Animax Store and our curation process.",
      isPublished: true,
      publishedAt: new Date(),
      blocks: {
        create: [
          {
            tenantId: tenant.id,
            name: "Mission",
            type: "richtext",
            content: { html: "<p>We bring the anime community the best collectibles.</p>" },
            sortOrder: 1,
          },
          {
            tenantId: tenant.id,
            name: "CTA",
            type: "callout",
            content: { title: "Shop the drop", link: "/collections/new-arrivals" },
            sortOrder: 2,
          },
        ],
      },
      media: {
        create: [
          { tenantId: tenant.id, url: "https://placehold.co/1200x400?text=About+Hero", alt: "About hero image", width: 1200, height: 400 },
        ],
      },
    },
  });

  await prisma.cmsPage.create({
    data: {
      tenantId: tenant.id,
      title: "Shipping Policy",
      slug: "shipping-policy",
      markdown: "Orders ship within 24 hours. Free shipping on orders over $75.",
      metaTitle: "Shipping Policy",
      isPublished: false,
      sortOrder: 2,
    },
  });

  const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
    where: { tenantId: tenant.id },
  });
  if (subscriptionPlan) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: subscriptionPlan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        providerReference: "demo-sub-0001",
      },
    });
  }

  console.log(
    `Seeded tenant "${tenant.slug}" with 4 products, ${Object.keys(brands).length} brands, ${Object.keys(collections).length} collections, CMS page "${aboutPage.slug}", and 2 coupons.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
