import { send } from "../utilities";
import { getUserId } from "./funcs";

let loggedOutDiv = document.getElementById("loggedOutDiv") as HTMLDivElement;
let logInButton = document.getElementById("logInButton") as HTMLButtonElement;
let signUpButton = document.getElementById("signUpButton") as HTMLButtonElement;
let loggedInDiv = document.getElementById("loggedInDiv") as HTMLDivElement;
let greetingDiv = document.getElementById("greetingDiv") as HTMLDivElement;
let logOutButton = document.getElementById("logOutButton") as HTMLButtonElement;

logInButton.onclick = function () {
  top!.location.href = "logIn.html";
};

signUpButton.onclick = function () {
  top!.location.href = "signUp.html";
};

logOutButton.onclick = function logOut() {
  localStorage.removeItem("userId");
  top!.location.href = "index.html";
};

let userId = await getUserId();

if (userId != null) {
  let username = await send("getUsername", userId) as string;
  greetingDiv.innerText = "Welcome, " + username + "!";
  loggedInDiv.classList.remove("hidden");
} else {
  localStorage.removeItem("userId");
  loggedOutDiv.classList.remove("hidden");
}