import { send } from "../utilities";
import { Restaurant, Reservation} from "./types";

let query = new URLSearchParams(location.search);
let restaurantId = parseInt(query.get("restaurantId")!);
console.log("Restaurant Id:", restaurantId);

let restaurantsDiv = document.querySelector("#RestaurantsDiv") as HTMLDivElement;
let ReservationDiv = document.querySelector("#ReservationDiv") as HTMLDivElement;
let reservationGroup = document.createElement("div");
let viewGroup = document.createElement("div");
viewGroup.style.display = "none"; 
ReservationDiv.appendChild(reservationGroup);
ReservationDiv.appendChild(viewGroup);
restaurantsDiv.classList.add("card");
ReservationDiv.classList.add("card");

let restaurantData = await send("getRestaurant", restaurantId) as Restaurant;

let hours = await send ("getHours", restaurantId) as number[];

let restaurantName = document.createElement("h1");
restaurantName.innerText = restaurantData.Name;
restaurantsDiv.appendChild(restaurantName);

let timeDiv = document.createElement("div");
timeDiv.innerText = "Reserve a table for: ";
reservationGroup.appendChild(timeDiv);

let b1 = document.createElement("br");
reservationGroup.appendChild(b1);

let timeSelect = document.createElement("select");
reservationGroup.appendChild(timeSelect);

let defaultOption = document.createElement("option");
defaultOption.text = "00:00";
defaultOption.disabled = true;
defaultOption.selected = true;
timeSelect.appendChild(defaultOption);

for (let i = 7; i < 22; i++) {
    let option = document.createElement("option");
    option.value = i.toString();
    option.innerText = i.toString().padStart(2, '0') + ":00";
        if (hours.includes(i)) {
            option.disabled = true;
        }
        timeSelect.appendChild(option);
    }




let b2 = document.createElement("br");
reservationGroup.appendChild(b2);
let b3 = document.createElement("br");
reservationGroup.appendChild(b3);

let nameDiv = document.createElement("div");
nameDiv.innerText = "Reserve for: ";
reservationGroup.appendChild(nameDiv);

let b4 = document.createElement("br");
reservationGroup.appendChild(b4);

let nameInput = document.createElement("input");
reservationGroup.appendChild(nameInput);

let b5 = document.createElement("br");
reservationGroup.appendChild(b5);
let b6 = document.createElement("br");
reservationGroup.appendChild(b6);

let phoneDiv = document.createElement("div");
phoneDiv.innerText = "phone number: ";
reservationGroup.appendChild(phoneDiv);

let b7 = document.createElement("br");
reservationGroup.appendChild(b7);

let phoneInput = document.createElement("input");
reservationGroup.appendChild(phoneInput);

let b8 = document.createElement("br");
reservationGroup.appendChild(b8);
let b9 = document.createElement("br");
reservationGroup.appendChild(b9);

let confirmButton = document.createElement("button");
confirmButton.innerText = "Confirm";
reservationGroup.appendChild(confirmButton);

let myReserveButton = document.createElement("button");
myReserveButton.innerText = "My Reservation";
reservationGroup.appendChild(myReserveButton);

confirmButton.onclick = async function () {
if (timeSelect.value !== "" &&  phoneInput.value.length === 10 && phoneInput.value.startsWith("05") && phoneInput.value.match(/^[0-9]+$/)) {
let time = parseInt(timeSelect.value);
let name = nameInput.value;
let phone = parseInt(phoneInput.value); 

let NewReservation = await send("addReservation", [time, name, phone, restaurantId]) as number;

if (NewReservation) {
    phoneInput.value = "";
    timeSelect.value = "00:00";
    nameInput.value = "";
    for (let i = 0; i < timeSelect.options.length; i++) {
        if (timeSelect.options[i].value === time.toString()) {
          timeSelect.options[i].disabled = true;
          break;  
        }
      }

 
    alert("Reservation confirmed! Your reservation number is:"+ NewReservation);}}
 else {
    alert("your phone number is wrong. Please try agian.");
    phoneInput.value = "";
}
}
myReserveButton.onclick = async function () {
    reservationGroup.style.display = "none";
    viewGroup.style.display = "block";
    viewGroup.innerHTML = "";

    let restaurantName2 = document.createElement("h1");
    restaurantName2.innerText = restaurantData.Name;
    viewGroup.appendChild(restaurantName2);
    
    let idDiv2 = document.createElement("div");
    idDiv2.innerText = "Your reservatoin number is: ";
    viewGroup.appendChild(idDiv2);
    
    let b10 = document.createElement("br");
    viewGroup.appendChild(b10);
    
    let idInput2 = document.createElement("input");
    viewGroup.appendChild(idInput2);
    
    let b80 = document.createElement("br");
    viewGroup.appendChild(b80);
    let b90 = document.createElement("br");
    viewGroup.appendChild(b90);

    let findMyReservationButton = document.createElement("button");
    findMyReservationButton.innerText = "Find My Reservation";
    viewGroup.appendChild(findMyReservationButton);

    let backButton = document.createElement("button");
    backButton.innerText = "Back to Reservation";
    viewGroup.appendChild(backButton);

    findMyReservationButton.onclick = async function () {
       let id = parseInt(idInput2.value);

        let myReservation = await send("getReservation", id) as Reservation;

        if (myReservation) {
            let reservationInfoDiv2 = document.createElement("div");
            reservationInfoDiv2.innerText = `Your reservation is at ${myReservation.Time} for ${myReservation.Name} with phone number: ${myReservation.Phone}`;
            viewGroup.appendChild(reservationInfoDiv2);
        } else {
            alert("No reservation found with this information.");
            idInput2.value = "";
        }
    }
    

    backButton.onclick = function () {
        viewGroup.style.display = "none";
        reservationGroup.style.display = "block";
    }
}
