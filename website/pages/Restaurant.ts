import { send } from "../utilities";
import { Restaurant, Reservation} from "./types";

let query = new URLSearchParams(location.search);
let restaurantId = parseInt(query.get("restaurantId")!);
console.log("Restaurant Id:", restaurantId);

let restaurantsDiv = document.querySelector("#RestaurantsDiv") as HTMLDivElement;
let ReservationDiv = document.querySelector("#ReservationDiv") as HTMLDivElement;

let restaurantData = await send("getRestaurant", restaurantId) as Restaurant;
let restaurantName = document.createElement("h1");
restaurantName.innerText = restaurantData.Name;
restaurantsDiv.appendChild(restaurantName);

let timeDiv = document.createElement("div");
timeDiv.innerText = "Reserve a table for: ";
ReservationDiv.appendChild(timeDiv);

let timeInput = document.createElement("input");
ReservationDiv.appendChild(timeInput);

let nameDiv = document.createElement("div");
timeDiv.innerText = "Reserve for: ";
ReservationDiv.appendChild(nameDiv);

let nameInput = document.createElement("input");
ReservationDiv.appendChild(nameInput);

let phoneDiv = document.createElement("div");
phoneDiv.innerText = "phone number: ";
ReservationDiv.appendChild(phoneDiv);

let phoneInput = document.createElement("input");
ReservationDiv.appendChild(phoneInput);

let confirmButton = document.createElement("button");
confirmButton.innerText = "Confirm";
ReservationDiv.appendChild(confirmButton);

confirmButton.onclick = async function () {
let time = parseInt(timeInput.value);
let name = nameInput.value;
let phone = parseInt(phoneInput.value); 

let NewReservation = await send("addReservation", [time, name, phone, restaurantId]) as Reservation;

if (NewReservation) {
    phoneInput.value = "";
    timeInput.value = "";
    nameInput.value = "";
    alert("Reservation confirmed!");
} else {
    alert("This time slot is already booked. Please choose another time.");
}
}