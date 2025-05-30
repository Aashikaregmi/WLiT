const mongoose = require('mongoose')
const BusSchema = mongoose.Schema(
    {
        busNumber: {
            type: Number,
            required: [true, "Please enter the bus number"],
            min: [1, "Min bus no is 1"], //for validation
        },
        departureTime: {
            type: Date,
            required: [true, "Please enter the departure time"],
        },
        pickUp: {
            type: String,
            required: [true, "Please enter the pick up point"],
        },
        destination: {
            type: String,
            required: [true, "Please enter the destination"],
        },
        fare: {
            type: Number,
            required: [true, "Please enter the travel fare"],
            min: [0, "Fare cannot be negative"],
        },
  },
  {
    timestamps: true,
  }
)
const Bus = mongoose.model("Bus", BusSchema)
module.exports = Bus