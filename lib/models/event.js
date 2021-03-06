"use strict";
var mongoose        = require("mongoose"),
    moment          = require("moment"),
    errors          = require("../errors.js").ERRORS,
    autoIncrementId = require("./helpers/increment_plugin.js"),
    DATE_FORMAT     = require("./helpers/time.js").DATE_FORMAT;

/*eslint-disable key-spacing */


var EventEntrySchema = module.exports = new mongoose.Schema({
    _id:            { type: Number, required: true },
    date:           { type: Date, required: true },
    location:       { type: String, required: false },
    name:           { type: String, required:true },
    description:    { type: String, required: false },
    eventLength:    { type: Number, required: false }
});

EventEntrySchema.plugin(autoIncrementId, { slug: "eventEntryId" });

EventEntrySchema.methods.setData = function (data) {

    if (typeof data.date !== "undefined") {
            // don't allow blank dates!
            if (data.date === "") return errors.DATE_REQUIRED;

            // validate the date in here, because casting to date (which could a) cause errors
            // and b) silently fail) happens before standard validation
            var date = moment.utc(data.date, DATE_FORMAT);
            if (!date.isValid()) {
                // set date to current date, otherwise mongoose will give date_required as
                // an additional error
                this.date = Date.now();
                // we explicitly handle this wherever use setData

                /*eslint-disable consistent-return */
                return errors.INVALID_DATE;
                /*eslint-enable consistent-return */
            }
            this.date = date;
        }

    if (typeof data.location !== "undefined") this.location = data.location;

    if (typeof data.name !== "undefined") this.name = data.name;

    if (typeof data.description !== "undefined") this.description = data.description;

    if (typeof data.eventLength !== "undefined") this.eventLength = data.eventLength;
};

EventEntrySchema.methods.getData = function () {

    var data = {
            _id:            this._id,
            date:           moment(this.date).format(DATE_FORMAT),
            name:           this.name,
            eventLength:    this.eventLength
        };

    //optionally add location, description and length

    if (typeof this.location !== "undefined" && this.location !== null) data.location = this.location;

    if (typeof this.description !== "undefined" && this.description !== null) data.description = this.description;

    if (typeof this.eventLength !== "undefined" && this.eventLength !== null) data.eventLength = this.eventLength;

    return data;
};

// use null values to reset optional fields
EventEntrySchema.pre("save", function (next) {
    if (this.location === null) this.location = "";
    if (this.description === null) this.description = [];
    next();
});
