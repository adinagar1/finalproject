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
defaultOption.text = "None";
defaultOption.disabled = true;
defaultOption.selected = true;
timeSelect.appendChild(defaultOption);

let num = 0;
let allPlaces = await send("getPlaces", [restaurantId, 0]) as Place[];
// בניית רשימת שעות (07:00–21:00)
for (let i = 7; i < 22; i++) {
    let option = document.createElement("option");
    option.value = i.toString();
    option.innerText = i.toString().padStart(2, '0') + ":00";
for (let place of allPlaces) {
  if (place.Available == true){
    num++;
  }}
if (num == 28){
  option.disabled = true; // אם כבר יש 28 הזמנות, השעה תהיה לא זמינה}
  }
else{
  option.disabled = false; // אחרת, השעה תהיה זמינה
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


    let allButtons: HTMLButtonElement[] = [];
    let total = 28; // עכשיו יהיה מקסימום 28
    const topButtons = 7;
    const rightButtons = 7;
    const bottomButtons = 7;
    const leftButtons = 7;
    
    const containerSize = 400;
    const buttonSize = 40;
    const offset = 20;
    
    const stepXTop = (containerSize - 2 * offset - buttonSize) / (topButtons - 1);
    const stepYRight = (containerSize - 2 * offset - buttonSize) / (rightButtons - 1);
    const stepXBottom = (containerSize - 2 * offset - buttonSize) / (bottomButtons - 1);
    const stepYLeft = (containerSize - 2 * offset - buttonSize) / (leftButtons - 1);
    

    for (let i = 0; i < placesArray.length && i < 28; i++) {  // <-- כאן מגבילים ל-28 כפתורים
      let placeButton = document.createElement("button");
      placeButton.innerText = (i + 1).toString();
      placeButton.value = placesArray[i].Id.toString();
      placeButton.classList.add("place_button");
    
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
      allButtons.push(placeButton);

      const btn = allButtons[i];
      btn.style.position = "absolute";
      btn.style.width = `${buttonSize}px`;
      btn.style.height = `${buttonSize}px`;
    
      if (i < topButtons) {
        // למעלה
        let x = (offset + i * stepXTop)+50;
        let y = (offset)+40;
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
      } else if (i < topButtons + rightButtons) {
        // ימין
        let y = (offset + (i - topButtons) * stepYRight)+40;
        let x = (containerSize - offset - buttonSize)+100;
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
      } else if (i < topButtons + rightButtons + bottomButtons) {
        // למטה
        const index = i - (topButtons + rightButtons);
        let x = (offset + (bottomButtons - 1 - index) * stepXBottom)+50;
        let y =(containerSize - offset - buttonSize)+40;
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
      } else {
        // שמאל
        const index = i - (topButtons + rightButtons + bottomButtons);
        let y = (offset + (leftButtons - 1 - index) * stepYLeft)+40;
        const x = offset;
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
      }
    }
}
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
  let selectedButtons2 = document.querySelectorAll(".place_button.selected");
    if (timeSelect.value != "" && phoneInput.value.length == 10 && phoneInput.value.startsWith("05") && phoneInput.value.match(/^[0-9]+$/) && selectedButtons2.length > 0) {
        let time = parseInt(timeSelect.value);
        let name = nameInput.value;
        let phone =phoneInput.value;
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

            let allButtons: HTMLButtonElement[] = [];
            let total = 28; // עכשיו יהיה מקסימום 28
            const topButtons = 7;
            const rightButtons = 7;
            const bottomButtons = 7;
            const leftButtons = 7;
            
            const containerSize = 400;
            const buttonSize = 40;
            const offset = 20;
            
            const stepXTop = (containerSize - 2 * offset - buttonSize) / (topButtons - 1);
            const stepYRight = (containerSize - 2 * offset - buttonSize) / (rightButtons - 1);
            const stepXBottom = (containerSize - 2 * offset - buttonSize) / (bottomButtons - 1);
            const stepYLeft = (containerSize - 2 * offset - buttonSize) / (leftButtons - 1);
            
            // הצג מחדש את המקומות על פי המצב המעודכן
            for (let i = 0; i < updatedPlaces.length && i < 28; i++) {  // <-- כאן מגבילים ל-28 כפתורים
                let placeButton = document.createElement("button");
                placeButton.innerText = (i + 1).toString();
                placeButton.value = updatedPlaces[i].Id.toString();
                placeButton.classList.add("place_button");
              
                if (updatedPlaces[i].Available === true) {
                  placeButton.classList.add("available");
                  placeButton.onclick = function () {
                    placeButton.classList.toggle("selected");
                  };
                } else {
                  placeButton.classList.add("unavailable");
                  placeButton.disabled = true;
                }
              
                placeContainer.appendChild(placeButton);
                allButtons.push(placeButton);
          
                const btn = allButtons[i];
                btn.style.position = "absolute";
                btn.style.width = `${buttonSize}px`;
                btn.style.height = `${buttonSize}px`;
              
                if (i < topButtons) {
                  // למעלה
                  let x = (offset + i * stepXTop)+50;
                  let y = (offset)+40;
                  btn.style.left = `${x}px`;
                  btn.style.top = `${y}px`;
                } else if (i < topButtons + rightButtons) {
                  // ימין
                  let y = (offset + (i - topButtons) * stepYRight)+40;
                  let x = (containerSize - offset - buttonSize)+100;
                  btn.style.left = `${x}px`;
                  btn.style.top = `${y}px`;
                } else if (i < topButtons + rightButtons + bottomButtons) {
                  // למטה
                  const index = i - (topButtons + rightButtons);
                  let x = (offset + (bottomButtons - 1 - index) * stepXBottom)+50;
                  let y =(containerSize - offset - buttonSize)+40;
                  btn.style.left = `${x}px`;
                  btn.style.top = `${y}px`;
                } else {
                  // שמאל
                  const index = i - (topButtons + rightButtons + bottomButtons);
                  let y = (offset + (leftButtons - 1 - index) * stepYLeft)+40;
                  const x = offset;
                  btn.style.left = `${x}px`;
                  btn.style.top = `${y}px`;
                }}
            // בדיקה אם כל המקומות תפוסים (כל המקומות לא זמינים)
            let allTaken = updatedPlaces.every(p => !p.Available) as boolean;
            if (allTaken) {
                let option = document.querySelector(`option[value="${time}"]`) as HTMLOptionElement;
                if (option) {
                    option.disabled = true;
                }
            }
            else{
                let option = document.querySelector(`option[value="${time}"]`) as HTMLOptionElement;
                if (option) {
                    option.disabled = false;
                }
            }

            alert("Your reservation has been successfully done. Your number reservation: " + newReservation);
        }
    } else {
        alert("Please fill in all fields correctly:");
        phoneInput.value = "";
        nameInput.value = "";
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

    let phoneDiv2 = document.createElement("div");
    phoneDiv2.innerText = "Enter your phone number: ";
    viewGroup.appendChild(phoneDiv2);

    viewGroup.appendChild(document.createElement("br"))
    ;
    let phoneInput2 = document.createElement("input");
    viewGroup.appendChild(phoneInput2);

    viewGroup.appendChild(document.createElement("br"));
    viewGroup.appendChild(document.createElement("br"));

    let findMyReservationButton = document.createElement("button");
    findMyReservationButton.innerText = "Find My Reservation";
    viewGroup.appendChild(findMyReservationButton);

    let backButton = document.createElement("button");
    backButton.innerText = "Back to Reservation";
    viewGroup.appendChild(backButton);

                let deleteButton = document.createElement("button");
            deleteButton.innerText = "Cancel My Reservation";
            viewGroup.appendChild(deleteButton);
            deleteButton.style.display = "none"; // התחל עם כפתור מחיקה מוסתר

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
    
        if (myReservation && phoneInput2.value === myReservation.Phone.toString()) {
          deleteButton.style.display = "inline"; // הצג כפתור מחיקה אם נמצאה הזמנה
            let reservationInfoDiv2 = document.createElement("div");
            let NumberOfPlaces = myReservation.Places;
            reservationInfoDiv2.id = "Reservation Info:";
            reservationInfoDiv2.innerText =
                `Your reservation is at ${myReservation.Time}:00 for ${myReservation.Name} with phone number: ${myReservation.Phone}. and the number of places reserved is: ${myReservation.Places}.`;
            viewGroup.appendChild(reservationInfoDiv2);
    

    
            deleteButton.onclick = async function () {
                let deleteReservation = await send("deleteReservation", id) as Reservation | null;
                if (deleteReservation) {
                    alert("Your reservation has been deleted successfully.");
                    idInput2.value = "";
                    phoneInput2.value = "";
                    reservationInfoDiv2.remove();
                    deleteButton.remove();
                } else {
                    alert("Failed to delete your reservation. Please try again.");
                }
            }; 
        } else {
            alert("No reservation found with this information.");
            idInput2.value = "";
            phoneInput2.value = "";
        }
    };

    backButton.onclick = function () {
        viewGroup.style.display = "none";
        reservationGroup.style.display = "block";
    };
};
