import { parseArgs } from "jsr:@std/cli/parse-args";

/*
 * Checks if the main file for the application 
 * exists in the near directory.
 * Returns true if it is found, false if not.
 * */
async function checkForFile() {
  try {
    _ = await Deno.lstat("./tasks_current_user.json");
    return true;
  } catch (err) {
    console.warn("[TaskCLI:warn] User File does not exist!");
    return false;
  }
}

// If this fails, we can return just false.
// If it is good, we can return true and the file
async function loadTasks() {
  const fileExists = await checkForFile();
  let status = { fileLoaded: false, data: null };
  if (!fileExists) {
    const create = confirm("Hey, we couldn't find your task file, can we create one?");
    if (!create) {
      console.log("Closing up shop, see you next time!");
    } else {
      // create the file
      // lets use our own format, create some randomId + tasks extension
      // then lets encode strings into bytes to write and read.
      // the file will literally just be text that is written like so.
      //  myTask1|status|dateCreated,
      //  myTask2|status|dateCreated,
      // myUser.tfob (tfob = taskfileobject)
      await Deno.writeTextFile("./tasks_current_user.json", "");
      const tasks = await Deno.open("./tasks_current_user.json");
      status.fileLoaded = false;
      status.data = tasks;
      console.log("Successfully created a task file.");
      return status;
    }
  } else {
    // load the file 
    const tasks = await Deno.open("./tasks_current_user.json");
    status.fileLoaded = true;
    status.data = tasks;
  }
  return status;
}

const options = `
**************************************
Options
**************************************
1) Add a task for today.
2) Update a task. (In Progress | Delete)
3) Delete a task.
4) Show all my tasks.
5) Show all my finished tasks.
6) Show all my unfinished tasks.
7) Show all my in progress tasks.
8) Exit.
`;
const mainMenuPrompt = `
 _____         _       ____ _     ___ 
|_   _|_ _ ___| | __  / ___| |   |_ _|
  | |/ _  / __| |/ / | |   | |    | | 
  | | (_| \\__ \\   <  | |___| |___ | | 
  |_|\\__,_|___/_|\\_\\  \\____|_____|___|
${options}`;

const dataLoad = await loadTasks();
let cliActive = dataLoad.fileLoaded;
const data = dataLoad.data;

while (cliActive) {
  const selected = prompt(mainMenuPrompt);
  if (selected == "8") {
    cliActive = false;
    console.log("Goodbye!");
  }
}
