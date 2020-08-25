var data = require('./ptweets.json');
var data2 = require('./ntweets.json');
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var math = require('mathjs');
var positiveTweets = [];
var negativeTweets = [];

var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser");
router.use(bodyParser.json());

data.forEach(function(tweet){
    positiveTweets.push(tweet.text);
});
data2.forEach(function(tweet){
    negativeTweets.push(tweet.text);
});

var tweets = positiveTweets.concat(negativeTweets);

for(var i = 0; i<tweets.length;i++) {
    tweets[i] = tweets[i].replace('^RT[\s]+','');
    tweets[i] = tweets[i].replace(/\bhttps\S+/ig,"");
    tweets[i] = tweets[i].replace(/#/g,'');
    tweets[i] = tweets[i].replace(/@\S+/ig,"");
}
var tokens = [];
for(var i = 0; i< tweets.length;i++) {
    tokens.push(tokenizer.tokenize(tweets[i]));
    if(tweets[i].includes(':)'))
        tokens[i].push(':)');
    if(tweets[i].includes(':('))
        tokens[i].push(':(');
    if(tweets[i].includes(':P'))
        tokens[i].push(':P');
    if(tweets[i].includes(':/'))
        tokens[i].push(':/');
}

var stopwords = [ "i", "me", "my", "myself","we", "our","ours","ourselves","you","you're","you've","you'll","you'd","your","yours","yourself","yourselves","he","him","his","himself","she","she's","her","hers","herself","it","it's","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","that'll","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","belo","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","bother","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","don't","should","should've","now","d","ll","m","o","re","ve","y","ain","aren","aren't","could","couldn't","didn","didn't","doesn","doesn't","did","does","hadn","hadn't","hasn","hasn't","haven","haven't","isn","isn't","ma","mightn","mightn't","mustn","mustn't","needn","needn't","shan","shan't","shouldn","shouldn't","wasn","wasn't","weren","weren't","won't","wouldn","wouldn't"]
for(var i=0;i<tokens.length;i++) {
    var clean = [];
    for (var j = 0;j<tokens[i].length;j++) {
        tokens[i][j] = tokens[i][j].toLowerCase();
        if(!(stopwords.includes(tokens[i][j])))
            clean.push(tokens[i][j]);
    }
    tokens[i] = clean;
}

for(var i=0;i<tokens.length;i++) {
    for(var j=0;j<tokens[i].length;j++) {
        tokens[i][j] = natural.PorterStemmer.stem(tokens[i][j]);
    }
}


var sentiment = [];
for(var i = 0;i<5000;i++)
    sentiment.push(1);
for(var i = 0;i<5000;i++)
    sentiment.push(0);
var freqs = {};
var number = ["zero","one"];


for(var i = 0; i < 10000; i++) {
    for(var j = 0; j<tokens[i].length; j++) {
        if(freqs[tokens[i][j]] && freqs[tokens[i][j]][number[sentiment[i]]])
            freqs[tokens[i][j]][number[sentiment[i]]]++;
        else if(freqs[tokens[i][j]])
            freqs[tokens[i][j]][number[sentiment[i]]] = 1;
        else {
            freqs[tokens[i][j]] = {};
            freqs[tokens[i][j]][number[sentiment[i]]] = 1;
        }
    }
}
//console.log(freqs["sunni"]);

function extractFeatures(s,freqs) {
    var x = [1,0,0];
    for(var i = 0; i<s.length;i++) {
        if(freqs[s[i]] && freqs[s[i]]["one"])
            x[1] += freqs[s[i]]["one"];
        else
            x[1] = 0;
        if(freqs[s[i]] && freqs[s[i]]["zero"])
            x[2] += freqs[s[i]]["zero"];
        else 
            x[2] = 0;
    }
    return x;
}

var train_x = [];
for(var i = 0; i<tokens.length;i++) {
    train_x.push(extractFeatures(tokens[i],freqs));
}
//console.log(train_x[5]);
//console.log(train_x.length);

// train_x = training data, sentiment = label;

// var twee = "this world is truly an awesome place guys ily";
// predict(twee);


function sigmoid(z) {
    var h = 0;
    for(var i = 0; i<z.length; i++) {
        h+=z[i];
    }
    return (1/(1+(Math.exp(-h))));
}
function predict(tweet) {
    tweet = tweet.replace('^RT[\s]+','');
    tweet = tweet.replace(/\bhttps\S+/ig,"");
    tweet = tweet.replace(/#/g,'');
    tweet = tweet.replace(/@\S+/ig,"");
    token = tokenizer.tokenize(tweet);
    if(tweet.includes(':)'))
        token.push(':)');
    if(tweet.includes(':('))
        token.push(':(');
    if(tweet.includes(':P'))
        token.push(':P');
    if(tweet.includes(':/'))
        token.push(':/');
    var clean = []
    for (var j = 0;j<token.length;j++) {
        token[j] = token[j].toLowerCase();
        if(!(stopwords.includes(token[j])))
            clean.push(token[j]);
    }
    token = clean;
    for(var j=0;j<token.length;j++) {
        token[j] = natural.PorterStemmer.stem(token[j]);
    }

    var features = extractFeatures(token,freqs);
    features[0] = features[0]*7e-08;
    features[1] = features[1]*0.0005639;
    features[2] = features[2]*(-0.00055517);
    const finalResults = sigmoid(features);
    return finalResults;
}

function naivebayes_train(freqs,x,y) {
    var loglikelihood = {};
    var logprior = 0;
    var V = 0;
    var vocab = new Set();
    for (word in freqs) {
        vocab.add(word);
    }
    V = vocab.size;
    var N_pos = 0, N_neg = 0;
    for (word in freqs) {
        for (zeroOrOne in freqs[word]) {
            if(zeroOrOne == "one") 
                N_pos += freqs[word]["one"];
            else if(zeroOrOne == "zero")
                N_neg += freqs[word]["zero"];
        }
    }
    logprior = 0;
    for (let item of vocab) {
        var freq_pos = 0, freq_neg = 0;
        if(freqs[item]["one"])
            freq_pos = freqs[item]["one"];
        if(freqs[item]["zero"])
            freq_neg = freqs[item]["zero"];
        
        var p_w_pos = (freq_pos+1)/(N_pos + V);
        var p_w_neg = (freq_neg+1)/(N_neg + V);
        loglikelihood[item] = Math.log10(p_w_pos / p_w_neg);
    }

    return loglikelihood;
}


var temp = naivebayes_train(freqs,train_x,sentiment);

function naivebayes_test(tweet,loglikelihood) {
    tweet = tweet.replace('^RT[\s]+','');
    tweet = tweet.replace(/\bhttps\S+/ig,"");
    tweet = tweet.replace(/#/g,'');
    tweet = tweet.replace(/@\S+/ig,"");
    token = tokenizer.tokenize(tweet);
    if(tweet.includes(':)'))
        token.push(':)');
    if(tweet.includes(':('))
        token.push(':(');
    if(tweet.includes(':P'))
        token.push(':P');
    if(tweet.includes(':/'))
        token.push(':/');
    var clean = []
    for (var j = 0;j<token.length;j++) {
        token[j] = token[j].toLowerCase();
        if(!(stopwords.includes(token[j])))
            clean.push(token[j]);
    }
    token = clean;
    for(var j=0;j<token.length;j++) {
        token[j] = natural.PorterStemmer.stem(token[j]);
    }
    var p = 0;
    for(var i=0;i<token.length;i++) {
        if(loglikelihood[token[i]])
            p+= loglikelihood[token[i]];
    }
    return p;
}

var tt = "I am happy because I am learning :)";
var prob = naivebayes_test(tt,temp);
console.log(prob);

router.post("/analysetweet", function(req,res){
    var tweet = req.body.tweet;
    var result = naivebayes_test(tweet,temp);
    var x = {
        result: result
    }
    return res.send(x);
});


module.exports = router;