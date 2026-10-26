import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Flight Details Schema
 * e.g. Flight No, Travel Date, Sector, Departure, Arrival
 */
const flightDetailSchema = new Schema({
  flightNo: {
    type: String,
    required: true,
    trim: true, // e.g. "6E 1234"
  },
  travelDate: {
    type: String,
    required: true,
    trim: true, // e.g. "12 Nov 2026" or "2026-11-12"
  },
  sector: {
    type: String,
    required: true,
    trim: true, // e.g. "BLR - DPS" or "Bangalore to Bali"
  },
  departure: {
    type: String,
    required: true,
    trim: true, // e.g. "10:30 AM" or "BLR 10:30 AM"
  },
  arrival: {
    type: String,
    required: true,
    trim: true, // e.g. "04:45 PM" or "DPS 04:45 PM"
  },
  airline: {
    type: String,
    default: "",
    trim: true, // e.g. "IndiGo", "Air India", "Batik Air"
  },
  baggage: {
    type: String,
    default: "",
    trim: true, // e.g. "20kg check-in, 7kg cabin"
  },
});

/**
 * Hotels Used Schema
 * e.g. Location: Kuta, Hotel Name: Grand Zuri / Similar
 */
const hotelDetailSchema = new Schema({
  location: {
    type: String,
    required: true,
    trim: true, // e.g. "Kuta", "Seminyak", "Ubud"
  },
  hotelName: {
    type: String,
    required: true,
    trim: true, // e.g. "Grand Zuri / Similar"
  },
  roomType: {
    type: String,
    default: "Standard / Deluxe Room",
    trim: true,
  },
  starRating: {
    type: String,
    default: "4 Star",
    trim: true,
  },
  nights: {
    type: String,
    default: "",
    trim: true, // e.g. "3 Nights"
  },
});

/**
 * Point-based Inclusions & Exclusions Schema
 * Allows declaring each point and whether it is included (true) or excluded / not given (false)
 * e.g.
 * - Return Airfare From Ex Bangalore: true
 * - GST & TCS 5%: false
 */
const inclusionExclusionItemSchema = new Schema({
  point: {
    type: String,
    required: true,
    trim: true, // e.g. "Return Airfare From Ex Bangalore", "GST & TCS 5%"
  },
  isIncluded: {
    type: Boolean,
    required: true,
    default: true, // true = Included, false = Not Included / Excluded
  },
  note: {
    type: String,
    default: "",
    trim: true, // optional footnote/explanation
  },
});

/**
 * Detailed Itinerary Schema
 * e.g. Day 1, Title, Points array, Overnight Meal, Overnight Stay
 */
const detailedItinerarySchema = new Schema({
  day: {
    type: String,
    required: true,
    trim: true, // e.g. "Day 1", "Day 2"
  },
  dayLabel: {
    type: String,
    default: "",
    trim: true, // alias for day (e.g. "Day 1")
  },
  title: {
    type: String,
    required: true,
    trim: true, // e.g. "Arrival in Bali & Hotel Check-in"
  },
  dayTitle: {
    type: String,
    default: "",
    trim: true, // alias for title
  },
  points: {
    type: [String],
    default: [], // e.g. ["Pick up from Denpasar Airport", "Check-in at hotel and relax", "Evening at leisure"]
  },
  overnightMeal: {
    type: String,
    default: "",
    trim: true, // e.g. "Dinner", "Breakfast & Dinner", "None (Meals on own)"
  },
  overnightStay: {
    type: String,
    default: "",
    trim: true, // e.g. "Overnight at Grand Zuri Hotel, Kuta"
  },
  dayActivityDetails: {
    type: String,
    default: "",
    trim: true, // optional long paragraph description
  },
});

const holidayPackageSchema = new Schema(
  {
    packageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true, // cover image
    },
    images: {
      type: [String],
      default: [], // gallery images
    },
    duration: {
      type: String,
      required: true,
      trim: true, // e.g. "5 Days / 4 Nights"
    },
    tourType: {
      type: String,
      default: "Customized Tour",
      trim: true, // e.g. "Customized Tour", "Group Tour", "Family", "Honeymoon", "Adventure"
    },
    groupSize: {
      type: String,
      default: "2 - 10 Pax",
      trim: true, // e.g. "2 - 15 People", "Min 2 Adults"
    },
    countries: {
      type: [String],
      default: [], // e.g. ["France", "Switzerland", "Italy"]
    },
    countryOrRegion: {
      type: String,
      default: "",
      trim: true, // e.g. "Indonesia", "Asia", "France, Switzerland, Italy"
    },
    destination: {
      type: String,
      required: true,
      trim: true, // e.g. "Bali", "Singapore"
    },
    packagePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    // TRIP OVERVIEW
    tripOverview: {
      type: String,
      default: "",
      trim: true,
    },
    tourOverviewAndDescription: {
      type: String,
      default: "",
      trim: true, // alias for tripOverview
    },

    // KNOW BEFORE YOU GO
    knowBeforeYouGo: {
      type: [String],
      default: [], // e.g. ["Passport must have 6 months validity", "Visa on arrival required"]
    },

    // FLIGHT DETAILS [{Flight No, Travel Date, Sector, Departure, Arrival}]
    flightDetails: {
      type: [flightDetailSchema],
      default: [],
    },

    // HOTELS USED [{Location, Hotel Name}]
    hotelsUsed: {
      type: [hotelDetailSchema],
      default: [],
    },

    // HIGHLIGHTS []
    highlights: {
      type: [String],
      default: [], // e.g. ["Tanah Lot Temple Sunset", "Water Sports at Benoa Beach", "Tegenungan Waterfall"]
    },

    // INCLUSIONS / EXCLUSIONS
    inclusionsAndExclusions: {
      type: [inclusionExclusionItemSchema],
      default: [], // e.g. [{ point: "Return Airfare From Ex Bangalore", isIncluded: true }, { point: "GST & TCS", isIncluded: false }]
    },
    packageInclusions: {
      type: [String],
      default: [],
    },
    packageExclusions: {
      type: [String],
      default: [],
    },

    // DETAILED ITINERARY [day, title, points, overnightMeal, overnightStay]
    detailedItinerary: {
      type: [detailedItinerarySchema],
      default: [],
    },
    dayByDayItinerary: {
      type: [detailedItinerarySchema],
      default: [], // alias for backward compatibility
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to keep field aliases synchronized
holidayPackageSchema.pre("save", function () {
  if (this.coverImage && !this.image) {
    this.image = this.coverImage;
  } else if (this.image && !this.coverImage) {
    this.coverImage = this.image;
  }

  if (this.tripOverview && !this.tourOverviewAndDescription) {
    this.tourOverviewAndDescription = this.tripOverview;
  } else if (this.tourOverviewAndDescription && !this.tripOverview) {
    this.tripOverview = this.tourOverviewAndDescription;
  }

  if (this.detailedItinerary && this.detailedItinerary.length > 0) {
    this.dayByDayItinerary = this.detailedItinerary;
  } else if (this.dayByDayItinerary && this.dayByDayItinerary.length > 0) {
    this.detailedItinerary = this.dayByDayItinerary;
  }

  if (Array.isArray(this.countries) && this.countries.length > 0) {
    if (!this.countryOrRegion) {
      this.countryOrRegion = this.countries.join(", ");
    }
  } else if (this.countryOrRegion) {
    this.countries = this.countryOrRegion
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
});

const HolidayPackage = mongoose.model(
  "HolidayPackage",
  holidayPackageSchema
);

export default HolidayPackage;
export { HolidayPackage };