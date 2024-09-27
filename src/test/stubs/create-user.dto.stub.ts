import { CreateUserDto } from 'src/user/dto/create-user.dto';

export const createUserDtoStub = (): CreateUserDto => ({
  email: 'user1@subtaskify.test',
  password: 'test123',
  firstName: 'UserOne',
  lastName: 'TestOne',
  avatarUrl:
    'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/835.jpg',
});
