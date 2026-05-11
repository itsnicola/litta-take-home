import { pool } from '../db';

export type CatalogueCategory =
    | 'furniture'
    | 'appliances'
    | 'electronics'
    | 'general'
    | 'garden';

export interface CatalogueItem {
    id: number;
    name: string;
    display_name: string;
    category: CatalogueCategory;
    base_fee: number;
}

/**
 * Helper function to fetch all the available items in the catalogue from the DB
 * @returns 
 */
export const getCatalogue = async (): Promise<CatalogueItem[]> => {
    const DBResponse = await pool.query('SELECT * FROM catalogue');

    return DBResponse.rows.map(mapCatalogueItem);
};


// TODO: what happens if values are not as expected? Add error handling and validation as needed.
function mapCatalogueItem(row: any): CatalogueItem {
    return {
        id: row.id,
        name: row.name,
        display_name: row.display_name,
        category: row.category,
        base_fee: row.base_fee,
    };
}