const
    _ = require('lodash'),
    mongoose = require('mongoose'),
    validator = require('validator'),
    { User } = require('./user');


var TermsSchema = new mongoose.Schema({
    //DEFAULT
    parentId: {
        type: String
    },
    dateInserted: {
        type: Date,
        required: true,
        default: Date.now
    },
    insertedBy: {
        type: String,
        required: true
    },
    //END of DEFAULT
    name: {
        type: String
    },
    address: {
        type: String
    }
});

TermsSchema.statics.getAll = function () {
    var clie = Terms.find();
    var user = User.getAll();

    return Promise.all([clie, user]).then(collections => {
        var data = [];

        collections[0].forEach((el) => {
            //this is to insert a value to parentId if it's null or undefined
            temp = el.parentId == null || el.parentId == undefined ? el._id : el.parentId;
            data.push(
                {
                    _id: el._id,
                    parentId: temp,
                    dateInserted: el.dateInserted,
                    insertedBy: collections[1].find(o => o._id == el.insertedBy),
                    name: el.name,
                    address: el.address
                }
            )
        })

        // to sort by dateInserted

        data.sort((a, b) => {
            if (a.dateInserted < b.dateInserted)
                return 1;
            if (a.dateInserted > b.dateInserted)
                return -1;
            return 0;
        });

        // this is to get distinct values of parentId

        data = _.uniqBy(data, (v) => {
            return JSON.stringify(v.parentId);
        });

        return data;
    });
}

// http://mongoosejs.com/docs/guide.html - for mongoose api

var Terms = mongoose.model('Terms', TermsSchema);
module.exports = { Terms };
