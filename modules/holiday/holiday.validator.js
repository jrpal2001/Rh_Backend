import Joi from "joi";

/**
 * Flight Details Item Validation Schema
 * [{ Flight No, Travel Date, Sector, Departure, Arrival }]
 */
const flightDetailItemSchema = Joi.object({
  flightNo: Joi.string().required().trim().messages({
    "any.required": "Flight number is required (e.g. 6E 1234)",
    "string.empty": "Flight number cannot be empty",
  }),
  travelDate: Joi.string().required().trim().messages({
    "any.required": "Travel date is required (e.g. 15 Nov 2026)",
    "string.empty": "Travel date cannot be empty",
  }),
  sector: Joi.string().required().trim().messages({
    "any.required": "Flight sector is required (e.g. BLR - DPS)",
    "string.empty": "Flight sector cannot be empty",
  }),
  departure: Joi.string().required().trim().messages({
    "any.required": "Departure time/airport is required (e.g. 10:30 AM)",
    "string.empty": "Departure cannot be empty",
  }),
  arrival: Joi.string().required().trim().messages({
    "any.required": "Arrival time/airport is required (e.g. 04:45 PM)",
    "string.empty": "Arrival cannot be empty",
  }),
  airline: Joi.string().optional().allow("").trim().default(""),
  baggage: Joi.string().optional().allow("").trim().default(""),
});

/**
 * Hotels Used Item Validation Schema
 * [{ Location: Kuta, Hotel Name: Grand Zuri / Similar }]
 */
const hotelDetailItemSchema = Joi.object({
  location: Joi.string().required().trim().messages({
    "any.required": "Hotel location is required (e.g. Kuta)",
    "string.empty": "Hotel location cannot be empty",
  }),
  hotelName: Joi.string().required().trim().messages({
    "any.required": "Hotel name is required (e.g. Grand Zuri / Similar)",
    "string.empty": "Hotel name cannot be empty",
  }),
  roomType: Joi.string().optional().allow("").trim().default("Standard / Deluxe Room"),
  starRating: Joi.string().optional().allow("").trim().default("4 Star"),
  nights: Joi.string().optional().allow("").trim().default(""),
});

/**
 * Inclusions / Exclusions Item Validation Schema
 * [{ point: "Return Airfare From Ex Bangalore", isIncluded: true }, { point: "GST & TCS", isIncluded: false }]
 */
const inclusionExclusionItemSchema = Joi.object({
  point: Joi.string().required().trim().messages({
    "any.required": "Inclusion/Exclusion point is required",
    "string.empty": "Inclusion/Exclusion point cannot be empty",
  }),
  isIncluded: Joi.boolean().required().messages({
    "any.required": "isIncluded boolean flag is required (true = Included, false = Excluded)",
  }),
  note: Joi.string().optional().allow("").trim().default(""),
});

/**
 * Detailed Itinerary Item Validation Schema
 * [{ day: "Day 1", title: "Arrival in Bali", points: [...], overnightMeal: "Dinner", overnightStay: "Kuta Hotel" }]
 */
const detailedItineraryItemSchema = Joi.object({
  day: Joi.string().optional().allow("").trim(),
  dayLabel: Joi.string().optional().allow("").trim(),
  title: Joi.string().optional().allow("").trim(),
  dayTitle: Joi.string().optional().allow("").trim(),
  points: Joi.array().items(Joi.string().trim()).optional().default([]),
  overnightMeal: Joi.string().optional().allow("").trim().default(""),
  overnightStay: Joi.string().optional().allow("").trim().default(""),
  dayActivityDetails: Joi.string().optional().allow("").trim().default(""),
}).custom((val) => {
  val.day = val.day || val.dayLabel || "Day 1";
  val.dayLabel = val.day;
  val.title = val.title || val.dayTitle || "Day Plan";
  val.dayTitle = val.title;
  return val;
});

