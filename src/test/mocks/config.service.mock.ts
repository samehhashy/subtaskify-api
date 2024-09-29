export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'PORT':
        return 3000;
      case 'JWT_SECRET':
        return '7bq0lwNYAAmTjOrrEqoEPz6Pfo5n+rDvoN5GoTzRDOc='; // This is a fake secret and should remain so
      default:
        return null;
    }
  }),
};
