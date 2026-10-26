
import mongoose from "mongoose";

const { Schema } = mongoose;

const checklistSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Checklist title is required"],
            trim: true,
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

checklistSchema.index({ isActive: 1 });
checklistSchema.index({ title: 1 });

const Checklist = mongoose.model("Checklist", checklistSchema);

export default Checklist;
