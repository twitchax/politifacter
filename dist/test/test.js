"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs");
const commands = require("../shared/commands");
describe('p0', function () {
    var fileName = 'people.json';
    before(function (done) {
        this.timeout(30000);
        commands.downloadAndSavePeople(fileName).then((people) => {
            chai_1.expect(people).to.not.be.empty;
            chai_1.expect(fs.existsSync(fileName)).to.be.true;
            done();
        });
    });
    after(function () {
        fs.unlinkSync(fileName);
    });
    describe('#sanityCheck', function () {
        it('check that tests are working', function () {
            chai_1.expect(1).to.equal(1);
            chai_1.expect(1).to.not.equal(0);
        });
    });
    describe('#downloadAndSavePeople()', function () {
        it('check that we can download people from service', function () {
            chai_1.expect(fs.existsSync(fileName)).to.be.true;
        });
    });
    describe('#analyze()', function () {
        it('check that we can analyze', function (done) {
            commands.analyze(fileName, 'first_name=Barack, last_name=Obama').then((stats) => {
                chai_1.expect(stats).to.not.be.undefined;
                chai_1.expect(stats).to.not.be.null;
                chai_1.expect(stats.people).to.not.be.empty;
                chai_1.expect(stats.people).to.have.length(1);
                done();
            }).catch(done);
        });
        it('check that analyze can fail', function (done) {
            commands.analyze(fileName, 'first_nameBarack').then(() => {
                done(Error('Completed successfully'));
            }).catch(() => {
                done();
            });
        });
        it('check that analyze can do advanced selection', function (done) {
            commands.analyze(fileName, 'party.party=Democrat, total_count>=50').then((stats) => {
                chai_1.expect(stats).to.not.be.undefined;
                chai_1.expect(stats).to.not.be.null;
                chai_1.expect(stats.people).to.not.be.empty;
                chai_1.expect(stats.people).to.have.length.above(1);
                done();
            }).catch(done);
        });
    });
});
describe('p1', function () {
    var fileName = 'statements.json';
    before(function (done) {
        this.timeout(300000);
        commands.downloadAndSaveStatements(fileName).then((people) => {
            chai_1.expect(people).to.not.be.empty;
            chai_1.expect(fs.existsSync(fileName)).to.be.true;
            done();
        });
    });
    after(function () {
        fs.unlinkSync(fileName);
    });
    describe('#downloadAndSavePeople()', function () {
        it('check that we can download statements from service', function () {
            chai_1.expect(fs.existsSync(fileName)).to.be.true;
        });
    });
});
//# sourceMappingURL=test.js.map