import { parseArgs } from "jsr:@std/cli/parse-args";

const Task_Status = {
    UN_PRIORITIZED : 0,
    IN_PROGRESS : 1,
    COMPLETED : 2
};

const args = parseArgs(Deno.args, {
    boolean: ["a","u","r","l","d"],
    string: ["duedate", "status", "name"],
    alias: {
        dev: "d",
        add: "a",
        update: "u",
        removeTask: "r",
        list: "l",
        help: "h"
    }
});

// If the arguments are empty, show help.
if (Deno.args && Deno.args.length == 0) {
    helpPrompt();
}

const { add, update, list, removeTask, help } = args;
const multipleActions = [add, update, removeTask, list, help]
    .filter(a => a);

if (multipleActions.length > 1) {
    console.log(`You provided more than one action
        Please only provide 1 action of (-a| -u| -r | -l | -h)`);
    Deno.exit();
}


// Check if the file has been created. If not create one.
const tasks = await loadTasks();

// Next step, peform an action.
if (args.add) {
    console.log("Adding a task!");
    const { name, duedate, status } = args;
    // name cannot be empty, but dueDate, status can be empty or error.
    if (!name) {
        console.error(`❌ cannot add a task with an empty name.
            usage: task-cli -a "my task name"
            use task-cli --help for details`);
        Deno.exit();
    }
    const task = { id: 0 };
    task.name = name;
    // todo: parse due date
    console.log(duedate);
    // parse status
    const taskStatus = parseInt(status);
    if (isNaN(taskStatus)) {
        console.log(`[TaskCLI:debug] ${status}, was not a number while adding.`);
        task.status = 0;
    }
    else if (taskStatus < 0 || taskStatus > 2) {
        console.log(`[TaskCLI:debug] ${status}, was out of range.`);
        task.status = 0
    } else {
        task.status = taskStatus;
    }
    console.log("status", status);
    tasks.tasks.push(task);
    console.log(tasks.tasks);
    // then we gotta write to this.
} else if (args.update) {
    console.log("Update");
} else if (args.removeTask) {
    console.log("Removing!");
} else if (args.list) {
    console.log("List!");
} else if (args.help) {
    console.log("Help!");
}

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

async function loadTasks() {
  const fileExists = await checkForFile();
  if (!fileExists) {
    const create = confirm("Hey, we couldn't find your task file, can we create one?");
    if (!create) {
        console.log("A task file is required to use task-cli. Exiting.");
        Deno.exit();
    } else {
        // this could definitely fail
        await Deno.writeTextFile("./tasks_current_user.json", "");
        const taskFile = await Deno.readTextFile("./tasks_current_user.json", {
          read: true, 
          write: true
        });
        const tasks = JSON.parse(taskFile);
        //console.log("[TaskCLI:debug]Successfully created a task file.");
        return tasks;
    }
  } else {
      // load the file 
      const taskFile = await Deno.readTextFile("./tasks_current_user.json", { 
          read: true, 
          write: true
      });
      const tasks = JSON.parse(taskFile);
      //console.log("[TaskCLI:debug]Successfully found a tasks file.");
      return tasks;
  }
}

// should probably move all of the file stuff to some service.
function saveTask() {
    // saves to the tasks.
}


function addTask() {

}

function helpPrompt() {
    console.log(`No arguments supplied to TaskCLI
    usage: task-cli 
        -a Add a new task.
        -u Update an existing task.
        -d Delete an existing task.
        -l List all tasks.
        -h Show help.`);
    Deno.exit();
}
