

export  async function getCoinsObjectIdList(client: any, address: string, typeArg: string, leastAmount: number): Promise<Array<string>> {
    try {
      const ret: Array<string> = []
      let curAmount = 0
      let data = await client.getCoins({
        owner: address,
        coinType: typeArg,
      })
      for (const item of data.data) {
        ret.push(item.coinObjectId)
        curAmount = curAmount + Number(item.balance)
        if (curAmount >= leastAmount) break
      }
      while (curAmount < leastAmount && data.hasNextPage) {
        data = await client.getCoins({
          owner: address,
          coinType: typeArg,
          cursor: data.nextCursor,
        })
        for (const item of data.data) {
          ret.push(item.coinObjectId)
        curAmount = curAmount + Number(item.balance)
          if (curAmount >= leastAmount) break
        }
      }
      return ret
    } catch (e) {
      return []
    }
  }