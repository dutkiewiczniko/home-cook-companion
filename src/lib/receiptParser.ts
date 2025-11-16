import { supabase } from "@/integrations/supabase/client";

/**
 * Receipt Parser - Foundation for OCR Receipt Scanning
 * 
 * This module will parse receipt images and extract product information.
 * Future implementation will use OCR to extract:
 * - Product names
 * - Quantities/weights
 * - Prices (optional)
 * 
 * For now, this is a stub to establish the data structure.
 */

export interface ParsedReceiptItem {
  productName: string;
  quantity: string; // e.g., "1x", "500g", "2 items"
  weight?: number; // in grams if applicable
  matchedProductId?: string; // ID from products table if matched
  confidence?: number; // OCR confidence (0-1)
}

export interface ParsedReceipt {
  items: ParsedReceiptItem[];
  receiptDate?: string; // ISO date string
  storeName?: string;
}

/**
 * Parse a receipt image and extract product items
 * 
 * @param imageFile - Receipt image file
 * @returns Parsed receipt data
 * 
 * TODO: Implement actual OCR using Lovable AI or external service
 */
export async function parseReceiptImage(imageFile: File): Promise<ParsedReceipt> {
  // Placeholder for future OCR implementation
  console.log("Parsing receipt image:", imageFile.name);
  
  // Future: Call OCR service here
  // const ocrResult = await callOCRService(imageFile);
  
  return {
    items: [],
    receiptDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Match a product name from OCR to existing products in database
 * Uses fuzzy matching to find best match
 * 
 * @param productName - Product name from receipt
 * @returns Matched product ID or null
 */
export async function matchProductByName(productName: string): Promise<string | null> {
  const { data: products } = await supabase
    .from("products")
    .select("id, display_name, brand")
    .ilike("display_name", `%${productName}%`)
    .limit(1);

  if (products && products.length > 0) {
    return products[0].id;
  }

  // Try matching by brand
  const { data: brandProducts } = await supabase
    .from("products")
    .select("id, display_name, brand")
    .not("brand", "is", null)
    .ilike("brand", `%${productName}%`)
    .limit(1);

  if (brandProducts && brandProducts.length > 0) {
    return brandProducts[0].id;
  }

  return null;
}

/**
 * Create a new product from receipt item
 * Sets is_estimate to true for nutrition profile
 * 
 * @param item - Parsed receipt item
 * @returns Created product ID
 */
export async function createProductFromReceiptItem(
  item: ParsedReceiptItem
): Promise<string> {
  // Create nutrition profile with estimated values
  const { data: nutritionProfile, error: nutritionError } = await supabase
    .from("nutrition_profiles")
    .insert({
      food_name: item.productName,
      is_estimate: true,
      energy_kcal: 150, // Default estimate
      protein_g: 5,
      fat_g: 5,
      carbs_g: 20,
      serving_size_g: 100,
    })
    .select()
    .single();

  if (nutritionError) throw nutritionError;

  // Create product linked to nutrition profile
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      display_name: item.productName,
      category: "pantry", // Default category
      nutrition_profile_id: nutritionProfile.id,
    })
    .select()
    .single();

  if (productError) throw productError;

  return product.id;
}

/**
 * Process parsed receipt items and match/create products
 * 
 * @param parsedReceipt - Parsed receipt data
 * @returns Array of items with matched/created product IDs
 */
export async function processReceiptItems(
  parsedReceipt: ParsedReceipt
): Promise<ParsedReceiptItem[]> {
  const processedItems: ParsedReceiptItem[] = [];

  for (const item of parsedReceipt.items) {
    let productId = await matchProductByName(item.productName);

    if (!productId) {
      // Create new product if no match found
      productId = await createProductFromReceiptItem(item);
    }

    processedItems.push({
      ...item,
      matchedProductId: productId,
    });
  }

  return processedItems;
}

/**
 * Add receipt items to kitchen inventory
 * 
 * @param items - Processed receipt items
 * @param userId - User ID
 * @param receiptDate - Receipt date for expiry calculation
 */
export async function addReceiptItemsToKitchen(
  items: ParsedReceiptItem[],
  userId: string,
  receiptDate?: string
): Promise<void> {
  const date = receiptDate || new Date().toISOString().split('T')[0];
  
  // Calculate soft expiry (7 days from receipt date)
  const expiryDate = new Date(date);
  expiryDate.setDate(expiryDate.getDate() + 7);

  const kitchenItems = items
    .filter((item) => item.matchedProductId)
    .map((item) => ({
      user_id: userId,
      name: item.productName,
      quantity: item.quantity,
      category: "pantry" as const, // Default, can be updated
      best_before_date: expiryDate.toISOString().split('T')[0],
    }));

  const { error } = await supabase.from("kitchen_items").insert(kitchenItems);

  if (error) throw error;
}
