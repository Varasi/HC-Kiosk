import { IPassenger } from './passengers.model';

export interface ITripInfo {
    accountOption: IAccountOption;
    personalInformation: IPersonalInfo;
    destination: IDestination;
    passengers: IPassenger[];
}

export interface IAccountOption {
    existing: boolean;
}

export interface IDestination {
    lat: number;
    lng: number;
    address_text: string;
    address: string;
    notes?: string;
}

export interface IPersonalInfo {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
}

export interface IPersonalInfoWithTime extends IPersonalInfo {
    estimatedTime: string;
}