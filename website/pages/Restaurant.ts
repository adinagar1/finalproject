import { send } from "../utilities";
import { Restaurant, Reservation, Place } from "./types";

// שליפת מזהה המסעדה מה-URL
let query = new URLSearchParams(location.search);
let restaurantId = parseInt(query.get("restaurantId")!);
console.log("Restaurant Id:", restaurantId);

// שליפת אלמנטים מה-DOM
let restaurantsDiv = document.querySelector("#RestaurantsDiv") as HTMLDivElement;
let ReservationDiv = document.querySelector("#ReservationDiv") as HTMLDivElement;

// יצירת תתי אזורים לטופס הזמנה וצפייה
let reservationGroup = document.createElement("div");
let viewGroup = document.createElement("div");
viewGroup.style.display = "none";
ReservationDiv.appendChild(reservationGroup);
ReservationDiv.appendChild(viewGroup);

// עיצוב בסיסי
restaurantsDiv.classList.add("card");
ReservationDiv.classList.add("card");

// שליפת נתוני מסעדה ושעות
let restaurantData = await send("getRestaurant", restaurantId) as Restaurant;
let hours = await send("getHours", restaurantId) as number[];

// הצגת שם המסעדה
let restaurantName = document.createElement("h1");
restaurantName.innerText = restaurantData.Name;
restaurantsDiv.appendChild(restaurantName);

// שדה לבחירת שעת הזמנה
let timeDiv = document.createElement("div");
timeDiv.innerText = "Reserve a table for: ";
reservationGroup.appendChild(timeDiv);
reservationGroup.appendChild(document.createElement("br"));

let timeSelect = document.createElement("select");
reservationGroup.appendChild(timeSelect);

let defaultOption = document.createElement("option");
defaultOption.text = "00:00";
defaultOption.disabled = true;
defaultOption.selected = true;
timeSelect.appendChild(defaultOption);

// בניית רשימת שעות (07:00–21:00)
for (let i = 7; i < 22; i++) {
    let option = document.createElement("option");
    option.value = i.toString();
    option.innerText = i.toString().padStart(2, '0') + ":00";
    if (hours.includes(i)) {
        option.disabled = true;
    }
    timeSelect.appendChild(option);
}

reservationGroup.appendChild(document.createElement("br"));
reservationGroup.appendChild(document.createElement("br"));

// שדה שם
let nameDiv = document.createElement("div");
nameDiv.innerText = "Reserve for: ";
reservationGroup.appendChild(nameDiv);
reservationGroup.appendChild(document.createElement("br"));

let nameInput = document.createElement("input");
reservationGroup.appendChild(nameInput);
reservationGroup.appendChild(document.createElement("br"));
reservationGroup.appendChild(document.createElement("br"));

// שדה טלפון
let phoneDiv = document.createElement("div");
phoneDiv.innerText = "Phone number: ";
reservationGroup.appendChild(phoneDiv);
reservationGroup.appendChild(document.createElement("br"));

let phoneInput = document.createElement("input");
reservationGroup.appendChild(phoneInput);
reservationGroup.appendChild(document.createElement("br"));
reservationGroup.appendChild(document.createElement("br"));

// כותרת למקומות
let placeDiv = document.createElement("div");
placeDiv.innerText = "Choose the number of your place: ";
reservationGroup.appendChild(placeDiv);
reservationGroup.appendChild(document.createElement("br"));

// מיכל למקומות
let placeContainer = document.createElement("div");
placeContainer.id = "placeContainer";
reservationGroup.appendChild(placeContainer);

// שינוי שעה => הצגת מקומות
timeSelect.onchange = async function () {
    placeContainer.innerHTML = "";

    let placesArray = await send("getPlaces", [restaurantId, parseInt(timeSelect.value)]) as Place[];


    for (let i = 0; i < placesArray.length; i++) {
        let placeButton = document.createElement("button");
        console.log(placesArray[i]);
        placeButton.innerText = (i + 1).toString();
        placeButton.value = placesArray[i].Id.toString();
        placeButton.classList.add("place_button"); // ← סודר! זה מה שמחפש מאוחר יותר

        if (placesArray[i].Available === true) {
            placeButton.classList.add("available");
            placeButton.onclick = function () {
                placeButton.classList.toggle("selected");
            };
        } else {
            placeButton.classList.add("unavailable");
            placeButton.disabled = true;
        }

        placeContainer.appendChild(placeButton);
    }
};

reservationGroup.appendChild(document.createElement("br"));

// כפתור אישור
let confirmButton = document.createElement("button");
confirmButton.innerText = "Confirm";
reservationGroup.appendChild(confirmButton);

// כפתור לצפייה בהזמנה קיימת
let myReserveButton = document.createElement("button");
myReserveButton.innerText = "My Reservation";
reservationGroup.appendChild(myReserveButton);

