using System.ComponentModel.DataAnnotations;
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

        // דוגמת נתונים
        database.Users.Add(new User("1", "adi", "123", true));

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

        foreach (var restaurant in database.Restaurants.ToList())
        {
            for (int hour = 7; hour <= 21; hour++)
            {
                for (int i = 0; i < 28; i++)
                {
                    var place = new Place(true, hour, restaurant.Id);
                    database.Places.Add(place);
                }
            }
        }
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

                        var verified = database.Users.Any(user => user.Id == userId);

                        response.Send(verified);
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
                    else if (request.Path == "getUser")
                    {
                        var userId = request.GetBody<string>();

                        var user = database.Users.Find(userId);
                            
                        response.Send(user);
                        

                    }
                    else if (request.Path == "changeUserStatus")
                    {
                        var (userId, conect) = request.GetBody<(string, bool)>();

                        var user = database.Users.Find(userId);

                        if (user != null)
                        {
                            user.Conect = conect;
                            database.SaveChanges();
                            response.Send(true);
                        }
                        else
                        {
                            response.Send(false);
                        }
                    }
                    else if (request.Path == "getUsers")
                    {
                        var users = database.Users.ToArray();

                        response.Send(users);
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
                    else if (request.Path == "AddRestaurant")
                    {
                        var (cityId, name, image) = request.GetBody<( int, string, string)>();


                            database.Restaurants.Add(new Restaurant(name, image, cityId));
                        database.SaveChanges();
                        var restaurant = database.Restaurants
                            .Where(res => res.CityId == cityId && res.Name == name && res.Image == image)
                            .Select(res => res.Id);
                                       for (int hour = 7; hour <= 21; hour++)
                                        {
                                        for (int i = 0; i < 30; i++)
                                        {
                                        var place = new Place(true, hour, restaurant.FirstOrDefault());
                                        database.Places.Add(place);
                                        }
                                        }
                            response.Send(true);

                    }
                    else if (request.Path == "addReservation")
                    {
                        var (time, name, phone, places, restaurantId) = request.GetBody<(int, string, string, int, int)>();
                        var exists = database
                            .Reservations
                            .Any(res => res.RestaurantId == restaurantId && res.Time == time && res.Name == name && res.Phone == phone && res.Places == places);

                        if (!exists)
                        {
                            database.Reservations.Add(new Reservation(time, name, phone, places, restaurantId));
                        }

                        var reservationId = database
                            .Reservations
                            .Where(res => res.RestaurantId == restaurantId && res.Time == time && res.Name == name && res.Phone == phone && res.Places == places)
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
                    else if (request.Path == "deleteReservation"){
                        var reservationId = request.GetBody<int>();
                        Console.WriteLine("Trying to delete reservation with ID: " + reservationId);
                        var reservationToDelete = database.Reservations.FirstOrDefault(res => res.Id == reservationId);


                        if (reservationToDelete != null)
                        {

                                    // שלב 1: מחיקה מהטבלה
        database.Reservations.Remove(reservationToDelete);
        database.SaveChanges();

        // שלב 2: שחרור המקומות לפי השעה, מזהה מסעדה וכמות
        var placesToFree = database.Places
            .Where(p => p.Time == reservationToDelete.Time && 
                        p.RestaurantId == reservationToDelete.RestaurantId &&
                        !p.Available) // רק תפוסים
            .Take(reservationToDelete.Places)
            .ToList();

        foreach (var place in placesToFree)
        {
            place.Available = true;
            database.SaveChanges();
        }



                            response.Send(true);
                        }
                        else
                        {
                            response.Send(false);
                        }
                    }
                    else if (request.Path == "getHours")
                    {
                        var restaurantId = request.GetBody<int>();
                        var hours = database.Reservations
                            .Where(res => res.RestaurantId == restaurantId)
                            .Select(reservation => reservation.Time).ToArray();
                        response.Send(hours);
                    }
                    else if (request.Path == "getPlaces")
                    {
                        var (restaurantId, time) = request.GetBody<(int, int)>();

                        var places = database.Places
                            .Where(p => p.RestaurantId == restaurantId && p.Time == time)
                            .ToArray();

                        response.Send(places);
                    }
                    else if (request.Path == "updatePlace")
                    {
                        var placeId = request.GetBody<int>();

                        var placeToUpdate = database.Places.FirstOrDefault(p => p.Id == placeId);

                        if (placeToUpdate != null)
                        {
                            placeToUpdate.Available = false;
                            database.SaveChanges();
                        }

                        var takenPlace = database.Places
                            .Where(p => p.Id == placeId)

                            .ToArray();

                        response.Send(takenPlace);
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

class Database : DbBase
{
    public Database() : base("database") { }

    public DbSet<User> Users { get; set; } = default!;
    public DbSet<City> Cities { get; set; } = default!;
    public DbSet<Restaurant> Restaurants { get; set; } = default!;
    public DbSet<Reservation> Reservations { get; set; } = default!;
    public DbSet<Place> Places { get; set; } = default!;
}

class User(string id, string username, string password, bool conect)  // מחלקה שמתארת את המשתמש
{
  [Key] public string Id { get; set; } = id;  // מזהה ייחודי עבור המשתמש (למשל: "user123") - מזהה זה משמש לזיהוי המשתמש במערכת
  public string Username { get; set; } = username;  // שם המשתמש (למשל: "john_doe") - שם המשתמש ייחודי במערכת
  public string Password { get; set; } = password;
  public bool Conect {get; set; } = conect; // סיסמא של המשתמש (למשל: "password123") - הסיסמא משמשת לאימות זהות המשתמש
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
class Reservation(int time, string name, string phone,int places, int restaurantId )
{
  [Key] public int Id { get; set; } = default!;
  public int Time { get; set; } = time;
  public string Name { get; set; } = name;
  public string Phone { get; set; } = phone;
  public int Places { get; set; } = places;
  public int RestaurantId { get; set; } = restaurantId;
  [ForeignKey("RestaurantId")] public Restaurant Restaurant { get; set; } = default!;
}
class Place(bool available, int time,int restaurantId)
{
  [Key] public int Id { get; set; } = default!;
  public bool Available { get; set; } = available;
  public int Time {get; set; } = time;
  public int RestaurantId { get; set; } = restaurantId;
  [ForeignKey("RestaurantId")] public Restaurant Restaurant { get; set; } = default!;
}