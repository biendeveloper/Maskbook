import type { ChainId } from '@masknet/web3-shared-evm'
import type { AssetsListResponse } from './type'
import { format } from './format'

export const OPENSEA_API_KEY = 'c38fe2446ee34f919436c32db480a2e3'

export async function getAssetsListFromOpenSea(
    from: string,
    opts: { chainId?: ChainId; page?: number; size?: number; collection?: string },
    apiKey: string,
) {
    const { page = 0, size = 50, collection } = opts
    const params = new URLSearchParams()
    params.append('owner', from.toLowerCase())
    params.append('limit', String(size))
    params.append('offset', String(size * page))
    if (collection) {
        params.append('collection', collection)
    }

    const response = await fetch(`https://api.opensea.io/api/v1/assets?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'x-api-key': apiKey ?? OPENSEA_API_KEY,
        },
    })
    return (await response.json()) as AssetsListResponse
}

export async function getOpenSeaNFTList(
    apiKey: string,
    address: string,
    page?: number,
    size?: number,
    collection?: string,
) {
    const { assets } = await getAssetsListFromOpenSea(address, { page, size, collection }, apiKey)
    return format(address, size ?? 50, assets)
}
