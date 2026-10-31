import { readFileSync } from 'node:fs';

const taxonomy = JSON.parse(readFileSync(
    new URL('../../../shared/complaint-categories.json', import.meta.url),
    'utf8'
));

export const complaintCategories = Object.freeze(taxonomy.categories.map(category => Object.freeze(category)));
export const complaintTaxonomyVersion = taxonomy.version;

const normalize = value => String(value ?? '')
    .trim().toLowerCase().replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const categoryByLabel = new Map();
for (const category of complaintCategories) {
    for (const label of [category.id, category.name, ...(category.aliases || [])]) {
        categoryByLabel.set(normalize(label), category);
    }
}

export function resolveComplaintCategoryLabel(label) {
    return categoryByLabel.get(normalize(label)) || null;
}
