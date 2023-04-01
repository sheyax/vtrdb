const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
require("./db");

// corsOptions = {
//     origin: "*",
// };

const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(cookieSession({
    secret: 'sxfsfdjs',
    cookie: {
        maxAge: 1000 * 60 * 60,
        sameSite: "lax",
        secure: false
    }
}))

app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:3000']
    })
);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var auth = require("./routes/authentication");
var feed = require("./routes/datafeed")

// app.get('/set-cookies', (req, res) => {
//     // res.setHeader('Set-Cookie', 'newUser=true')
//     res.cookie('newUser', false, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
//     res.send('you have the cookies')
// })

app.listen(5000, () => {
    console.log("server running ");
});

app.use("/auth", auth);
app.use("/feed", feed);