export const entityAssetRegistry = {
  base: '/assets/entities/base/',
  bodies: '/assets/entities/bodies/',
  heads: '/assets/entities/heads/',
  hair: '/assets/entities/hair/',
  clothing: '/assets/entities/clothing/',
  shoes: '/assets/entities/shoes/',
  jewelry: '/assets/entities/jewelry/',
  props: '/assets/entities/props/',
  weapons: '/assets/entities/weapons/',
  tattoos: '/assets/entities/tattoos/',
  environments: '/assets/entities/environments/',
  animations: '/assets/entities/animations/',
}

export function assetPath(category, fileName) {
  return `${entityAssetRegistry[category] || entityAssetRegistry.base}${fileName}`
}
