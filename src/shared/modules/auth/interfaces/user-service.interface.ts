export interface IUserService {
  updateEmail(userId: string, newEmail: string): Promise<void>;
}
