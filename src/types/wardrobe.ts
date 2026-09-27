/**
 * Core data model for the wardrobe catalog.
 * Mirrors the "What each item stores" section of the product plan.
 */

export type Category =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory';

/** Where a garment sits when layering for warmth. */
export type LayerRole = 'base' | 'mid' | 'outer';

export type Occasion = 'casual' | 'work' | 'formal' | 'sport' | 'lounge';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type Pattern = 'solid' | 'striped' | 'checked' | 'floral' | 'print' | 'other';

export type FabricWeight = 'light' | 'mid' | 'heavy';

export type LaundryStatus = 'clean' | 'worn' | 'in_wash';

export type ItemColor = {
  /** Hex value such as "#1F2A44". */
  hex: string;
  /** Human name such as "navy". */
  name: string;
};

export type FiberShare = {
  /** Fiber name as printed on the label, e.g. "cotton". */
  fiber: string;
  /** Percentage of the fabric, 0–100. */
  percent: number;
};

export type CareInstructions = {
  washTempC?: number;
  machineWash?: boolean;
  tumbleDry?: boolean;
  iron?: 'none' | 'low' | 'medium' | 'high';
  dryCleanOnly?: boolean;
};

export type ClothingItem = {
  id: string;
  createdAt: string;

  // Images (local file URIs)
  photoUri: string;
  cutoutUri?: string;
  labelPhotoUri?: string;

  // What it is
  category: Category;
  subcategory?: string;
  layerRole?: LayerRole;
  brand?: string;
  size?: string;
  fit?: string;

  // Look
  colors: ItemColor[];
  pattern?: Pattern;
  /** 1 = very casual, 5 = very formal. */
  formality: 1 | 2 | 3 | 4 | 5;

  // Material
  fibers: FiberShare[];
  fabricWeight?: FabricWeight;

  // Weather fit
  /** Estimated insulation in clo (ISO 9920). */
  warmthClo?: number;
  waterResistant?: boolean;
  windResistant?: boolean;
  seasons: Season[];

  // Use
  occasions: Occasion[];
  favorite: boolean;
  notes?: string;

  // Care
  care?: CareInstructions;

  // Life
  wearCount: number;
  lastWornAt?: string;
  laundry: LaundryStatus;
  purchasedAt?: string;
  price?: number;
};

export type MakeupType =
  | 'foundation'
  | 'concealer'
  | 'blush'
  | 'bronzer'
  | 'eyeshadow'
  | 'eyeliner'
  | 'mascara'
  | 'lipstick'
  | 'lip_gloss'
  | 'other';

export type MakeupItem = {
  id: string;
  type: MakeupType;
  brand?: string;
  shadeName?: string;
  color: ItemColor;
  finish?: 'matte' | 'satin' | 'shimmer' | 'gloss';
  undertone?: 'cool' | 'neutral' | 'warm';
  openedAt?: string;
  /** "Use within" months from the open-jar symbol. */
  periodAfterOpeningMonths?: number;
};

export type Mood = 'cozy' | 'sharp' | 'bold' | 'low-key';

export type UserProfile = {
  temperatureUnit: 'C' | 'F';
  /** Negative runs cold, positive runs warm, in °C of feels-like offset. */
  temperatureOffsetC: number;
  undertone?: 'cool' | 'neutral' | 'warm';
  dislikedColors: string[];
  commute?: 'walk' | 'bike' | 'car' | 'transit';
};
