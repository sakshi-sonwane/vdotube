import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //jo sunscribe krra h
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //jiska channel subscribe krre h
      ref: "User",
    },
  },
  {
    timestamp: true,
  },
);

subscriptionSchema.plugin(mongooseAggregatePaginate)

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
