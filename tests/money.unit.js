describe("Money", function() {

  beforeEach(function (){
    this.currencies = {
      usd: new Currency('USD'),
      eur: new Currency('EUR')
    }
  });

  describe('construction', function() {

    it('takes a currency and value for construction', function() {
      let euro = new Currency('EUR');
      let amount = 5.50;
      let price = new Money(amount, euro);
      expect(price.currency.code).to.equal('EUR');
      expect(price.amount).to.equal(amount);
    });

    it('assumes euro as the default currency if none is given', function() {
      expect(new Money(5).currency.code).to.equal('EUR');
    });

    it('requires a value for construction', function() {
      let euro = new Currency('EUR');
      expect(function() { new Money(euro); }).to.throw(Error);
    });

    it('ensures that the value is a number', function() {
      expect(function() { new Money('20'); }).to.throw(Error);
    });

    it('the value can be positive and negative', function() {
      expect(function() { new Money(999); }).not.to.throw();
      expect(function() { new Money(-1213.40); }).not.to.throw();
    });

    it('allows to provide currency as string', function() {
      expect(function() { new Money(5, 'EUR'); }).not.to.throw(Error);
    });

    it('keeps the floating point precision', function() {
      let money = new Money(1.15555555);
      expect(money.amount).to.equal(1.15555555);
    });

    it('uses given base and multiplier to calculate the amount', function() {
      let first = new Money(9.999);
      let second = new Money({ base: 9999, decimals: 3 });
      expect(first.amount).to.equal(second.amount);
    });

  });

  describe('using value in calculations', function() {

    it('returns its value correctly', function() {
      let money = new Money(5);
      expect(money + 5).to.equal(10);
    });

  });

  describe("serialization", function() {

    it('supports decimal places', function() {
      let original = new Money(9.9999, 'EUR');
      let copy = EJSON.parse(EJSON.stringify(original));
      expect(copy.base).to.equal(original.base);
      expect(copy.decimals).to.equal(original.decimals);
      expect(copy.amount).to.equal(original.amount);
      expect(copy.currency.code).to.equal(original.currency.code);
    });

    it('handles 0 values correctly', function() {
      let original = new Money(0, 'EUR');
      let copy = EJSON.parse(EJSON.stringify(original));
      expect(copy.base).to.equal(original.base);
      expect(copy.decimals).to.equal(original.decimals);
      expect(copy.amount).to.equal(original.amount);
      expect(copy.currency.code).to.equal(original.currency.code);
    });
  });

  describe('comparison', function() {

    it("returns true if money is in specific currency", function() {
      let money = new Money({amount: 5, currency: this.currencies.usd});
      expect(money.isIn(this.currencies.usd)).to.be.true;
    });

    it("returns false if money is not in specific currency", function() {
      let money = new Money({amount: 5, currency: this.currencies.usd});
      expect(money.isIn(this.currencies.eur)).to.be.false;
    });

    describe('equality', function() {
      it('is equal when value and currency are the same', function() {
        let money1 = new Money({amount: 5, currency: this.currencies.eur});
        let money2 = new Money({amount: 5, currency: this.currencies.eur});
        expect(money1.equals(money2)).to.be.true;
      });

      return it('is not equal if value and currency are not the same', function() {
        let money1 = new Money({amount: 5, currency: this.currencies.eur});
        let money2 = new Money({amount: 5, currency: this.currencies.usd});
        let money3 = new Money({amount: 3, currency: this.currencies.eur});
        expect(money1.equals(money2)).to.be.false;
        expect(money1.equals(money3)).to.be.false;
        expect(money2.equals(money3)).to.be.false;
      });

    });

    describe('isEqual', function() {
      it('returns true for same amount in same currency', function() {
        let value1 = new Money({amount: 1, currency: this.currencies.eur});
        let value2 = new Money({amount: 1, currency: this.currencies.eur});
        expect(value1.isEqual(value2)).to.be.true;
      });

      it('returns false for different amount in same currency', function() {
        let value1 = new Money({amount: 2, currency: this.currencies.eur});
        let value2 = new Money({amount: 1, currency: this.currencies.eur});
        expect(value1.isEqual(value2)).to.be.false;
      });

      it('throws error if money is not a valid money', function() {
        expect(function() { new Money(5, 'EUR').isEqual(1); }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).isEqual(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('aliases', function() {
        expect(Money.prototype.eq === Money.prototype.isEqual).to.be.true;
      });

    });

    describe('isGreaterThan', function() {
      it('compares two money in same currency', function() {
        let value1 = new Money({amount: 2, currency: this.currencies.usd});
        let value2 = new Money({amount: 1, currency: this.currencies.usd});
        expect(value1.isGreaterThan(value2)).to.be.true;
        expect(value2.isGreaterThan(value1)).to.be.false;
      });

      it('throws error if money is not a valid money', function() {
        expect(function() { new Money(5, 'EUR').isGreaterThan(1); }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).isGreaterThan(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('aliases', function() {
        expect(
          Money.prototype.greaterThan === Money.prototype.isGreaterThan
        ).to.be.true;
        expect(
          Money.prototype.gt === Money.prototype.isGreaterThan
        ).to.be.true;
      });

    });

    describe('isGreaterThanOrEqualTo', function() {

      it('compares two money in same currency', function() {
        let value1 = new Money({amount: 2, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        expect(value1.isGreaterThanOrEqualTo(value2)).to.be.true;
        expect(value2.isGreaterThanOrEqualTo(value1)).to.be.true;
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).isGreaterThanOrEqualTo(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).isGreaterThanOrEqualTo(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('aliases', function() {
        expect(
          Money.prototype.greaterThanOrEqualTo === Money.prototype.isGreaterThanOrEqualTo
        ).to.be.true;
        expect(
          Money.prototype.gte === Money.prototype.isGreaterThanOrEqualTo
        ).to.be.true;
      });

    });

    describe('isLessThan', function() {

      it('compares two money in same currency', function() {
        let value1 = new Money({amount: 1, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        expect(value1.isLessThan(value2)).to.be.true;
        expect(value2.isLessThan(value1)).to.be.false;
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).isLessThan(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).isLessThan(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('aliases', function() {
        expect(
          Money.prototype.lessThan === Money.prototype.isLessThan
        ).to.be.true;
        expect(
          Money.prototype.lt === Money.prototype.isLessThan
        ).to.be.true;
      });

    });

    describe('isLessThanOrEqualTo', function() {

      it('compares two money in same currency', function() {
        let value1 = new Money({amount: 2, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        expect(value1.isLessThanOrEqualTo(value2)).to.be.true;
        expect(value2.isLessThanOrEqualTo(value1)).to.be.true;
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).isLessThanOrEqualTo(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).isLessThanOrEqualTo(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('aliases', function() {
        expect(
          Money.lessThanOrEqualTo === Money.isLessThanOrEqualTo
        ).to.be.true;
        expect(
          Money.prototype.lte === Money.prototype.isLessThanOrEqualTo
        ).to.be.true;
      });

    });

  });

  describe('calculation', function() {

    describe('addition', function() {

      it('returns a new money with the sum of both with same currency', function() {
        let value1 = new Money({amount: 1, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        let result = value1.add(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(3);
        expect(result.currency).to.equal(this.currencies.usd);
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).add(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).add(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.1, currency: this.currencies.usd});
        let value2 = new Money({amount: 0.2, currency: this.currencies.usd});
        let result = value1.add(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(0.3);
      });

      it('aliases', function() {
        expect(Money.prototype.plus === Money.prototype.add).to.be.true;
      });

    });

    describe('subtraction', function() {

      it('returns a new money with the difference of both with same currency', function() {
        let value1 = new Money({amount: 2, currency: this.currencies.usd});
        let value2 = new Money({amount: 1, currency: this.currencies.usd});
        let result = value1.subtract(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(1);
        expect(result.amount).not.to.equal(0.30000000000000004);
        expect(result.currency).to.equal(this.currencies.usd);
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).subtract(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).subtract(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.3, currency: this.currencies.usd});
        let value2 = new Money({amount: 0.2, currency: this.currencies.usd});
        let result = value1.subtract(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(0.1);
        expect(result.amount).not.to.equal(0.09999999999999998);
      });

      it('aliases', function() {
        expect(Money.prototype.minus === Money.prototype.subtract).to.be.true;
        expect(Money.prototype.sub === Money.prototype.subtract).to.be.true;
      });

    });

    describe('multiplication', function() {

      it('returns a new money with value multiplied by another in same currency', function() {
        value1 = new Money({amount: 2, currency: this.currencies.usd});
        value2 = new Money({amount: 2, currency: this.currencies.usd});
        let result = value1.multiply(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(4);
        expect(result.currency).to.equal(this.currencies.usd);
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).multiply(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).multiply(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.1, currency: this.currencies.usd});
        let value2 = new Money({amount: 0.2, currency: this.currencies.usd});
        let result = value1.multiply(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(0.02);
        expect(result.amount).not.to.equal(0.020000000000000004);
      });

      it('aliases', function() {
        expect(Money.prototype.mul === Money.prototype.multiply).to.be.true;
        expect(Money.prototype.times === Money.prototype.multiply).to.be.true;
      });

    });

    describe('division', function() {

      it('returns a new money with value divided by another in same currency', function() {
        let value1 = new Money({amount: 4, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        let result = value1.divide(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(2);
        expect(result.currency).to.equal(this.currencies.usd);
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).divide(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).divide(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.3, currency: this.currencies.usd});
        let value2 = new Money({amount: 0.2, currency: this.currencies.usd});
        let result = value1.divide(value2);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(1.5);
        expect(result.amount).not.to.equal(1.4999999999999998);
      });

      it('aliases', function() {
        expect(Money.prototype.div === Money.prototype.divide).to.be.true;
        expect(Money.prototype.dividedBy === Money.prototype.divide).to.be.true;
      });

    });

    describe("percentage", function() {
      it('returns percent of a value', function() {
        let result = new Money({
          amount: 100, currency: this.currencies.usd
        }).percentage(20);

        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.be.equal(20);
        expect(result.currency).to.be.equal(this.currencies.usd);
      });

      it('throws error if percentage is not a number', function() {
        expect(function () {
          new Money({amount: 1, currency: currency1}).percentage(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(Error);
      });

      it('ensures correct decimal value', function() {
        let value = new Money({amount: 32.32, currency: this.currencies.usd});
        let result = value.percentage(10);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(3.232);
        expect(result.amount).not.to.equal(3.2319999999999998);
      });

      it('aliases', function() {
        expect(
          Money.prototype.percent === Money.prototype.percentage
        ).to.be.true;
        expect(
          Money.prototype.percentOf === Money.prototype.percentage
        ).to.be.true;
      });
    });

    describe("delta", function() {
      it("returns the delta", function() {
        let value1 = new Money({amount: 6, currency: this.currencies.usd});
        let value2 = new Money({amount: 2, currency: this.currencies.usd});
        expect(value1.delta(value2)).to.equal(4);
        expect(value2.delta(value1)).to.equal(-4);
      });

      it('throws error if money is not a valid money', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).delta(1);
        }).to.throw(Error);
      });

      it('throws error if both instances of money are not in same currency', function() {
        let currency1 = this.currencies.usd
        let currency2 = this.currencies.eur
        expect(function () {
          new Money({amount: 1, currency: currency1}).delta(
            new Money({amount: 1, currency: currency2})
          );
        }).to.throw(
          Money.ERRORS.currencyMissmatch(currency1, currency2)
        );
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.3, currency: this.currencies.usd});
        let value2 = new Money({amount: 0.2, currency: this.currencies.usd});
        let result = value1.delta(value2);
        expect(typeof result == 'number').to.be.true;
        expect(result).to.equal(0.1);
        expect(result).not.to.equal(0.09999999999999998);
      });

    });

    describe("conversion", function() {
      it("returns converted money with specified currency", function() {
        let value = new Money({amount: 1, currency: this.currencies.usd});
        let result = value.convert(0.88, this.currencies.eur)
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(0.88);
        expect(result.currency).to.eql(this.currencies.eur);
      });

      it('throws error if rate is not a valid number', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).convert('abcd');
        }).to.throw(Error);
      });

      it('throws error if currency is not a valid currency', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).convert(1, 'EUR');
        }).to.throw(Error);
      });

      it('throws error if trying to convert to same currency', function() {
        expect(function() {
          new Money({amount: 5, currency: 'EUR'}).convert(1, new Currency('EUR'));
        }).to.throw(Error);
      });

      it('ensures correct decimal value', function() {
        let value1 = new Money({amount: 0.1, currency: this.currencies.usd});
        let result = value1.convert(0.2, this.currencies.eur);
        expect(result).to.be.instanceof(Money);
        expect(result.amount).to.equal(0.02);
        expect(result.amount).not.to.equal(0.020000000000000004);
      });

    });
  });

  describe('immutability', function() {
    it('freezes itself', function() {
      expect(Object.isFrozen(new Money(5))).to.be.true;
    });
  });
});
