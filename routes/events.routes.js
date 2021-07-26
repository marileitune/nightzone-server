const express = require('express')
const router = express.Router()

//other packages installed


//models required
const User = require('../models/User.model')
const Event = require('../models/Event.model')
const Comment = require('../models/Comment.model')

//START ROUTES

//handle create event
router.post('/create', async (req, res) => {
    try {
        const {name, start, end, address, country, city, isPaid, ticketsPrice, capacity, description, categories, imageEvent} = req.body
        const user = req.session.loggedInUser._id
        const event = await Event.create({name, start, end, address, country, city, isPaid, ticketsPrice, capacity, description, categories, imageEvent, host: user})
        await User.findByIdAndUpdate({_id: user}, { $push: { eventsCreated: event } })
        return res.status(200).json(event)
    }
    catch(err) {
            return res.status(500).json({
                error: 'Something went wrong',
                message: err
            })
    } 
})

//handle events list
router.get('/events', async (req, res) => {
    try { 
        const events = await Event.find()
        .populate('checkIn')
        return res.status(200).json(events)
    }
    catch(err) {
        return   res.status(500).json({
                error: 'Something went wrong',
                message: err
            })
    }
})

// handle hotzone
router.get('/events/hotzone', async (req, res) => {
    try {
        let events = await Event.find()
        .populate('checkIn')//this is to get the user's photo and name
        
        let eventsFiltered = events.filter((event) => {
            let today = new Date().getTime(); 
            let eventStartDate = Date.parse(event.start); 
            let eventEndDate = Date.parse(event.end);//comparing all the dates in milliseconds 
            return (today > eventStartDate && today < eventEndDate) 
        })        
        
            let percent = eventsFiltered.map((eventFiltered) => {
            let capacity = eventFiltered.capacity 
            let checkedIn = eventFiltered.checkIn.length 
            let percent = (checkedIn * 100) / capacity //is the percent of the capacity that already was filled.
            return percent
        }) 

        let eventsHotzone = {
            eventsFiltered: eventsFiltered,
            progress: percent // we pass it for the front end to use in the progress bar
        }
        return res.status(200).json(eventsHotzone)
    }
    catch(err) {
        console.log(err)
       
    }
})


//handle event detail
router.get('/events/:eventId', async (req, res) => {
    try {
        let event = await Event.findById(req.params.eventId)
        .populate('host')
        user = req.session.loggedInUser._id

        const comments = await Comment.find({eventId: req.params.eventId})
        .populate('authorId')
        event.comments = comments//these are the  event comments populated with user data
        if (event.ticketsSold.includes(user) || event.host._id == user) {
            event = {
                event: event,
                canBuy: false, 
            }
        } else {
            event = {
                event: event,
                canBuy: true
            }
        }
        console.log(event)
        return res.status(200).json(event)

    }
    catch(err){
        res.status(500).json({
            error: 'Something went wrong',
            message: err
        })
    }
})

//handle buy ticket 
//why does post method reset the req.session.loggedInUser? Because of it I needed to to a get here.
router.get('/events/:eventId/buy', async (req, res) => {
    try {
        //if the payment is successful, we need to update the DB (user: ticketsBought ; event: ticketsSold)
        const event = await Event.findByIdAndUpdate({_id: req.params.eventId}, { $push: { ticketsSold: req.session.loggedInUser._id } })
        const user = await User.findByIdAndUpdate({_id: req.session.loggedInUser._id}, { $push: { ticketsBought: req.params.eventId } })
        return res.status(200).json(event)
    }
    catch (err) {
        res.status(500).json({
            error: 'Something went wrong',
            message: err
        })
    }
})

//handle edit event 
router.patch('/events/:eventId', async (req, res) => {
    try {
        let eventId = req.params.eventId
        const {name, start, end, address, country, city, isPaid, ticketsPrice, capacity, description, imageEvent} = req.body
        let response = await Event.findByIdAndUpdate({_id: eventId}, {name, start, end, address, country, city, isPaid, ticketsPrice, capacity, description, imageEvent}, {new: true})
        return res.status(200).json(response)
    }
    catch(err){
        return res.status(500).json({
            error: 'Something went wrong',
            message: err
        })
    }
})

//handle delete event
router.delete('/events/:eventId', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.eventId)
        return res.status(200).json()
    }
    catch(err) {
        return res.status(500).json({
            error: 'Something went wrong',
            message: err
        })
    }
})

//handle post comment
router.post('/events/:eventId/comment', async (req, res) => {
    try {
        const event = req.params.eventId
        const user = req.session.loggedInUser._id
        const {comment} = req.body
        const myComment = await Comment.create({comment, authorId: user, eventId: event})
        await Event.findByIdAndUpdate({_id: event}, { $push: { comments: myComment._id}})
        return res.status(200).json()
    }
    catch(err) {
        return res.status(500).json({
            error: 'Something went wrong',
            message: err
        })
    }
})

//handle checkIn
router.get('/events/:eventId/checkIn', async (req, res) => {
    try {
        let event = await Event.findByIdAndUpdate({_id: req.params.eventId}, { $push: { checkIn: req.session.loggedInUser._id } })
        return res.status(200).json(event)
    }
    catch(err) {
       return res.status(500).json({
           error: 'Something went wrong',
           message: err
       })
    }
   })

//handle hot zone





module.exports = router;