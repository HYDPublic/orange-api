"use strict";
var chakram         = require("chakram"),
    util            = require("util"),
    curry           = require("curry"),
    auth            = require("../common/auth.js"),
    patients        = require("../patients/common.js"),
    fixtures        = require("./fixtures.js");

var expect = chakram.expect;

describe("Doctors", function () {
    describe("Create New Doctor (POST /patients/:patientid/doctors)", function () {
        // basic endpoint
        var create = function (data, patientId, accessToken) {
            var url = util.format("http://localhost:5000/v1/patients/%d/doctors", patientId);
            return chakram.post(url, data, auth.genAuthHeaders(accessToken));
        };

        // given a patient and user nested within the patient, try and create a new
        // doctor for the patient based on the factory template
        var createDoctor = function (data, patient) {
            return fixtures.build("Doctor", data).then(function (doctor) {
                return create(doctor, patient._id, patient.user.accessToken);
            });
        };
        // create patient and user automatically
        var createPatientDoctor = function (data) {
            return patients.testMyPatient({}).then(curry(createDoctor)(data));
        };

        // check it requires a valid user and patient
        patients.itRequiresAuthentication(curry(create)({}));
        patients.itRequiresValidPatientId(curry(create)({}));
        patients.itRequiresWriteAuthorization(curry(createDoctor)({}));

        it("creates patients", function () {
            return expect(createPatientDoctor({})).to.be.a.doctor.createSuccess;
        });

        // validation testing
        it("requires a name", function () {
            return expect(createPatientDoctor({ name: undefined })).to.be.an.api.error(400, "name_required");
        });
        it("does not allow a blank name", function () {
            return expect(createPatientDoctor({ name: "" })).to.be.an.api.error(400, "name_required");
        });
        it("does not allow a null name", function () {
            return expect(createPatientDoctor({ name: null })).to.be.an.api.error(400, "name_required");
        });

        it("does not require anything other than a name", function () {
            return expect(createPatientDoctor({
                phone: undefined,
                address: undefined,
                notes: undefined,
                title: undefined
            })).to.be.a.doctor.createSuccess;
        });
        it("allows nulls for everything other than name", function () {
            return expect(createPatientDoctor({
                phone: null,
                address: null,
                notes: null,
                title: null
            })).to.be.a.doctor.createSuccess;
        });
        it("allows blank strings for all fields other than name", function () {
            return expect(createPatientDoctor({
                phone: "",
                address: "",
                notes: "",
                title: ""
            })).to.be.a.doctor.createSuccess;
        });
    });
});