// לחיצה על "Confirm"
confirmButton.onclick = async function () {
    if (timeSelect.value != "" && phoneInput.value.length == 10 && phoneInput.value.startsWith("05") && phoneInput.value.match(/^[0-9]+$/)) {
        let time = parseInt(timeSelect.value);
        let name = nameInput.value;
        let phone = parseInt(phoneInput.value);
        let selectedButtons = document.querySelectorAll(".place_button.selected");
        let selectedPlaceCount = selectedButtons.length;
        let selectedPlaceIds = Array.from(selectedButtons).map(
            (btn) => parseInt((btn as HTMLButtonElement).value)
        );

        let newReservation = await send("addReservation", [
            time, name, phone, selectedPlaceCount, restaurantId
        ]) as number;

        if (newReservation) {
            // איפוס שדות
            phoneInput.value = "";
            nameInput.value = "";

            // עדכון המקומות בסרבר עבור כל המקום שנבחר
            for (let placeId of selectedPlaceIds) {
                await send("updatePlace", placeId);
            }

            // טען מחדש את המקומות פעם אחת אחרי העדכון
            let updatedPlaces = await send("getPlaces", [restaurantId, time]) as Place[];

            // נקה את מיכל המקומות
            placeContainer.innerHTML = "";

            // הצג מחדש את המקומות על פי המצב המעודכן
            for (let i = 0; i < updatedPlaces.length; i++) {
                let place = updatedPlaces[i];
                let placeButton = document.createElement("button");
                placeButton.innerText = (i + 1).toString();
                placeButton.value = place.Id.toString();
                placeButton.classList.add("place_button");
                if (!place.Available) {
                    placeButton.classList.add("unavailable");
                    placeButton.disabled = true;
                }
                else ;{
                    placeButton.classList.add("available");
                    placeButton.onclick = function () {
                        placeButton.classList.toggle("selected");
                    };
                } 

                placeContainer.appendChild(placeButton);
            }

            // בדיקה אם כל המקומות תפוסים (כל המקומות לא זמינים)
            let allTaken = updatedPlaces.every(p => !p.Available);
            if (allTaken) {
                let option = document.querySelector(`option[value="${time}"]`) as HTMLOptionElement;
                if (option) {
                    option.disabled = true;
                }
            }

            alert("ההזמנה אושרה! מספר ההזמנה שלך הוא: " + newReservation);
        }
    } else {
        alert("מספר הטלפון שלך לא תקין. אנא נסה שנית.");
        phoneInput.value = "";
    }
};


// כפתור צפייה בהזמנה
myReserveButton.onclick = async function () {
    reservationGroup.style.display = "none";
    viewGroup.style.display = "block";
    viewGroup.innerHTML = "";

    let restaurantName2 = document.createElement("h1");
    restaurantName2.innerText = restaurantData.Name;
    viewGroup.appendChild(restaurantName2);

    let idDiv2 = document.createElement("div");
    idDiv2.innerText = "Your reservation number is: ";
    viewGroup.appendChild(idDiv2);
    viewGroup.appendChild(document.createElement("br"));

    let idInput2 = document.createElement("input");
    viewGroup.appendChild(idInput2);
    viewGroup.appendChild(document.createElement("br"));
    viewGroup.appendChild(document.createElement("br"));

    let findMyReservationButton = document.createElement("button");
    findMyReservationButton.innerText = "Find My Reservation";
    viewGroup.appendChild(findMyReservationButton);

    let backButton = document.createElement("button");
    backButton.innerText = "Back to Reservation";
    viewGroup.appendChild(backButton);

    findMyReservationButton.onclick = async function () {
        // נקה תצוגה ישנה
        const oldInfo = document.querySelector("#reservationInfo");
        if (oldInfo) oldInfo.remove();
    
        let id = parseInt(idInput2.value);
        if (isNaN(id)) {
            alert("Please enter a valid reservation number.");
            return;
        }
    
        let myReservation = await send("getReservation", id) as Reservation;
    
        if (myReservation) {
            let reservationInfoDiv2 = document.createElement("div");
            reservationInfoDiv2.id = "reservationInfo";
            reservationInfoDiv2.innerText =
                `Your reservation is at ${myReservation.Time}:00 for ${myReservation.Name} with phone number: ${myReservation.Phone}. Your number of seats: ${myReservation.Place}`;
            viewGroup.appendChild(reservationInfoDiv2);
    
            let deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            viewGroup.appendChild(deleteButton);
    
            deleteButton.onclick = async function () {
                let deleteReservation = await send("deleteReservation", id) as Reservation | null;
                if (deleteReservation) {
                    alert("Your reservation has been deleted successfully.");
                    idInput2.value = "";
                    reservationInfoDiv2.remove();
                    deleteButton.remove();
                } else {
                    alert("Failed to delete your reservation. Please try again.");
                }
            }; 
        } else {
            alert("No reservation found with this information.");
            idInput2.value = "";
        }
    };

    backButton.onclick = function () {
        viewGroup.style.display = "none";
        reservationGroup.style.display = "block";
    };
};
