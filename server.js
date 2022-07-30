var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.Promise = Promise;

var dbUrl = 'mongodb+srv://<id>:<password>@learning-node.bpjlrv7.mongodb.net/?retryWrites=true&w=majority';

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });

});

app.get('/messages/:user', (req, res) => {
    var user = req.params.user;

    Message.find({name:user}, (err, messages) => {
        res.send(messages);
    });

});

//async/await
app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body);

        var savedMessage = await message.save()

        console.log('Saved!');

        var censored = await Message.findOne({
            message: 'badword'
        });


        if (censored)
            await Message.deleteOne({
                _id: censored.id
            });
        else
            io.emit('message', req.body);

        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
    }   
});

//The piece of code under this comment section has written again with async/await.

// app.post('/messages', (req, res) => {
//     var message = new Message(req.body);

//     message.save()
//         .then(() => {
//             console.log('Saved!');
//             return Message.findOne({
//                 message: 'badword'
//             });
//         })
//         .then(censored => {
//             if (censored) {
//                 console.log('censored words found!', censored);
//                 return Message.deleteOne({
//                     _id: censored.id
//                 });
//             }
//             io.emit('message', req.body);
//             res.sendStatus(200);
//         })
//         .catch((err) => {
//             res.sendStatus(500);
//             return console.error(err);
//         })

//The piece of code under this comment section has written again with promises.

// message.save((err) => {
//     if (err) {
//         sendStatus(500);
//     } else {
//         Message.findOne({message: 'badword'}, (err, censored) => {
//             if(censored){
//                 console.log('censored words found!', censored);
//                 Message.remove({_id: censored.id}, err => {
//                     console.log('removed censored message!');
//                 });
//             }
//         })
//         io.emit('message', req.body);
//         res.sendStatus(200);
//     }
// })

// });

io.on('connection', (socket) => {
    console.log('a user connected!');
})

mongoose.connect(dbUrl, (err) => {
    console.log('Mongodb connection', err);
})

var server = http.listen(3000, () => {
    console.log('Server is listening on port', server.address().port)
});