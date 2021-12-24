import type { ChainId } from '@masknet/web3-shared-evm'
import type { AssetsListResponse, AssetCollection } from './type'
import { format } from './format'

export const OPENSEA_API_KEY = 'c38fe2446ee34f919436c32db480a2e3'
export const OPENSEA_API = 'https://api.opensea.io'

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

    const response = await fetch(`${OPENSEA_API}/api/v1/assets?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'x-api-key': apiKey ?? OPENSEA_API_KEY,
        },
    })
    return (await response.json()) as AssetsListResponse
}

export async function getCollectionsFromOpenSea(owner: string, opts: { page?: number; size?: number }) {
    const { page = 0, size = 300 } = opts
    const params = new URLSearchParams()
    params.append('asset_owner', owner.toLowerCase())
    params.append('limit', String(size))
    params.append('offset', String(size * page))

    const response = await fetch(`${OPENSEA_API}/api/v1/collections?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'x-api-key': OPENSEA_API_KEY,
        },
    })
    const collections = (await response.json()) as AssetCollection[]

    return { collections }
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

export interface Collection {
    name: string
    image: string
    slug: string
}
export async function getOpenSeaCollectionList(apiKey: string, address: string, page?: number, size?: number) {
    const { collections } = await getCollectionsFromOpenSea(address, { page, size })
    return {
        data: collections.map((x) => ({
            name: x.name,
            image: x.image_url || undefined,
            slug: x.slug,
        })) as Collection[],
        hasNextPage: collections.length === size,
    }
}
