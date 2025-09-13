
import { DevInspectResults } from '@onelabs/sui/client';
import { bcs, fromHEX, toHEX } from '@onelabs/bcs';
import {message} from '@/lib/message'
import BigNumber from 'bignumber.js';
import i18n from '@/lib/i18n'

export const onCopyToText = (text:any) => {
    var textField = document.createElement('textarea')
    textField.innerText = text
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    message.success(i18n.t('common.copy'))
  };

  export const addPoint = (address:string, len = 5) => {
    return address ? address.substr(0, len) + '...' + address.substr(address.length - len,) : ''
  }
  export const numFormat = function (num:any) {
    num = num.toString().split(".");
    var arr = num[0].split("").reverse();
    var res = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      if (i % 3 === 0 && i !== 0) {
        res.push(",");
      }
      res.push(arr[i]);
    }
    res.reverse();

    if (num[1]) {
      return res.join("").concat("." + num[1]);
    } else {
      return res.join("");
    }
  }
  const howManyZero = (num:any) => {
    if (num > 1) {
      return 0
    } else {
      let zeronum = 0
      for (let i = 0; i <= 18; i++) {
        if (Number(num) >= Number(Math.pow(10, 0 - i))) {
          zeronum = i
          break;
        }
      }
      return zeronum - 1
    }
  }
  export const toFixed = (amount:any, num:any) => {
    if (Number(amount) < 1) {
      num <= howManyZero(amount) && (num = howManyZero(amount) + num)
    }
    return Math.floor(Number(amount) * Math.pow(10, num)) / Math.pow(10, num)
}

// 添加千分号的现代方法
export const formatNumber = (num: number | string, decimals: number = 2): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

