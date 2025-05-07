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
    Id: number,
    Date: string,
    Restaurant: Restaurant,
  }