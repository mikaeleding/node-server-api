const
    _ = require('lodash'),
    mongoose = require('mongoose'),
    validator = require('validator'),
    { User } = require('./user'),
    { Department } = require('./department');


var RefStatusPRFSchema = new mongoose.Schema({
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
    description: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true,
        unique: true
    },
    department: {
        type: Number,
    }
});

RefStatusPRFSchema.statics.getAll = function () {
    var orig = RefStatusPRF.find();
    var user = User.getAll();
    var dept = Department.getAll();

    return Promise.all([orig, user, dept]).then(collections => {
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
                    description: el.description,
                    code: el.code,
                    departmentId: collections[2].find(o => o.code == el.department)
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

var RefStatusPRF = mongoose.model('RefStatusPRF', RefStatusPRFSchema);
module.exports = { RefStatusPRF };
