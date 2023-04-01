const router = require("express").Router();

const User = require("../models/user");
const Driver = require("../models/driver");
const Engineer = require("../models/engineer")
const Admin = require("../models/admin")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//....................test..............................................//

var token = ''
router.post("/register", async(req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    //save user
    result = await user.save();
    const { password, ...data } = await result.toJSON();
    res.send(data);
});

router.post("/login", async(req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    if (username !== "" && password !== "") {
        const user = await User.findOne({ username });

        console.log(user);
        if (!user) {
            res.status(404).send({ message: "user does not exist" });
            console.log("wrong username");
            return;
        }
        if (req.body.password !== user.password) {
            res.status(400).send({ message: "invalid password" });
            console.log("wrong password");
        }

        //Jwt signing and cookies
        const tokener = await jwt.sign({
                id: user._id,
                username: user.username,
            },
            "secretkey"
        );



        //cookies.................................//
        res.cookie("newjwt", false);
        res.cookie("jwt", tokener, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000, //1 day
        });

        //.......................................//
        res.status(200).send({ message: "success" });
        console.log("sucessful login");
    }
});

router.get("/user", (req, res) => {
    const cookie = req.cookies["jwt"]

    //console.log(cookie, "cookie");
    res.send(cookie);
    if (cookie) {
        const claims = jwt.verify(cookie, "secretkey");

        if (!claims) {
            console.log("cannot authenticate");
            res.status(400).send({
                message: "cannot authenticate ",
            });
        }
    }
});
//....................................end test......................................////////////////


router.post('/driver/register', async(req, res) => {
    //Generate hashpassword
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const user = new Driver({
        username: req.body.username,
        driverId: req.body.driverId,
        password: hashPassword,
        assignedVehicle: req.body.vehicle,
        vehicleModel: req.body.vehicleModel,
    });

    //save user
    result = await user.save();
    const { password, ...data } = await result.toJSON();
    res.status(200).send({ message: 'successful', data });
})


//engineer
router.post("/engineer/register", async(req, res) => {
    //Generate hashpassword
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create driver
    const newEngineer = new Engineer({
        driverId: req.body.driverId,
        engineerId: req.body.engineerId,
        password: hashPassword,
    });

    //save Admin
    result = await newEngineer.save();
    const { password, ...data } = await result.toJSON();
    res.send(data);
});


//........................................Login..................................................//
router.post("/driver/login", async(req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    if (username !== "" && password !== "") {
        const user = await Driver.findOne({ username });

        console.log(user);
        if (!user) {
            res.status(404).send({ message: "user does not exist" });
            console.log("wrong username");
            return;
        }



        if (!await bcrypt.compare(password, user.password)) {
            res.status(400).send({ message: "invalid password" });
            console.log("wrong password");
        }

        //Jwt signing and cookies
        const tokener = await jwt.sign({
                id: user._id,
                username: user.username,
                role: user.roles,

            },
            "secretkey"
        );



        //cookies.................................//
        //res.cookie("newjwt", false);
        res.cookie("appjwt", tokener, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000, //1 day
        });

        //.......................................//
        res.status(200).send({ message: "success" });
        console.log("sucessful login");
    }
});



//engineer

router.post("/engineer/login", async(req, res) => {
    const { engineerId, password } = req.body;
    console.log(req.body);
    if (engineerId !== "" && password !== "") {
        const user = await Engineer.findOne({ engineerId });

        console.log(user);
        if (!user) {
            res.status(404).send({ message: "user does not exist" });
            console.log("wrong username");
            return;
        }



        if (!await bcrypt.compare(password, user.password)) {
            res.status(400).send({ message: "invalid password" });
            console.log("wrong password");
        }

        //Jwt signing and cookies
        const tokener = await jwt.sign({
                id: user._id,
                username: user.engineerId,
                role: user.roles,

            },
            "secretkey"
        );



        //cookies.................................//
        //res.cookie("newjwt", false);
        res.cookie("appjwt", tokener, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000, //1 day
        });

        //.......................................//
        res.status(200).send({ message: "success" });
        console.log("sucessful login engineer");
    }
});


//Get Users ............................Get Users ........................................///
router.get("/driver/user", async(req, res) => {
    const cookie = req.cookies["appjwt"]


    if (cookie) {
        const claims = jwt.verify(cookie, "secretkey");

        if (!claims) {
            console.log("cannot authenticate");
            res.status(400).send({
                message: "cannot authenticate ",
            });
        } else {
            const user = await Driver.findOne({ _id: claims.id, roles: claims.role, username: claims.username })

            const { password, ...data } = await user.toJSON();

            res.send(data)
        }
    } else {
        res.status(400).send("unauthenticated")
        console.log("unauthenticated")
    }

});


//engineer
router.get("/engineer/user", async(req, res) => {
    const cookie = req.cookies["appjwt"]


    if (cookie) {
        const claims = jwt.verify(cookie, "secretkey");

        if (!claims) {
            console.log("cannot authenticate");
            res.status(400).send({
                message: "cannot authenticate ",
            });
        } else {
            const user = await Engineer.findOne({ _id: claims.id, roles: claims.role, engineerId: claims.username })


            const { password, ...data } = await user.toJSON();

            res.send(data)
        }
    } else {
        res.status(400).send("unauthenticated engineer")
        console.log("unauthenticated")
    }

});



//.........................................logout...............................///
router.post('/driver/logout', (req, res) => {
    res.cookie('appjwt', '', { maxAge: 0 })
    res.send({
        message: 'success logout'
    })
})

router.post('/engineer/logout', (req, res) => {
    res.cookie('appjwt', '', { maxAge: 0 })
    res.send({
        message: 'success logout'
    })
})



module.exports = router;