const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    title:{
        type: String,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    cardUsed: {
        type: String,
    },
    additionalNotes: {
        type: String,
    }
}, { timestamps: true })    //auto generates timestamp properties on our blog documents

const someModel = mongoose.model('someModel', paymentInfoSchema)
module.exports = someModel;