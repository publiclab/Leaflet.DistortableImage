describe('2 Demo test suite', function () {
    it('should assert true', function () {
        expect(true).toBeTruthy();
    });

    xdescribe('ignored', function () {
        it('should be skipped', function () {
            expect(true).toBeTruthy();
        });
    });

    it('should assert true 1', function () {
        expect(true).toBeTruthy();
    });

    describe('Reserved words', function () {
        it('toString', function () {
            var list = [1, 2];
            expect(list.toString()).toBe('1,2');
        });

        describe('constructor', function () {
            it('hasOwnProperty', function () {
                expect(true).toBeTruthy();
            });
        });
    });
});