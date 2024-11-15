
export interface IResponseAddress {
  lat: number;
  lng: number;
  description?: string;
  address?: string;
  notes?: string;
}

export interface ITripResponseDetails {
  trip_status?: string;
  pickup?: IResponseAddress;
  pickup_eta: number;
  dropoff: IResponseAddress;
  dropoff_eta: number;
  vehicle_info: IVehicleInfo;//**changed for pickup component vehicle and driver details
  driver_info: IDriverInfo;//**changed for pickup component vehicle and driver details
}

export interface ITripResponse {
  trip_id?: string;
  trip_status?: string;
  pickup?: IResponseAddress;
  pickup_eta: number;
  dropoff: IResponseAddress;
  dropoff_eta: number;
  uuid: string;
}

export interface IExistingTripResponseData {
  trip_id: string;
  trip_details: ITripDetails;
  uuid: string;
}

export interface ITripDetails extends ITripResponse {
  earliest_pickup_eta: number;
  latest_pickup_eta: number;
  earliest_dropoff_eta: number;
  latest_dropoff_eta: number;
  pickup_distance: number;
  dropoff_distance: number;
  pickup_walking_time_sec: number;
  dropoff_walking_time_sec: number;
  cost: number;
  last_status_change_timestamp: number;
  vehicle_info: IVehicleInfo;
  driver_info: IDriverInfo;
  prescheduled_ride_id: number;
  sub_service: string;
  rider_id: string;
  passenger_count: number;
}

export interface IVehicleInfo {
  license_plate: string;
  color: string;
  model: string;
  make: string;
  current_location: IResponseAddress;
  id: number;
}

export interface IErrorResponse {
  status: number;
  message?: string;
  info?: string;
  uuid?: string;
}

export interface IDriverInfo {
  first_name: string
  last_name: string
}
