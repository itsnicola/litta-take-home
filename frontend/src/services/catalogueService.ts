import { requestJson } from './APIService';

export type CatalogueCategory =
  | 'furniture'
  | 'appliances'
  | 'electronics'
  | 'general'
  | 'garden'

export interface CatalogueItem {
  id: number
  displayName: string
  category: CatalogueCategory
  baseFee: number
}


export async function loadCatalogue(): Promise<CatalogueItem[]> {
    try {
        const apiResponse = await requestJson<Record<string, unknown>[]>('/catalogue/', { method: 'GET'});
        const catalogueItems = apiResponse.map(mapCatalogueItem);

        // Sort alphabetically by category
        catalogueItems.sort((a: CatalogueItem, b: CatalogueItem) => {
            if (!a.category && !b.category) return 0;
            if (!a.category) return 1;
            if (!b.category) return -1;
            return a.category.localeCompare(b.category);
        });
        
        return catalogueItems;
    } catch (error) {
        console.log(error); // TODO: properly throw
        return [];
    }
}

export async function getQuote(catalogueItemId: number, quantity: number, postcode: string): Promise<number> {
    const params = { catalogueItemId, quantity, postcode }
    const apiResponse = await requestJson('/catalogue/quote', { method: 'GET' }, params);

    return Number(apiResponse);
}


function mapCatalogueItem(row: Record<string, any>): CatalogueItem {
    return {
        id: row.id as number,
        displayName: row.display_name,
        category: row.category as CatalogueCategory,
        baseFee: row.base_fee,
    };
}
