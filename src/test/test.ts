import { expect } from 'chai';
import * as fs from 'fs';

import { Person } from '../shared/bll';
import * as commands from '../shared/commands';

describe('p0', function () {
    var fileName = 'people.json';

    before(function (done) {
        this.timeout(30000);

        commands.downloadAndSavePeople(fileName).then((people) => {
            expect(people).to.not.be.empty;
            expect(fs.existsSync(fileName)).to.be.true;
            done();
        });
    });

    after(function() {
        fs.unlinkSync(fileName);
    });

    describe('#sanityCheck', function () {
        it('check that tests are working', function () {
            expect(1).to.equal(1);
            expect(1).to.not.equal(0);
        });
    });

    describe('#downloadAndSavePeople()', function () {
        it('check that we can download people from service', function () {
            expect(fs.existsSync(fileName)).to.be.true;
        });
    });

    describe('#analyze()', function () {
        it('check that we can analyze', function (done) {
            commands.analyze(fileName, 'first_name=Barack, last_name=Obama').then((stats) => {
                expect(stats).to.not.be.undefined;
                expect(stats).to.not.be.null;
                expect(stats.people).to.not.be.empty;
                expect(stats.people).to.have.length(1);
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
                expect(stats).to.not.be.undefined;
                expect(stats).to.not.be.null;
                expect(stats.people).to.not.be.empty;
                expect(stats.people).to.have.length.above(1);
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
            expect(people).to.not.be.empty;
            expect(fs.existsSync(fileName)).to.be.true;
            done();
        });
    });

    after(function() {
        fs.unlinkSync(fileName);
    });

    describe('#downloadAndSavePeople()', function () {
        it('check that we can download statements from service', function () {
            expect(fs.existsSync(fileName)).to.be.true;
        });
    });
});