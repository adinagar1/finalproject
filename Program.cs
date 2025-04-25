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
    database.Users.Add(new User("1","adi","123"));
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
          if (request.Path == "logIn")
          {
            var (username, password) = request.GetBody<(string, string)>();

            var user = database.Users.First(
              user => user.Username == username && user.Password == password
            );

            var userId = user.Id;

            response.Send(userId);
          }
          else if(request.Path == "logout"){
            var (username, password) = request.GetBody<(string, string)>();

            var user = database.Users.First(
              user => user.Username == username && user.Password == password
            );

            var userId = user.Id;

            response.Send(userId);
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
    public DbSet<Dish> Dishes { get; set; } = default!;
    public DbSet<Ingredient> Ingredients { get; set; } = default!;
    public DbSet<Drink> Drinks { get; set; } = default!;
}

class User(string id, string username, string password)  // מחלקה שמתארת את המשתמש
{
  [Key] public string Id { get; set; } = id;  // מזהה ייחודי עבור המשתמש (למשל: "user123") - מזהה זה משמש לזיהוי המשתמש במערכת
  public string Username { get; set; } = username;  // שם המשתמש (למשל: "john_doe") - שם המשתמש ייחודי במערכת
  public string Password { get; set; } = password;  // סיסמא של המשתמש (למשל: "password123") - הסיסמא משמשת לאימות זהות המשתמש
}

class Dish(string name, string imageSource, string description, float price) {  // מחלקה שמתארת מנה במסעדה
  [Key] public int Id { get; set; } = default!;  // מזהה ייחודי לכל מנה במסעדה, המשמש לאיתור המנה במאגר הנתונים
  public string Name { get; set; } = name;  // שם המנה (למשל: "פיצה מרגריטה")
  public string ImageSource { get; set; } = imageSource;  // מקור התמונה של המנה (URL או נתיב לתמונה)
  public string Description { get; set; } = description;  // תיאור המנה (למשל: "פיצה עם גבינת מוצרלה ועגבניות")
  public float Price { get; set; } = price;  // מחיר המנה (למשל: 45.50 ש"ח)
}


class Ingredient(int dishId, string name, float amount) {  // מחלקה שמתארת את החומרים במנה
  [Key] public int Id { get; set; } = default!;  // מזהה ייחודי לכל חומר, המשמש לאיתור החומר במאגר הנתונים
  public string Name { get; set; } = name;  // שם החומר (למשל: "קמח", "שמן זית")
  public float Amount { get; set; } = amount;  // כמות החומר במנה (למשל: 200 גרם קמח או 50 מ"ל שמן)

  public int DishId { get; set; } = dishId;  // מזהה המנה שאליה שייך החומר, נקשר עם המנה הרלוונטית (למשל: המנה "פיצה מרגריטה")
  [ForeignKey("DishId")] public Dish? Dish { get; set; } = default!;  // קשר למנה שאליה שייך החומר, משמש למנוע טעויות בהפניות
}

class Drink(string name, string imageSource, string description, float price) {  // מחלקה שמתארת משקה בתפריט
  [Key] public int Id { get; set; } = default!;  // מזהה ייחודי לכל משקה בתפריט
  public string Name { get; set; } = name;  // שם המשקה (למשל: "מיץ תפוזים", "קפה")
  public string ImageSource { get; set; } = imageSource;  // מקור התמונה של המשקה (URL או נתיב לתמונה)
  public string Description { get; set; } = description;  // תיאור המשקה (למשל: "מיץ טבעי סחוט")
  public float Price { get; set; } = price;  // מחיר המשקה (למשל: 15.50 ש"ח)
}

