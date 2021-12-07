const express = require('express');
const app = express();
const port = process.env.RATE_MY_EV_PORT || 5000;  // set the env variable to 80 (HTTP) when starting the server in the production environment
const serveStatic = require('serve-static');
const path = require('path');
const carModelController = require('./controllers/carModelController');
const tokenController = require('./controllers/tokenController');
const testDataController = require('./controllers/testDataController');
const ratingHeaderController = require('./controllers/ratingHeaderController');
const ratingController = require('./controllers/ratingController');
const initDb = require('./models/initDb');

const server = async () => {
    db = await initDb();
    app.use(express.json());

    app.listen(port, () => console.log(`Listening on port ${port}.`));
    
    // API for GET /CarModels
    //     Url only: get all car models
    //     Returns: [ { name: <CarModel.name>, isTest: CarModel.isTest }, ... ]
    // API for PUT /CarModels
    //     req.body is an object with name and isTest (optional) properties. name must be unique and non-empty. name will be trim()'d.
    //     Returns: { name: <new CarModel.name>, isTest: <new CarModel.isTest> }
    //     Errors:
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: the name is either already in use or was emtpy
    app.all('/CarModels', async (req, res) => {
        await carModelController(req, res, db);
    });
    
    // API for GET /Tokens
    //     Url only: get all tokens
    //     /Tokens?isTest=<false|true>?isUsed=<false|true>?value=<token value>: get tokens with the given values
    //     Returns: [ { value: <Token.value>, 
    //                  isTest: <Token.isTest>,
    //                  dateUsed: <Token.dateUsed>,
    //                  dateIssued: <Token.dateIssued>,
    //                  carModelName: <CarModel.name for this Token> }]
    // API for PUT /Tokens
    //     req.body is an object with carModelName (which must already be in the database)
    //     and isTest (optional) properties
    //     Returns: { tokenValue: <new Token.value> }
    //     Errors: 
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: carModelName isn't in the database
    app.all('/Tokens', async (req, res) => {
        await tokenController(req, res, db);
    });
    
    // API for DELETE /TestData
    //     Deletes all test records
    app.all('/TestData', async (req, res) => {
        await testDataController(req, res, db);
    });
    
    // API for GET /RatingHeaders
    //     Url only: get all rating headers
    //     /RatingHeaders?header=<RatingHeader.header>?isTest=<false|true>: get headers with the given values
    //     Returns: [ { header: <RatingHeader.header>,
    //                  isTest: <RatingHeader.isTest> }]
    // API for PUT /RatingHeaders
    //     req.body is a string with header. header must be unique and non-empty
    //     Returns: the new rating header { header: <RatingHeader.header>, isTest: <RatingHeader.isTest> }
    //     Errors:
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: the header is either already in use or was emtpy
    // API for POST /RatingHeaders
    //     req.body is an object with currentHeader, header, and isTest properties. currentHeader and header must not be empty. currentHeader must exist in the database.
    //     Returns: { header: <updated RatingHeader.header>, isTest: <updated RatingHeader.isTest> }
    //     Errors:
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: currentHeader doesn't exist or a SQL error occurred
    // API for DELETE /RatingHeaders
    //     req.body is an object with header property. header must not be empty.
    //     Returns: { deleted: <number of headers deleted> }
    //     Errors:
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: a SQL error occurred.
    app.all('/RatingHeaders', async (req, res) => {
        await ratingHeaderController(req, res, db);
    })
    
    // API for GET /Ratings
    //     Url only: all ratings
    //     /Ratings?isTest=<false|true>?tallyResults=<false|true>: include test ratings (default false) and/or tally results (default false)
    //     Returns: [ { rating: <Rating.rating>, ratingHeader: <Rating.(RatingHeader.header, carModel: <Rating.(CarModel.type) }]
    // API for PUT /Ratings
    //     req.body is an array of objects with rating, isTest, token, and ratingHeader properties. only isTest may be omitted. token and ratingHeader must exist in the database.
    //     Returns: { created: <number of ratings created> }
    //     Errors:
    //         400 Bad Request: the req.body is not formed correctly
    //         409 Conflict: token and/or rating error don't exist or a SQL error occurred
    app.all('/Ratings', async (req, res) => {
        await ratingController(req, res, db);
    });
    
    // these are the two React apps
    app.use('/admin', serveStatic(path.join(__dirname, 'admin/build')));
    app.use('/', serveStatic(path.join(__dirname, 'client/build')));
}

server();