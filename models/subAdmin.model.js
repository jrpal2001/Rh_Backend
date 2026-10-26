import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
  {
    subAdminId: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      default: "STAFF",
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    assignedApplications: [
      {
        applicationType: {
          type: String,
          enum: ["booking", "visa"],
          required: true,
        },
        applicationId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "assignedApplications.applicationModel",
        },
        applicationModel: {
          type: String,
          enum: ["BookingApplication", "VisaApplication"],
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Helper to compute the next sequential SubAdmin ID (e.g. RHS1, RHS2, RHS3...)
 */
export const getNextSubAdminId = async (model) => {
  const TargetModel = model || mongoose.model("SubAdmin");
  const staffList = await TargetModel.find(
    { subAdminId: { $exists: true, $ne: null } },
    { subAdminId: 1 }
  ).lean();

  let maxNum = 0;
  for (const staff of staffList) {
    if (staff.subAdminId) {
      const match = String(staff.subAdminId).match(/^RHS(\d+)$/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  return `RHS${maxNum + 1}`;
};

/**
 * Pre-validate hook: auto-assign sequential subAdminId if not provided
 */
subAdminSchema.pre("validate", async function () {
  if (!this.subAdminId) {
    this.subAdminId = await getNextSubAdminId(this.constructor);
  }
});

const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);

export default SubAdmin;
export { SubAdmin };