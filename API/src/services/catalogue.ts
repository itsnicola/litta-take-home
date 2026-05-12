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

async function getCatalogueItem(catalogueItemId: number): Promise<CatalogueItem> {
    const DBRepsonse = await pool.query(`SELECT * FROM catalogue WHERE id = ($1)`, [catalogueItemId])

    return mapCatalogueItem(DBRepsonse.rows[0]);
}

export async function getQuote(catalogueItemId: number, quantity: number, postcode: string) {
    const baseFee = (await getCatalogueItem(catalogueItemId)).base_fee;

    const quote = (quantity * baseFee) + postcodeSurcharge(postcode);
    return quote;
}


/**
 * Rule for postcode surcharge is as follows: 
  - Remove spaces and uppercase the postcode.
  - Convert letters to A=1 through Z=26, weighted by position.
  - Extract the numeric part and its digit sum.
  - Compute floor((letterScore * 1000) / (digitValue + digitSum)).
  - Fold that into the target range with 2 + (rawScore % 29).
 * @param postcode 
 * @returns 
 */
function postcodeSurcharge(postcode: string): number {
    const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const letters = normalizedPostcode.replace(/[^A-Z]/g, '');
    const digits = normalizedPostcode.replace(/[^0-9]/g, '');

    const letterScore = Array.from(letters).reduce((total, letter, index) => {
        const alphabetPosition = letter.charCodeAt(0) - 64;
        return total + (alphabetPosition * (index + 1));
    }, 0);

    const digitValue = Number(digits) || 1;
    const digitSum = Array.from(digits).reduce((total, digit) => total + Number(digit), 0) || 1;

    // Mix weighted letter positions with the numeric part, then clamp into a stable 2..30 band.
    const rawScore = Math.floor((letterScore * 1000) / (digitValue + digitSum));

    return 2 + (Math.abs(rawScore) % 29);
}


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
