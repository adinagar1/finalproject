using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;

static class Tools
{
  public static JsonSerializerOptions JsonSerializerOptions = new() { IncludeFields = true };

  public static bool IsTuple(Type type)
  {
    var fields = type.GetFields();

    if (fields.Length == 0)
    {
      return false;
    }

    for (var i = 0; i < fields.Length; i++)
    {
      if (fields[i].Name != $"Item{i + 1}")
      {
        return false;
      }
    }

    return true;
  }
}

public static class Log
{
  public static void WriteException(Exception exception)
  {
    var shortened = ShortenException(exception);

    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine(shortened);
    Console.ResetColor();
  }

  public static string ShortenException(Exception exception)
  {
    string message = exception.Message;

    string stackTrace = exception.StackTrace ?? "";
    string[] lines = stackTrace.Split("\n");
    string[] filteredLines = lines.Where(line => line.Contains(Environment.CurrentDirectory)).ToArray();

    string? innerExceptionMessage = exception.InnerException?.Message;

    string full;
    if (innerExceptionMessage != null)
    {
      full = message + "\n" + innerExceptionMessage + "\n" + string.Join("\n", filteredLines);
    }
    else
    {
      full = message + "\n" + string.Join("\n", filteredLines);
    }

    return full;
  }
}

public class File(string path)
{
  public string Path { get; } = path;

  public static bool Exists(string path)
  {
    return System.IO.File.Exists(path);
  }
}

public class Server
{
  readonly HttpListener _listener;

  public Server(int port)
  {
    _listener = new HttpListener();
    _listener.Prefixes.Add($"http://*:{port}/");
    _listener.Start();
  }

  public (Request, Response) WaitForRequest()
  {
    var context = _listener.GetContext();
    var request = new Request(context);
    var response = new Response(context);
    return (request, response);
  }
}

public class Request
{
  readonly HttpListenerContext _context;

  public string Path { get; }

  public Request(HttpListenerContext context)
  {
    _context = context;

    Path = _context.Request.Url!.AbsolutePath[1..];

    if ((_context.Request.AcceptTypes?.Contains("text/html") ?? false) &&
      !Path.EndsWith(".html"))
    {
      Path += ".html";
    }
    if ((_context.Request.UrlReferrer?.AbsolutePath.EndsWith(".js") ?? false) &&
      !Path.EndsWith(".js"))
    {
      Path += ".js";
    }
  }

  public T GetBody<T>()
  {
    var streamReader = new StreamReader(_context.Request.InputStream, _context.Request.ContentEncoding);
    var jsonStr = streamReader.ReadToEnd();

    if (Tools.IsTuple(typeof(T)))
    {
      jsonStr = TupliseArrayJsonStr(jsonStr);
    }

    return JsonSerializer.Deserialize<T>(jsonStr, Tools.JsonSerializerOptions)!;
  }

  public bool ExpectsHtml()
  {
    return _context.Request.AcceptTypes?.Contains("text/html") ?? false;
  }

  static string TupliseArrayJsonStr(string arrayJsonStr)
  {
    var arrayJsonObj = JsonNode.Parse(arrayJsonStr)!.AsArray();
    var tuplisedObj = new JsonObject();

    int count = 1;
    foreach (var item in arrayJsonObj)
    {
      tuplisedObj[$"Item{count}"] = item!.DeepClone();
      count++;
    }

    var tuplisedStr = tuplisedObj.ToJsonString();

    return tuplisedStr;
  }
}

public class Response
{
  readonly HttpListenerContext _context;

  public Response(HttpListenerContext context)
  {
    _context = context;
  }

  public void Send<T>(T value)
  {
    if (value is File file)
    {
      var fileExtension = file.Path.Split(".").Last();

      var fileBytes = fileExtension switch
      {
        "html" => ((Func<Byte[]>)(() =>
        {
          var fileText = System.IO.File.ReadAllText(file.Path)!;
          var fileTextParts = fileText.Split("></iframe>");
          var fileTextNew = string.Join(
            " frameborder=\"0\" onload=\"let body=this.contentWindow.document.body;"
            + "body.style.margin=0;this.width='100%';this.height='100%';"
            + "this.width=body.scrollWidth;this.height=body.scrollHeight;\"></iframe>",
            fileTextParts
          );
          return Encoding.UTF8.GetBytes(fileTextNew);
        }))(),
        _ => System.IO.File.ReadAllBytes(file.Path)!,
      };

      _context.Response.ContentType = fileExtension switch
      {
        "html" => "text/html; charset=utf-8",
        "js" => "application/javascript",
        _ => "",
      };

      _context.Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      _context.Response.Headers.Add("Pragma", "no-cache");
      _context.Response.Headers.Add("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");

      _context.Response.OutputStream.Write(fileBytes);
    }
    else
    {
      if (_context.Request.Headers.Get("X-Is-Custom") != "true")
      {
        _context.Response.StatusCode = 404;
      }

      string jsonStr = JsonSerializer.Serialize(value, Tools.JsonSerializerOptions);

      if (Tools.IsTuple(typeof(T)))
      {
        jsonStr = ArrayifyTupleJsonStr(jsonStr);
      }

      jsonStr = $"{{\"data\": {jsonStr}}}";
      var bytes = Encoding.UTF8.GetBytes(jsonStr);
      _context.Response.OutputStream.Write(bytes);
    }
  }

  public void Redirect(string path)
  {
    _context.Response.Redirect(path);
  }

  public void SetStatusCode(int statusCode)
  {
    _context.Response.StatusCode = statusCode;
  }

  public void Close()
  {
    _context.Response.Close();
  }

  static string ArrayifyTupleJsonStr(string tupleJsonStr)
  {
    var jsonObj = JsonNode.Parse(tupleJsonStr)!.AsObject();

    var arrJsonObj = new JsonArray();

    foreach (var field in jsonObj)
    {
      arrJsonObj.Add(field.Value!.DeepClone());
    }

    var arrJsonStr = arrJsonObj.ToJsonString();

    return arrJsonStr;
  }
}

public class DbBase : DbContext
{
  readonly string _name;
  readonly bool _isNewlyCreated;

  public DbBase(string name) : base()
  {
    _name = name;

    _isNewlyCreated = Database.EnsureCreated();
    Database.ExecuteSqlRaw("PRAGMA journal_mode = DELETE;");
  }

  public bool IsNewlyCreated()
  {
    return _isNewlyCreated;
  }

  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    optionsBuilder.UseSqlite($"Data Source={_name}.sqlite");
  }
}