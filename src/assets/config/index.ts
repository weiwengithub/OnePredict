import testnet from './testnet.json';
import mainnet from './mainnet.json';
import { tokenList } from './token';

interface TokenListItem {
    coinType: string;
    symbol: string;
    decimals: number;
    icon?: string;
}

testnet.showBalancesTokenList = testnet.showBalancesTokenList.map((item: TokenListItem) => ({
    ...item,
    icon: tokenList[item.symbol as keyof typeof tokenList]
}))
mainnet.showBalancesTokenList = mainnet.showBalancesTokenList.map((item: TokenListItem) => ({
    ...item,
    icon: tokenList[item.symbol as keyof typeof tokenList]
}))

const onechain_testnet = testnet
const onechain_mainnet = mainnet
const isMainnet = '1'
const currentNetwork = (isMainnet === '1') ? onechain_mainnet : onechain_testnet
export default currentNetwork
export const showBalancesTokenList = currentNetwork.showBalancesTokenList
export const rightNetwork = currentNetwork.rightNetwork
export const chainName = currentNetwork.chainName
