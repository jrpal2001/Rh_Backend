
import mongoose from "mongoose";

const { Schema } = mongoose;

const docsSchema = new Schema(
    {
        documentName: {
            type: String,
            required: [true, "Document name is required"],
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

docsSchema.index({ isActive: 1 });
docsSchema.index({ documentName: 1 });

const Docs = mongoose.model("Docs", docsSchema);

export default Docs;