export const createHolidayPackageSchema = Joi.object({
  packageId: Joi.string().optional().allow("").trim(),
  packageName: Joi.string().required().trim().messages({
    "any.required": "Package name is required",
    "string.empty": "Package name cannot be empty",
  }),
  countries: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(1)).min(1),
      Joi.string().trim().min(1)
    )
    .optional(),
  countryOrRegion: Joi.string().optional().allow("").trim(),
  destination: Joi.string().required().trim().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination cannot be empty",
  }),
  duration: Joi.string().required().trim().messages({
    "any.required": "Duration is required (e.g. 5 Days / 4 Nights)",
    "string.empty": "Duration cannot be empty",
  }),
  tourType: Joi.string().optional().trim().default("Customized Tour"),
  groupSize: Joi.string().optional().trim().default("2 - 10 Pax"),
  packagePrice: Joi.number().min(0).required().messages({
    "any.required": "Package price is required",
    "number.min": "Package price cannot be negative",
  }),
  currency: Joi.string().optional().trim().default("INR"),

  // Cover image & gallery images
  coverImage: Joi.string().optional().allow("").trim(),
  image: Joi.string().optional().allow("").trim(),
  images: Joi.array().items(Joi.string().trim()).optional().default([]),

  // TRIP OVERVIEW & KNOW BEFORE YOU GO
  tripOverview: Joi.string().optional().allow("").trim(),
  tourOverviewAndDescription: Joi.string().optional().allow("").trim(),
  knowBeforeYouGo: Joi.array().items(Joi.string().trim()).optional().default([]),

  // FLIGHT DETAILS
  flightDetails: Joi.array().items(flightDetailItemSchema).optional().default([]),

  // HOTELS USED
  hotelsUsed: Joi.array().items(hotelDetailItemSchema).optional().default([]),

  // HIGHLIGHTS
  highlights: Joi.array().items(Joi.string().trim()).optional().default([]),

  // INCLUSIONS & EXCLUSIONS
  inclusionsAndExclusions: Joi.array().items(inclusionExclusionItemSchema).optional().default([]),
  packageInclusions: Joi.array().items(Joi.string().trim()).optional().default([]),
  packageExclusions: Joi.array().items(Joi.string().trim()).optional().default([]),

  // DETAILED ITINERARY
  detailedItinerary: Joi.array().items(detailedItineraryItemSchema).optional().default([]),
  dayByDayItinerary: Joi.array().items(detailedItineraryItemSchema).optional().default([]),

  isActive: Joi.boolean().optional().default(true),
}).custom((value, helpers) => {
  const hasCountries = Array.isArray(value.countries)
    ? value.countries.length > 0
    : Boolean(value.countries && String(value.countries).trim());
  const hasCountryOrRegion = Boolean(value.countryOrRegion && String(value.countryOrRegion).trim());

  if (!hasCountries && !hasCountryOrRegion) {
    return helpers.message("At least one country is required in 'countries' or 'countryOrRegion'");
  }
  return value;
});

export const updateHolidayPackageSchema = Joi.object({
  packageId: Joi.string().optional().trim(),
  packageName: Joi.string().optional().trim(),
  countries: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(1)),
      Joi.string().trim()
    )
    .optional(),
  countryOrRegion: Joi.string().optional().trim(),
  destination: Joi.string().optional().trim(),
  duration: Joi.string().optional().trim(),
  tourType: Joi.string().optional().trim(),
  groupSize: Joi.string().optional().trim(),
  packagePrice: Joi.number().min(0).optional(),
  currency: Joi.string().optional().trim(),

  coverImage: Joi.string().optional().allow("").trim(),
  image: Joi.string().optional().allow("").trim(),
  images: Joi.array().items(Joi.string().trim()).optional(),

  tripOverview: Joi.string().optional().allow("").trim(),
  tourOverviewAndDescription: Joi.string().optional().allow("").trim(),
  knowBeforeYouGo: Joi.array().items(Joi.string().trim()).optional(),

  flightDetails: Joi.array().items(flightDetailItemSchema).optional(),
  hotelsUsed: Joi.array().items(hotelDetailItemSchema).optional(),
  highlights: Joi.array().items(Joi.string().trim()).optional(),

  inclusionsAndExclusions: Joi.array().items(inclusionExclusionItemSchema).optional(),
  packageInclusions: Joi.array().items(Joi.string().trim()).optional(),
  packageExclusions: Joi.array().items(Joi.string().trim()).optional(),

  detailedItinerary: Joi.array().items(detailedItineraryItemSchema).optional(),
  dayByDayItinerary: Joi.array().items(detailedItineraryItemSchema).optional(),

  isActive: Joi.boolean().optional(),
});

export default {
  createHolidayPackageSchema,
  updateHolidayPackageSchema,
};
