export interface ITripRequestData {
  depart_at: number;
  destination: IRequestAddress;
  origin: IOriginAddress;
  passenger_count: number;
  passenger_info: IPassengerInfo;
  additional_passengers: IAdditionalPassengers;
  sub_service: string;
}

export interface IAdditionalPassengers {
  Guest?: number;
  PCA?: number;
  'PCA (WAV)'?: number; 
}

export interface IRequestAddress {
  lat: string;
  lng: string;
  address: string;
  notes?: string;
}

export interface IOriginAddress {
  lat: string;
  lng: string;
  address: string;
}

export interface IPassengerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface ICheckTripInfo {
  rider_details: IRiderDetails;
}

export interface IRiderDetails {
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  sub_service: string;
}
