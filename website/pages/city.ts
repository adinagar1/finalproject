import { send } from "../utilities";
import { Restaurant, City } from "./types";

// קריאת ה-cityId מה-URL
let query = new URLSearchParams(location.search);
let cityId = parseInt(query.get("cityId")!);
console.log("City ID:", cityId);
// מציאת הדיב בו נציג את המידע על העיר
let cityDiv = document.querySelector("#CityDiv") as HTMLDivElement;
let restaurantsDiv = document.querySelector("#RestaurantsDiv") as HTMLDivElement;

// שליחה לשרת על מנת לקבל את פרטי העיר
let cityData = await send("getCity", cityId) as City;
let cityName = document.createElement("h1");
cityName.innerText = cityData.Name;
cityDiv.appendChild(cityName);

// שליחה לשרת על מנת לקבל את המסעדות בעיר
let restaurants = await send("getRestaurants", cityId) as Restaurant[];

// הצגת המסעדות בדף
for (let i = 0; i < restaurants.length; i++) {
    let restaurant = restaurants[i];

    let a = document.createElement("a");
    a.href = "restaurant.html?restaurantId=" + restaurant.Id;  // קישור לעמוד המסעדה
    a.classList.add("restaurant-card");  // הוספת המחלקה!
    restaurantsDiv.appendChild(a);

    let img = document.createElement("img");
    img.src = restaurant.Image;
    img.classList.add("restaurant-img");  // אפשר להוסיף מחלקה אם תרצה
    a.appendChild(img);

    let div = document.createElement("div");
    div.innerText = restaurant.Name;
    a.appendChild(div);
}
