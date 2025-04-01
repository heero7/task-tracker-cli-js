import { parseArgs } from "jsr:@std/cli/parse-args";

/*
 * Checks if the main file for the application 
 * exists in the near directory.
 * Returns true if it is found, false if not.
 * */
async function checkForFile() {
  try {
    await Deno.lstat("./tasks_current_user.json");
    return true;
  } catch (err) {
    console.warn("[TaskCLI:warn] User File does not exist!");
    console.error("[TaskCLI:err]", err);
    return false;
  }
}

let tasks = new Map();
function addTask() {
    const taskName = prompt("Please enter a name for this task!");
    // Limit to only allow creating tasks in the current year.
    // Only show options for the next day.
    // So format looks like MM DD
    // Today for example 3, 31 is not valid. The next value
    // should be 4 01
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    currentDate.setDate(currentDate.getDate() + 1);
    const month = currentDate.getMonth() + 1; // month is 0 based
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    const dueDatePrompt = 
        `When is this task due? Earliest allowed due date task is: ${month}-${day}
        \nEnter a month:`;
    const taskDueDateMonth = prompt(dueDatePrompt);
    const taskDueDateDay = prompt("Enter a day (1-31)");

    // Validate the day
    // It cannot be less than currentDate and has to be valid
    console.log('Parsing date...');
    const m = parseInt(taskDueDateMonth);
    const d = parseInt(taskDueDateDay);
    console.log('End Parsing date...');

    if (m == NaN) {
        console.error("[TaskCLI:error] the number entered was not a number: ", taskDueDateMonth);
        return;
    }

    if (d == NaN) {
        console.error("[TaskCLI:error] the number entered was not a number: ", taskDueDateDay);
        return;
    }

    try {
        // this is now the date parsed date. This can't be less then current date.
        console.log('Validating date...');
        const dueDate = new Date(`${m}/${d}/${year}`);
        const dateString = dueDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "numeric"
        });

        if (dateString < currentDate) {
            console.error("[TaskCLI:error] This date is in the past and won't work!");
            return;
        }

        console.log("[TaskCLI] Able to create a good due date!");
        const task = {
            name: taskName,
            dueDate: dateString,
            status: 0
        };

        if (tasks.get(task.dueDate)) {
            tasks.get(task.dueDate).push(task);
        } else {
            // create a new key value
            console.log('did not exist, now adding!');
            tasks.set(task.dueDate, [task]);
        }
    } catch (err) {
        console.error("[TaskCLI:error] problem trying to set due date for task: ", err);
    }
}

function showTasks() {
    console.log('*********** Tasks ***********');
    console.log('Tasks?', tasks.size);
    tasks.forEach((value, key) => {
        console.log(`Tasks for ${key}`);
        console.log('Number of tasks ', value.length);
        value.map(v => console.log('\t\t' + v.name));
    });
    console.log('*********** End Tasks ***********');
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
    console.log("Successfully found a tasks file.");
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

// todo: only show the main prompt if asked to. because then we can't see anything
// also having a constant prompt is not what the goal is. just call functions
// like tci add "sample thing". the due date should not be added.
    // so instead we can just have a list of items. 
    // tci add "make pasta"
    // { name: "make pasta", dueDate: null, status: 0 }
    // tci update "make pasta" --d 03,13 (month day)
    // tci update 1 --done|ip|todo
    // tci delete 1 --all
    // tci list --done|ip|todo
//
while (cliActive) {
  const selected = prompt(mainMenuPrompt);
  if (selected == "8") {
    cliActive = false;
    console.log("Goodbye!");
  } else if (selected == "1") {
      addTask();
  } else if (selected == "4") {
      showTasks();
  }
}
