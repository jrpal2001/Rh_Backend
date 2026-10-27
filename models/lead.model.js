import mongoose from "mongoose";

const { Schema } = mongoose;

const leadSchema = new Schema(
    {
        // Personal Details
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },

        // Lead Details
        type: {
            type: String,
            trim: true,
            default: null,
        },

        travelToCountry: {
            type: String,
            trim: true,
            default: null,
        },

        member: {
            type: Number,
            min: [1, "Member count must be at least 1"],
            default: null,
        },

        groupMember: {
            type: Number,
            min: [1, "Group member count must be at least 1"],
            default: null,
        },

        message: {
            type: String,
            trim: true,
            default: null,
        },

        // Follow-up Details
        timeToRevertBack: {
            type: String,
            trim: true,
            default: null,
        },

        howCanWeAssist: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;