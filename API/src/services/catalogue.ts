import { pool } from '../db';
import { randomBytes } from 'crypto';

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

export interface BookingRequest {
    bookingReference: string;
    quote: number;
    status: string;
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


export async function postRequest(catalogueItemId: number, quantity: number, postcode: string, userName: string, userEmail: string): Promise<BookingRequest> {
    await pool.query(`
        INSERT INTO users(display_name, email)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE display_name = $1 AND email = $2)
        `, [userName, userEmail]);

    const userLookupResponse = await pool.query(`
        SELECT id FROM users WHERE display_name = $1 AND email = $2`
    , [userName, userEmail]);

    const userId = userLookupResponse.rows[0]?.id;
    const quote = await getQuote(catalogueItemId, quantity, postcode);
    const bookingReference = generateRef(catalogueItemId, postcode);

    await pool.query(`
        INSERT INTO booking(item_id, user_id, reference, item_number, quote, booking_status)
        VALUES($1, $2, $3, $4, $5, 'PENDING')
        `, [catalogueItemId, userId, bookingReference, quantity, quote]);

    return {
        bookingReference,
        quote,
        status: 'PENDING',
    };
}

function generateRef(catalogueItemId: number, postcode: string) {
    const normalizedPostcode = postcode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const postcodeFragment = (normalizedPostcode || 'XXXX').slice(0, 4).padEnd(4, 'X');
    const itemFragment = String(catalogueItemId).padStart(2, '0').slice(-2);
    const randomFragment = randomBytes(3).toString('hex').toUpperCase();

    return `LIT-${itemFragment}-${postcodeFragment}-${randomFragment}`;
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
