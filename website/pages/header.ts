import { send } from "../utilities";
import { getUserId } from "./funcs";

let LoggedOutDiv = document.getElementById("LoggedOutDiv") as HTMLDivElement;
let LogInButton = document.getElementById("LogInButton") as HTMLButtonElement;
let LoggedInDiv = document.getElementById("LoggedInDiv") as HTMLDivElement;
let greetinDiv = document.getElementById("greetinDiv") as HTMLDivElement;
let LogOutButton = document.getElementById("LogOutButton") as HTMLButtonElement;
let buttoncreate = document.createElement("button");
buttoncreate.innerText = "Add Restaurant";
buttoncreate.appendChild(LogInButton);

buttoncreate.onclick = function () {}




LogInButton.onclick = function () {
  top!.location.href = "logIn.html";
}

LogOutButton.onclick = function logOut() {
  localStorage.removeItem("userId");
  top!.location.href = "index.html";
};

let userId = await getUserId();

if (userId != null) {
    let username = await send("getUsername", userId) as string;
    greetinDiv.innerText = "Welcome, " + username + "!";
    LoggedInDiv.classList.remove("hidden");
  }
   else{
    localStorage.removeItem("userId");
    LoggedOutDiv.classList.remove("hidden");
  }
