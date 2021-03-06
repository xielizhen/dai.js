import { currencies, getCurrency } from '../Currency';

export default class Erc20Token {
  constructor(contract, web3Service, decimals = 18, symbol) {
    this._contract = contract;
    this._web3 = web3Service;
    this._decimals = decimals;
    this.symbol = symbol;
    this._currency = currencies[symbol];
  }

  async allowance(tokenOwner, spender) {
    return this._valueFromContract(
      await this._contract.allowance(tokenOwner, spender)
    );
  }

  async balanceOf(owner) {
    return this._valueFromContract(await this._contract.balanceOf(owner));
  }

  async totalSupply() {
    return this._valueFromContract(await this._contract.totalSupply());
  }

  address() {
    return this._contract.address;
  }

  _valueForContract(value, unit = this._currency) {
    return getCurrency(value, unit).toEthersBigNumber(this._decimals);
  }

  _valueFromContract(value) {
    return this._currency(value, -1 * this._decimals);
  }

  approve(spender, value, { unit = this._currency, ...options } = {}) {
    return this._contract.approve(
      spender,
      this._valueForContract(value, unit),
      {
        metadata: {
          action: {
            name: 'approve',
            spender: this._web3.currentAccount(),
            allowance: getCurrency(value, unit),
            allowing: value != '0'
          }
        },
        ...options
      }
    );
  }

  approveUnlimited(spender, options = {}) {
    return this._contract.approve(spender, -1, {
      metadata: {
        action: {
          name: 'approve',
          spender: this._web3.currentAccount(),
          allowance: Number.MAX_SAFE_INTEGER,
          allowing: true,
          unlimited: true
        }
      },
      ...options
    });
  }

  transfer(to, value, { unit = currencies[this.symbol], promise } = {}) {
    return this._contract.transfer(to, this._valueForContract(value, unit), {
      metadata: {
        action: {
          name: 'transfer',
          from: this._web3.currentAccount(),
          to,
          amount: getCurrency(value, unit)
        }
      },
      promise
    });
  }

  transferFrom(
    from,
    to,
    value,
    { unit = currencies[this.symbol], promise } = {}
  ) {
    return this._contract.transferFrom(
      from,
      to,
      this._valueForContract(value, unit),
      {
        metadata: {
          action: {
            name: 'transfer',
            from,
            to,
            amount: getCurrency(value, unit)
          }
        },
        promise
      }
    );
  }
}
