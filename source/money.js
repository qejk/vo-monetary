/**
 * Money: A ValueObject that represents an amount of a certain Currency.
 * EJSON compatible, can be transparently used in Meteor.methods and MongoDB.
 */
Money = Space.domain.ValueObject.extend('Money', {

  /**
   * To create a Money VO you need to provide at least an amount.
   * If no currency is given the Currency.DEFAULT_CURRENCY is taken.
   * Supports currency as instances of Currency or simple strings like 'EUR'
   */
  Constructor(amount, currency = Money.DEFAULT_CURRENCY) {
    let data = {};
    // Creation with a single object like {amount: 1, currency: 'EUR'}
    if (arguments.length === 1 && typeof(arguments[0]) === 'object') {
      data = amount;
      // Calculate amount from base to avoid rounding issues
      if (data.base !== undefined && data.decimals !== undefined) {
        data.amount = parseInt(data.base, 10) / Math.pow(10, data.decimals);
      } else {
        check(data.amount, Number);
      }
    } else {
    // Creation with a params: amount, currency
      check(amount, Number);
      data.amount = amount;
      data.currency = currency;
    }
    // Allow currency strings like 'EUR'
    if (!(data.currency instanceof Currency)) {
      data.currency = new Currency(data.currency || Money.DEFAULT_CURRENCY);
    }
    data.decimals = this._decimalPlaces(data.amount);
    data.base = (Math.floor(data.amount * Math.pow(10, data.decimals))).toString();
    // Let the superclass check the data!
    Space.domain.ValueObject.call(this, data);
    Object.freeze(this);
  },

  valueOf() {
    return this.amount;
  },

  fields() {
    return {
      amount: Number,
      base: String,
      decimals: Match.Integer,
      currency: Currency
    };
  },

  convert(rate, currency) {
    check(rate, Number);
    check(currency, Currency);
    if (this.isIn(currency)) {
      throw new Error(Money.ERRORS.sameCurrencyConversion(this.currency));
    }
    let result = new BigNumber(this.amount).multiply(rate).toNumber();
    return new Money({amount: result, currency: new Currency(currency)});
  },

  isEqual(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).isEqual(other.amount);
  },

  isGreaterThan(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).isGreaterThan(
      new BigNumber(other.amount)
    );
  },

  isGreaterThanOrEqualTo(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).isGreaterThanOrEqualTo(
      new BigNumber(other.amount)
    );
  },

  isLessThan(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).isLessThan(
      new BigNumber(other.amount)
    );
  },

  isLessThanOrEqualTo(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).isLessThanOrEqualTo(
      new BigNumber(other.amount)
    );
  },

  add(other) {
    this._validateCompatibility(other);
    let result = new BigNumber(this.amount).add(other.amount).toNumber();
    return new Money({amount: result, currency: this.currency});
  },

  subtract(other) {
    this._validateCompatibility(other);
    let result = new BigNumber(this.amount).subtract(other.amount).toNumber();
    return new Money({amount: result, currency: this.currency});
  },

  multiply(other) {
    this._validateCompatibility(other);
    let result = new BigNumber(this.amount).multiply(other.amount).toNumber();
    return new Money({amount: result, currency: this.currency});
  },

  divide(other) {
    this._validateCompatibility(other);
    let result = new BigNumber(this.amount).divide(other.amount).toNumber();
    return new Money({amount: result, currency: this.currency});
  },

  percentage(percentage) {
    let result = new BigNumber(this.amount).percentage(percentage).toNumber();
    return new Money({amount: result, currency: this.currency});
  },

  delta(other) {
    this._validateCompatibility(other);
    return new BigNumber(this.amount).subtract(other.amount).toNumber();
  },

  isIn(currency) {
    check(currency, Currency);
    return this.currency.equals(currency);
  },

  _validateCompatibility(other) {
    if (!other.currency || !this.isIn(other.currency)) {
      throw new Error(Money.ERRORS.currencyMissmatch(
        this.currency, other.currency
      ));
    }
    return true;
  },

  /**
   * Returns the number of decimal places of given number.
   * http://stackoverflow.com/questions/9539513/is-there-a-reliable-way-in-javascript-to-obtain-the-number-of-decimal-places-of
   */
  _decimalPlaces(n) {
    let a = Math.abs(n);
    let c = a;
    let count = 1;
    while (!this._isInteger(c) && isFinite(c)) {
      c = a * Math.pow(10, count++);
    }
    return Math.min(count - 1, 20);
  },

  _isInteger(n) {
    return (typeof n === 'number') && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
  }
});

Money.DEFAULT_CURRENCY = 'EUR';


Money.ERRORS = {
  sameCurrencyConversion(currency) {
    return `Converting to same currency '${currency.toString()}' is not allowed`;
  },
  currencyMissmatch(requiredCurrency, passedCurrency) {
    return `Currency passed '${passedCurrency.toString()}' does not match required
    '${requiredCurrency.toString()}'`;
  }
};

Money.prototype.eq = Money.prototype.isEqual;
Money.prototype.gt = Money.prototype.greaterThan = Money.prototype.isGreaterThan;
Money.prototype.gte = Money.prototype.greaterThanOrEqualTo = Money.prototype.isGreaterThanOrEqualTo;
Money.prototype.lt = Money.prototype.lessThan = Money.prototype.isLessThan;
Money.prototype.lte = Money.prototype.lessThanOrEqualTo = Money.prototype.isLessThanOrEqualTo;
Money.prototype.plus = Money.prototype.add;
Money.prototype.sub = Money.prototype.minus = Money.prototype.subtract;
Money.prototype.div = Money.prototype.dividedBy = Money.prototype.divide;
Money.prototype.mul = Money.prototype.times = Money.prototype.multiply;
Money.prototype.percent = Money.prototype.percentOf = Money.prototype.percentage