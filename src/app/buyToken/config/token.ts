// config/token.ts
export const TOKEN_CONFIG = {
  name: '$SRA',
  address: '0x424516fBe635c5642723AB6c1b413fF61B177dd6',
  abi: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address) view returns (uint)',
    'function transfer(address to, uint amount) returns (bool)',
    'function buy() payable returns (bool)',  // Add the buy function
  ],
  priceInBNB: 0.001,
} as const;