// 简化的千分号方法
export const addCommas = (num: number | string): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('en-US');
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export const formatTimeStr = (time: string): string => {
  return new Date(time).toLocaleDateString() + ' ' + new Date(time).toLocaleTimeString()
}
export const formatTime = (time: string): string => {
  return new Date(time).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' ' + new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
export const Address = bcs.fixedArray(32, bcs.u8()).transform({
  input: (id) => {
    if (typeof id === 'string') {
      return fromHEX(id);
    }
    throw new Error('Address input must be a hex string');
  },
  output: (id) => {
      const hex = toHEX(Uint8Array.from(id));
    return hex.startsWith('0x') ? hex : '0x' + hex;
  },
});
export const ID = Address;
export const RwaProjectInfo = bcs.struct('RwaProjectInfo', {
  rwa_key: bcs.vector(bcs.u8()),
  version: bcs.u64(),
  project_id: ID,
  bank_id: ID,
  ido_id: ID,
  admin: Address,
  financier: Address,
  price: bcs.u64(),
  minimum_buy_amount: bcs.u64(),
  freeze_until_sold_out: bcs.bool(),
  isSoldOut: bcs.bool(),
  total_supply: bcs.u64(),
  remaining_supply: bcs.u64(),
  total_revenue: bcs.u64(),
  remaining_revenue: bcs.u64(),
  dividend_batches: bcs.u64(),
  total_dividend_funds: bcs.u64(),
  pending_dividend_funds: bcs.u64(),
  allow_sale: bcs.bool()
});
export function parseRwaProjectInfo(result: DevInspectResults): any {
  const returnValues = result.results?.[0]?.returnValues;
  if (returnValues && returnValues.length > 0) {
    const [bcsBytes] = returnValues[0];
    const info = RwaProjectInfo.parse(new Uint8Array(bcsBytes));
    return info;
  } else {
    return undefined;
  }
}
export const UserDividendRecord = bcs.struct('UserDividendRecord', {
  rwa_token_owned: bcs.u64(),
  dividend_income: bcs.u64(),
});
export const UserDividendRecords = bcs.vector(UserDividendRecord);
export function parseRwaUserDividendRecords(result: DevInspectResults): any {
  if (result === undefined || result === null || result.results === undefined || result.results === null) {
    return undefined;
  }
  const results = result.results;
  const returnValues = results[results.length - 1]?.returnValues;
  if (returnValues && returnValues.length > 0) {
    const [bcsBytes] = returnValues[0];
    const info = UserDividendRecords.parse(new Uint8Array(bcsBytes));
    return info;
  } else {
    return undefined;
  }
}
/**
 * 判断用户是否拒绝交易
 * @param error 错误对象
 * @returns 是否用户拒绝
 */
export const isUserRejectedTransaction = (error: any): boolean => {
  const errorMessage = error?.message || error?.toString() || '';
  return (
    errorMessage.includes('reject') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('User cancelled') ||
    errorMessage.includes('Transaction rejected') ||
    errorMessage.includes('User rejected the transaction') ||
    errorMessage.includes('cancelled') ||
    errorMessage.includes('denied') ||
    errorMessage.includes('rejected') ||
    errorMessage.includes('User declined') ||
    errorMessage.includes('User aborted') ||
    errorMessage.includes('User closed') ||
    errorMessage.includes('Transaction cancelled') ||
    errorMessage.includes('Transaction denied')
  );
};

/**
 * 处理交易错误，区分用户拒绝和其他错误
 * @param error 错误对象
 * @param onUserRejected 用户拒绝时的回调
 * @param onOtherError 其他错误时的回调
 */
export const handleTransactionError = (
  error: any,
  onUserRejected?: () => void,
  onOtherError?: () => void
) => {
  if (isUserRejectedTransaction(error)) {
    onUserRejected?.();
  } else {
    onOtherError?.();
  }
};


export function getCoinOutWithFees(
  coinInVal: number | string,
  reserveInSize: number | string,
  reserveOutSize: number | string,
  feeBps: number | string,
  slippage: number | string,
): number {
  const amountIn = Number(coinInVal) || 0
  const reserveIn = Number(reserveInSize) || 0
  const reserveOut = Number(reserveOutSize) || 0
  const fee = Number(feeBps) || 0
  const slippageVal = Number(slippage) || 0
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0
  // fee in BPS (e.g. 30 = 0.30%)
  const feeMultiplier = (10000 - fee) / 10000
  const amountInAfterFee = amountIn * feeMultiplier
  if (amountInAfterFee <= 0) return 0
  const k = new BigNumber(reserveIn).multipliedBy(reserveOut).toNumber()
  const reserveInSize_after = new BigNumber(reserveIn).plus(amountInAfterFee).toNumber()
  const reserveOutSize_after = new BigNumber(k).dividedBy(reserveInSize_after).toNumber() //bignumber  
  // x*y=k: out = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
  const out = new BigNumber(reserveOut).minus(reserveOutSize_after).multipliedBy(1-slippageVal).toNumber()
  return out > 0 ? out : 0
}
export function getCoinInWithFees(
  coinOutVal: number | string,
  reserveInSize: number | string,
  reserveOutSize: number | string,
  feeBps: number | string,
  slippage: number | string,
): number {
  const amountOut = Number(coinOutVal) || 0
  const reserveIn = Number(reserveInSize) || 0
  const reserveOut = Number(reserveOutSize) || 0
  const fee = Number(feeBps) || 0
  const slippageVal = Number(slippage) || 0
  if (amountOut <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0
  // fee in BPS (e.g. 30 = 0.30%)
  const feeMultiplier = (10000 + fee) / 10000
  const k = new BigNumber(reserveIn).multipliedBy(reserveOut).toNumber()
  const reserveInSize_after = new BigNumber(reserveIn).minus(amountOut).toNumber()
  const reserveOutSize_after = new BigNumber(k).dividedBy(reserveInSize_after).toNumber() //bignumber  
  // x*y=k: out = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
  const out = new BigNumber(reserveOutSize_after).minus(reserveOut).multipliedBy(1+slippageVal).multipliedBy(feeMultiplier).toNumber()
  return out > 0 ? out : 0
}