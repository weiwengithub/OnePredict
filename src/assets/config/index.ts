import testnet from './testnet.json';
import mainnet from './mainnet.json';

interface TokenListItem {
    coinType: string;
    symbol: string;
    decimals: number;
    icon?: string;
}

testnet.showBalancesTokenList = testnet.showBalancesTokenList.map((item: TokenListItem) => ({
    ...item,
}))
mainnet.showBalancesTokenList = mainnet.showBalancesTokenList.map((item: TokenListItem) => ({
    ...item,
}))

const onechain_testnet = testnet
const onechain_mainnet = mainnet
const currentNetwork = Number(process.env.NEXT_PUBLIC_IS_MAINNET) ? onechain_mainnet : onechain_testnet
export default currentNetwork
export const showBalancesTokenList = currentNetwork.showBalancesTokenList
export const rightNetwork = currentNetwork.rightNetwork
export const chainName = currentNetwork.chainName
export const colors = ['#28C04E', '#F95D5D','#FF8725', '#FFD918','#1CE0E8', '#1A8EFF','#805CFF', '#CF4BC6' ]

export const tokenIcon = 'https://file.one-wallet.cc/app/temp/upload/2025/10/c2974bd96ec429a87142f7384866a39b.png';
