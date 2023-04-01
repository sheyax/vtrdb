const router = require("express").Router();
const jwt = require("jsonwebtoken");

const Driver = require("../models/driver")
var ObjectId = require("mongoose").Types.ObjectId;


//get all drivers

router.get("/drivers", async(req, res) => {
    // Driver.find((err, docs) => {
    //     if (!err) {
    //         res.send(docs);
    //     } else {
    //         console.log("Error retrieving data" + JSON.stringify(err, undefined, 2));
    //     }
    // });

    const driver = await Driver.find();
    if (!driver) {
        console.log("error getting drivers");
        res.send("error getting drivers")
    } else {
        res.send(driver)
    }
});


//get driver by id..............................................................
router.get(
    "/drivers/:id",

    async(req, res) => {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return;

        const { password, ...data } = driver;
        res.send(data);
    }
);

//..................Create a new trip

router.put("/trip/:id", async(req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send("no record with given id: " + req.params.id);
    }

    var newTrip = req.body;

    console.log(newTrip);

    try {
        let driver = await Driver.findById(req.params.id);
        driver.dailyTrips.push(newTrip);
        Driver.findByIdAndUpdate(
            req.params.id, { $set: driver }, { new: true },
            (err, docs) => {
                if (!err) {
                    res.send({
                        status: "success",
                        docs,
                    });
                } else {
                    console.log(
                        "Error updating the record" + JSON.stringify(err, undefined, 2)
                    );
                }
            }
        );
    } catch (err) {
        res.send({
            status: "Failed",
            message: "could not update trip",
        });
    }
});



//update specific trip--------------Approve trip
router.put(
    "/driver/:id/dailytrips/:tripId",

    async(req, res) => {
        try {
            const driver = await Driver.findById(req.params.id);
            const dailyTrips = driver.dailyTrips.find(
                (trip) => trip._id.toString() === req.params.tripId
            );
            dailyTrips.aprroved = true;
            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

module.exports = router