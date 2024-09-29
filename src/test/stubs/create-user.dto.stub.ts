import { CreateUserDto } from 'src/user/dto/create-user.dto';

export const createUserDtoStub = (
  overrides?: Partial<CreateUserDto>,
): CreateUserDto => ({
  email: 'test@test.com',
  password: 'test123',
  firstName: 'UserOne',
  lastName: 'TestOne',
  avatarUrl:
    'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/835.jpg',
  ...overrides,
});
