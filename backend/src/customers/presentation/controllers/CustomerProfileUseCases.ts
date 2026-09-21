import { ManageCustomerProfiles } from '../../application/usecases/ManageCustomerProfiles';
export const CUSTOMER_PROFILE_USE_CASES = Symbol('CUSTOMER_PROFILE_USE_CASES');
export type CustomerProfileUseCases = ManageCustomerProfiles;
