const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    isPaid: {
        type: Boolean,
        required: true
      },
    ticketsPrice: Number,
    capacity: {
        type: Number,
        required: true
    },
    categories: [String],
    description: {
        type: String,
        required: true
    },
    imageEvent: {
         type: String,
         required: true
    },
    ticketsSold:[{
       type: Schema.Types.ObjectId,
       ref: 'User'
    }],
    checkIn:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
     }],
    host: {
       type: Schema.Types.ObjectId,
        ref: "User",
    },
    comments: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Comment" }],
});

const Event = model("Event", eventSchema);

module.exports = Event;
