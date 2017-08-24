describe('A demo test suite', function () {
    var flag, value;

    it('1.1.0 should assert true', function () {
        expect(true).toBeTruthy();
    });

    describe('with an inner suite', function () {
        it('1.2.0 should assert true', function () {
            expect(true).toBeTruthy();
        });

        describe('with an inner suite 2', function () {
            it('1.3.0 should assert true the slow async', function () {
                expect(true).toBeTruthy();

                runs(function () {
                    flag = false;
                    value = 0;

                    setTimeout(function () {
                        flag = true;
                    }, 1500);
                });

                waitsFor(function() {
                    value++;
                    return flag;
                }, 'The Value should be incremented', 2000);

                runs(function() {
                    expect(value).toBeGreaterThan(0);
                });
            });

            it('1.3.1 should assert true the slow async', function () {
                expect(true).toBeTruthy();

                runs(function () {
                    flag = false;
                    value = 0;

                    setTimeout(function () {
                        flag = true;
                    }, 1500);
                });

                waitsFor(function() {
                    value++;
                    return flag;
                }, 'The Value should be incremented', 2000);

                runs(function() {
                    expect(value).toBeGreaterThan(0);
                });
            });

            it('1.3.2 should fail', function () {
                expect(true).toBeFalsy();
            });
        });

        it('1.2.1 should assert true', function () {
            expect(true).toBeTruthy();
        });

        it('1.2.2 should assert true the slow async', function () {
            expect(true).toBeTruthy();

            runs(function () {
                flag = false;
                value = 0;

                setTimeout(function () {
                    flag = true;
                }, 1500);
            });

            waitsFor(function() {
                value++;
                return flag;
            }, 'The Value should be incremented', 2000);

            runs(function() {
                expect(value).toBeGreaterThan(0);
            });
        });
    });

    xdescribe('ignored', function () {
        it('should be skipped', function () {
            expect(true).toBeTruthy();
        });
    });

    xit('should be skipped', function () {
        expect(true).toBeTruthy();
    });

    it('1.4.0 should fail', function () {
        expect(true).toBeFalsy();
    });
});