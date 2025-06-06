import { send } from "../utilities";
import { City, Restaurant, Reservation, User } from "./types";

let citiesDiv = document.querySelector("#CitiesDiv") as HTMLDivElement;
let Divbutton = document.querySelector("#Divbutton") as HTMLDivElement;
let cities = await send("getCities", []) as City[];


console.log(cities);

for (let i = 0; i < cities.length; i++) {
    let a = document.createElement("a");
    a.href = "city.html?cityId=" + cities[i].Id;
    citiesDiv.appendChild(a);

    let img = document.createElement("img");
    img.src = cities[i].Image;
    a.appendChild(img);

    let div = document.createElement("div");
    div.innerText = cities[i].Name;
    a.appendChild(div);
}


let button = document.createElement("button");
button.innerText = "Add Restaurant";
button.id = "addRestaurantButton";
button.onclick = async function () {
if (document.getElementById("popup")) return;

let overlay = document.createElement("div");
overlay.id = "popup";

let modal = document.createElement("div");
modal.classList.add("popup-modal");

let title = document.createElement("h2");
title.innerText = "Add Restaurant";
modal.appendChild(title);

let div = document.createElement("div");
div.innerText = "City ID";
modal.appendChild(div);

let input = document.createElement("input");
modal.appendChild(input);

let div2 = document.createElement("div");
div2.innerText = "Restaurant Name";
modal.appendChild(div2);

let input2 = document.createElement("input");
modal.appendChild(input2);

let div3 = document.createElement("div");
div3.innerText = "Restaurant Image URL";
modal.appendChild(div3);

let input3 = document.createElement("input");
modal.appendChild(input3);

let submit = document.createElement("button");
submit.innerText = "Submit";
submit.id = "sumbit";
submit.onclick = async function () {
    let city = await send("AddRestaurant", [parseInt(input.value), input2.value, input3.value]) as boolean; 
    if (city) {
  alert("Added restaurant: " + input2.value);
  document.body.removeChild(overlay);
}
  else {
    alert("Failed to add restaurant. Please check the inputs.");
  }}
modal.appendChild(submit);

let close = document.createElement("button");
close.innerText = "Close";
close.id = "close";
close.onclick = function () {
  document.body.removeChild(overlay);
};
modal.appendChild(close);

overlay.appendChild(modal);
document.body.appendChild(overlay);
};
// 🛠️ הוספת הכפתור לתוך LoggedInDiv
Divbutton.appendChild(button);
let conect = await send("getUser", "1") as User;
if (conect.Conect) {
    button.classList.add("hidden");
}
else {
    button.classList.remove("hidden");
}
