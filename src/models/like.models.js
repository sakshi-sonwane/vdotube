import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const likesSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "tweet",
    },
  },
  {
    timestamps: true,
  },
);

likesSchema.plugin(mongooseAggregatePaginate)
export const Like = mongoose.model("Like", likesSchema);
