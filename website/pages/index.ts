import { send } from "../utilities";
import { City } from "./types";

let citiesDiv = document.querySelector("#CitiesDiv") as HTMLDivElement;

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
