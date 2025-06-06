export type User = {
    Id: string;
    Username: string;
    Password: string;
    Conect: boolean;
  };
export type City = {
    Id: number,
    Name: string,
    Image: string,
  };
  
  export type Restaurant = {
    Id: number,
    Name: string,
    Image: string,
    City: City,
  }
  
  export type Reservation = {
    Id: number;
    Time: number;
    Name: string; 
    Phone: number;
    Place: number;
    RestaurantId: number;
  }
  export type Place = {
    Id: number;
    Available: boolean;
    Time: number;
    RestaurantId: number;
  }