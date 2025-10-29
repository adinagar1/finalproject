import { send } from "../utilities";
import { getUserId } from "./funcs";
import { User } from "./types";

let query = new URLSearchParams(location.search);
let Id = parseInt(query.get("userId")!);

let LoggedOutDiv = document.getElementById("LoggedOutDiv") as HTMLDivElement;
let LogInButton = document.getElementById("LogInButton") as HTMLButtonElement;
let LoggedInDiv = document.getElementById("LoggedInDiv") as HTMLDivElement;
let greetinDiv = document.getElementById("greetinDiv") as HTMLDivElement;
let LogOutButton = document.getElementById("LogOutButton") as HTMLButtonElement;


LogInButton.onclick = function () {
  top!.location.href = "Login.html";
};

LogOutButton.onclick = async function logOut() {
  let conected = await send("changeUserStatus",["1", true] ) as boolean;
  localStorage.removeItem("userId");
  top!.location.href = "index.html";
};

let userId = await getUserId();

if (userId != null) {
  let user = await send("getUser", userId) as User;
  greetinDiv.innerText = "Welcome, " + user.Username + "!";
  LoggedInDiv.classList.remove("hidden");}

 else {
  localStorage.removeItem("userId");
  LoggedOutDiv.classList.remove("hidden");
}
