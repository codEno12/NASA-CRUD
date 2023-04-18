const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient 
const { MongoDBNamespace, ObjectId } = require ('mongodb')
/**
 * node-fetch 
 * Node fecth will allows us to use fetch 
 * on the server side. 
 * the version must be node-fecth@2
 */
const fetch = require('node-fetch')
const methodOverride = require('method-override')

/**
 *  we want to load the enviroment 
 * variables before we start doing things
 */
dotenv.config() 

/**Setting up server 
 * 
*/
const PORT = process.env.PORT || 3000 // want the port 
const app = express()

/** DATABASE
 * 
 * Setting up and connecting to mongodb 
 * mongodb url should be placed inside
 * .env to protect it
 * 
 * const client = new MongoClient(MONGODB_URL)
 * MongoClient is an object and we are passing the 
 * MongoDB URL that we possess to the object. 
 * 
 * The 'new' keyword initializes the 
 * 'intances' (branch) of the object
 */
const MONGODB_URL = process.env.MONGODB_URL
if (!MONGODB_URL) throw new Error('WHERE YOUR LINK AT')
const client = new MongoClient(MONGODB_URL)

client.connect().then( client => { 
    console.log( 'connectd to the client' )
    const db = client.db( 'NasaAPI' )
    const nasaCollection = db.collection('nasaData')

    /**
     * use ejs and set it as the main view engine 
     * 
     * app.set() sets the Express application settings 
     * 
     * 'view engine' is the property that controls which 
     * view engine is used
     * 
     * 'ejs' the view engine
     */
    app.set('view engine', 'ejs')

    /**
     * app.use() 
     * makes the public folder accessible for the public 
     * this allows us to use static files for ejs
     * such as style.css, regular js, html and etc..
     * 
     * "express.static( 'public' )"
     * finds where"
     * 
     * so you dont need "../public/"(filename)
     * for pathing 
     * 
     * although we are using app.use ()
     * app.use( express.static ( 'public' ) ) is not 
     * a middle
     */
    app.use(express.static('public'))

    /** Middlewares
     * app.use() method lets us use middlewares 
     * bodyParser help tidy up the request object 
     * urlencoded tells the bodyparser to extract data
     * from the <form> element and attach them to the
     * body property of the request object
     * 
     * what are middlewares? 
     * In exress middlewares are functions that have 
     * access to the 'request', 'response', and 'next'
     * object.
     */
    app.use(bodyParser.urlencoded({extended: true}))

    /**
     * Method override
     */
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            var method = req.body._method
            delete req.body._method
            return method
        }
    }))

    /**Handlers
     * 
     */
    app.get('/', (req, res) => {
        /**
         * Encapsulating the res.render(...)
         * 
         * We are turing the nasaCollection into an array 
         * and we are putting in the results (array) inside
         * a variable called 'planet' which we will later use in our 
         * ejs
         */
        nasaCollection.find().toArray()
        .then ( results => {
            // console.log(results)
            /**
             * res.render('index.ejs, {})
            * the object can be empty and it will still 
             * render the index.ejs file 
             */
            res.render('index.ejs', {
                planet: results
            })
        })
    })

    /**
     * Using the Form with the action = '/nasaData' 
     * when submit is triggered, assuming all the necessary details
     * are provided, then app.post will do all of the things 
     * inside it. 
     */
    app.post('/nasaData', async (req, res) => {
        console.log("hi")
        const apiKey = process.env.API_KEY
        const selectedDate = req.body.date
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${selectedDate}`)
        const data = await response.json()
        const imageTitle = data.title
        const imageUrl = data.url
        const explanation = data.explanation

        /**
         * create an object aht we will pass on the isertOne Method
         */
        const obj = {
            title: imageTitle,
            img: imageUrl,
            explanation: explanation,
            userDate: req.body.date
        }

        /**
         * insertOne will insert the object provided to 
         * our mongoDB database, specifically in nasaCollection
         */
        nasaCollection.insertOne(obj)
            .then (() => res.redirect('/'))
            .catch(error => console.error(error))
    })

    app.delete('/nasaData', async (req, res) => { 
        nasaCollection.deleteOne( {
            _id: new ObjectId(req.body.id)
        })
        .then (result => {
            console.log(`Deleted ObjectID ( ${req.body.id} )`)
            res.redirect('/')
        })
        .catch(error => console.error(`Error: ${error}`))
    })

    app.listen(process.env.PORT, () => {
        console.log('yo mama')
    })
})
