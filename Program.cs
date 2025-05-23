﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

class Program
{
  static void Main()
  {
    int port = 5000;

    var server = new Server(port);

    Console.WriteLine("The server is running");
    Console.WriteLine($"Main Page: http://localhost:{port}/website/pages/index.html");
 
    var database = new Database();
    database.Users.Add(new User("1","adi","123"));
      database.Cities.Add(new City("Tel Aviv", "https://did.li/f47CN"));
      database.Restaurants.Add(new Restaurant("sushimi - Dizengoff", "https://did.li/BGcmC", 1));
      database.Restaurants.Add(new Restaurant("sushimi - Rothschild", "https://did.li/BGcmC", 1));
      database.Restaurants.Add(new Restaurant("sushimi - Allenby", "https://did.li/BGcmC", 1));
      database.Restaurants.Add(new Restaurant("sushimi - Ibn Gabiro", "https://did.li/BGcmC", 1));

      database.Cities.Add(new City("Jerusalem", "https://did.li/wezgT"));
      database.Restaurants.Add(new Restaurant("sushimi - Jaffa", "https://did.li/BGcmC", 2));
      database.Restaurants.Add(new Restaurant("sushimi - King George", "https://did.li/BGcmC", 2));
      database.Restaurants.Add(new Restaurant("sushimi - Agripas", "https://did.li/BGcmC", 2));
      database.Restaurants.Add(new Restaurant("sushimi - Emek Refaim", "https://did.li/BGcmC", 2));


      database.Cities.Add(new City("Haifa", "https://did.li/Np2TY"));
      database.Restaurants.Add(new Restaurant("sushimi - Herzl", "https://did.li/BGcmC", 3));
      database.Restaurants.Add(new Restaurant("sushimi - Ben Gurion", "https://did.li/BGcmC", 3));
      database.Restaurants.Add(new Restaurant("sushimi - Horev", "https://did.li/BGcmC", 3));
      database.Restaurants.Add(new Restaurant("sushimi - HaNassi", "https://did.li/BGcmC", 3));

   database.SaveChanges();
    while (true)
    {
      (var request, var response) = server.WaitForRequest();

      Console.WriteLine($"Recieved a request with the path: {request.Path}");

      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      else
      {
        try
        {
          if (request.Path == "verifyUserId")
          {
            var userId = request.GetBody<string>();

            var varified = database.Users.Any(user => user.Id == userId);

            response.Send(varified);
          }
          else if (request.Path == "logIn")
          {
            var (username, password) = request.GetBody<(string, string)>();

            var user = database.Users.First(
              user => user.Username == username && user.Password == password
            );

            var userId = user.Id;

            response.Send(userId);
          }
          else if (request.Path == "getUsername")
          {
            var userId = request.GetBody<string>();

            var username = database.Users.Find(userId)?.Username;

            response.Send(username);
          }
          else if (request.Path == "getCities")
          {
            var cities = database.Cities.ToArray();

            response.Send(cities);
          }
          else if (request.Path == "getCity")
          {
            var cityId = request.GetBody<int>();

            var city = database.Cities.Find(cityId);

            response.Send(city);
          }
          else if (request.Path == "getRestaurants")
          {
            var cityId = request.GetBody<int>();

            var restaurants = database.Restaurants.Where(restaurant => restaurant.CityId == cityId).ToArray();

            response.Send(restaurants);
          }
          else if (request.Path == "getRestaurant")
          {
            var restaurantId = request.GetBody<int>();

            var restaurant = database.Restaurants.Find(restaurantId);

            response.Send(restaurant);
          }
          else if (request.Path == "addReservation")
          {

            var (time, name, phone, restaurantId) = request.GetBody<(int, string, int, int)>();
            var exists = database
              .Reservations
              .Any(res => res.RestaurantId == restaurantId && res.Time == time);
            if (!exists)
            {
              database.Reservations.Add(new Reservation(time, name, phone, restaurantId));
            }
            var reservationId = database
              .Reservations
              .Where(res => res.RestaurantId == restaurantId && res.Time == time)
              .Select(reservation => reservation.Id)
              .FirstOrDefault();
            response.Send(reservationId);
          }
          else if (request.Path == "getReservation")
        {
            var reservationId = request.GetBody<int>();

            var reservation = database.Reservations.Find(reservationId);

            response.Send(reservation);
          }
        }
          else if (request.Path == "getHours"){
            var restaurantId = request.GetBody<int>();
            var hours = database.Reservations
            .Where(res => res.RestaurantId == restaurantId) 
            .Select(reservation => reservation.Time).ToArray();
            response.Send(hours);
          }
          else
          {
            response.SetStatusCode(405);
          }

          database.SaveChanges();
        }
        catch (Exception exception)
        {
          Log.WriteException(exception);
        }
      }

      response.Close();
    }
  }
}


class Database() : DbBase("database")
{
  /*──────────────────────────────╮
  │ Add your database tables here │
  ╰──────────────────────────────*/
    public DbSet<User> Users { get; set; } = default!;

  public DbSet<City> Cities { get; set; } = default!;
  public DbSet<Restaurant> Restaurants { get; set; } = default!;
  public DbSet<Reservation> Reservations { get; set; } = default!;

}

class User(string id, string username, string password)  // מחלקה שמתארת את המשתמש
{
  [Key] public string Id { get; set; } = id;  // מזהה ייחודי עבור המשתמש (למשל: "user123") - מזהה זה משמש לזיהוי המשתמש במערכת
  public string Username { get; set; } = username;  // שם המשתמש (למשל: "john_doe") - שם המשתמש ייחודי במערכת
  public string Password { get; set; } = password;  // סיסמא של המשתמש (למשל: "password123") - הסיסמא משמשת לאימות זהות המשתמש
}
class City(string name, string image)
{
  [Key] public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public string Image { get; set; } = image;
}
class Restaurant(string name, string image, int cityId)
{
  [Key] public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public string Image { get; set; } = image;
  public int CityId { get; set; } = cityId;
  [ForeignKey("CityId")] public City City { get; set; } = default!;
}
class Reservation(int time, string name, int phone, int restaurantId )
{
  [Key] public int Id { get; set; } = default!;
  public int Time { get; set; } = time;
  public string Name { get; set; } = name;
  public int Phone { get; set; } = phone;
  public int RestaurantId { get; set; } = restaurantId;
  [ForeignKey("RestaurantId")] public Restaurant Restaurant { get; set; } = default!;
}
