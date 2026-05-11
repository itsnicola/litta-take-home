import { requestJson } from './APIService';

export type CatalogueCategory =
  | 'furniture'
  | 'appliances'
  | 'electronics'
  | 'general'
  | 'garden'

export interface CatalogueItem {
  id: number | string
  name?: string
  category?: CatalogueCategory
  [key: string]: unknown
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
function mapCatalogueItem(row: Record<string, unknown>): CatalogueItem {
    return {
        id: row.id as number | string,
        name: row.name as string | undefined,
        display_name: row.display_name,
        category: row.category as CatalogueCategory | undefined,
        base_fee: row.base_fee,
    };
}
