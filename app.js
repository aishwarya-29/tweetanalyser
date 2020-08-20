var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var analyse = require('./analyse-tweet');

app.use(analyse);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static('public'));

app.get("/", function(req,res){
    res.render("index");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
