const addBtn = document.querySelector(".add-btn");
const deleteBtn = document.querySelector(".remove-btn");
let deleteflag = false;
const model = document.querySelector(".model-cont");
const textArea = document.querySelector(".textarea-cont");
const priorityColorArray = model.querySelectorAll(".priority-color");
let currentColor = "green";
const prioritySetModel = document.querySelector(".priority-color-cont");
const main_cont = document.querySelector(".main_cont");
const uid = new ShortUniqueId();
const colorsarray = ["blue", "pink", "purple", "green"];
let allTickets = [];
const toolboxPriorityCont = document.querySelector(".toolbox-priority-cont");

const pendingContainer = document.querySelector(".pending-cont");
const finshedCOntaner = document.querySelector(".finished-cont");

// to persist old tickets.
window.addEventListener("load", () => {
  const getAllTickets = JSON.parse(localStorage.getItem("localtask"));
  if (getAllTickets) {
    // if (array not empty)
    for (let i = 0; i < getAllTickets.length; i++) {
      let ticketobj = getAllTickets[i];
      createTicket(
        ticketobj.content,
        ticketobj.color,
        ticketobj.id,
        ticketobj.isPending
      );
    }
  }
});

// filtering out tickets based on chosen color on toolbox.
toolboxPriorityCont.addEventListener("click", (e) => {
  if (e.target == e.currentTarget) {
    return;
  }
  const currentColorElem = e.target;
  const cColor = currentColorElem.classList[1];
  const ticketArr = document.querySelectorAll(".ticket-cont"); // collecting all the tickets
  for (let i = 0; i < ticketArr.length; i++) {
    const ticketcolorElem = ticketArr[i].querySelector(".ticket-color");
    let cTicketColor = ticketcolorElem.classList[1];
    if (cTicketColor !== cColor) {
      ticketArr[i].style.display = "none";
    } else {
      ticketArr[i].style.display = "block";
    }
  }
});

// dislplay all the tickets again.
toolboxPriorityCont.addEventListener("dblclick", (e) => {
  if (e.target == e.currentTarget) {
    return;
  }
  const ticketArr = document.querySelectorAll(".ticket-cont");
  for (let i = 0; i < ticketArr.length; i++) {
    ticketArr[i].style.display = "block";
  }
});

// adding a new ticket
addBtn.addEventListener("click", () => {
  model.style.display = "flex";
});

// ddelete event
deleteBtn.addEventListener("click", () => {
  if (!deleteflag) {
    deleteBtn.style.color = "red";
  } else {
    deleteBtn.style.color = "black";
  }
  deleteflag = !deleteflag;
});

// content of the note event + fn
model.addEventListener("keypress", (e) => {
  if (e.key != "Enter") {
    return;
  }
  const content = textArea.value;
  createTicket(content, currentColor);

  // to make it into its default appearance.
  textArea.value = "";
  currentColor = "green";
  model.style.display = "none";

  for (let i = 0; i < priorityColorArray.length; i++) {
    priorityColorArray[i].classList.remove("active");
  }
  prioritySetModel.children[2].classList.add("active"); // making green default with white borders.
});

// choose the color of the note
prioritySetModel.addEventListener("click", (e) => {
  if (e.target == e.currentTarget) {
    // clicking other than color
    return;
  }
  currentColor = e.target.classList[1]; // here, classlist contains the class of each color, returns the second class ie.1
  for (let i = 0; i < priorityColorArray.length; i++) {
    priorityColorArray[i].classList.remove("active");
  } // remove the existing border on a color
  e.target.classList.add("active"); // adds to the target.
});

// create a ticket
function createTicket(content, currentColor, cid, isPending) {
  const uniqueid = cid || uid.rnd(); // generating random id
  const ticketContainer = document.createElement("div");
  ticketContainer.setAttribute("class", "ticket-cont");
  ticketContainer.setAttribute("draggable", "true");
  ticketContainer.innerHTML = `<div class="ticket-color ${currentColor}"></div>
        <div class="ticket-id">${uniqueid}</div>
        <div class="ticket-area">${content}</div>
        <div class="lock-unlock">
          <i class="fa-solid fa-lock"></i>
        </div> `;

  // checking to see which container to append it into
  if (isPending == true) {
    pendingContainer.appendChild(ticketContainer);
  } else {
    finshedCOntaner.appendChild(ticketContainer);
  }

  // changing status color
  const ticketColor = ticketContainer.querySelector(".ticket-color"); // top bar on the notes.
  addColorChangeListener(ticketColor, uniqueid);

  // handling locking / unlocking and channging text
  const ticketArea = ticketContainer.querySelector(".ticket-area");
  const lockBtn = ticketContainer.querySelector(".lock-unlock");
  addLockUnlock(ticketArea, lockBtn, uniqueid); // id used to persist data.

  //delete task
  deleteTask(ticketContainer, uniqueid);

  // ticket object
  const ticketobj = {
    id: uniqueid,
    color: currentColor,
    content: content,
    isPending: true,
  };
  allTickets.push(ticketobj);

  // avoiding infinite loop, if cid exists already, dont updatestorage.
  if (!cid) {
    updateLocalStorage();
  }
}

// change color of the small div
function addColorChangeListener(ticketColorElem, id) {
  ticketColorElem.addEventListener("click", (e) => {
    const cColor = e.target.classList[1]; // geting the currentColor
    const idx = colorsarray.indexOf(cColor); // checking the index of cColor in the colors array
    const nextidx = (idx + 1) % colorsarray.length; // to keep it in a loop.
    e.target.classList.remove(cColor);
    e.target.classList.add(colorsarray[nextidx]);

    // when color changed, update the ticketobj
    const ticketobj = allTickets.find((ticketobject) => {
      return ticketobject.id == id;
    });
    ticketobj.color = colorsarray[nextidx]; // updating the color
    updateLocalStorage();
  });
}

// change the type of lock icon
function addLockUnlock(ticketArea, lockBtn, id) {
  lockBtn.addEventListener("click", () => {
    let isLocked = lockBtn.children[0].classList.contains("fa-lock"); // returns true or false.
    if (isLocked) {
      ticketArea.setAttribute("contenteditable", "true"); // if already locked, converting it to unlocked.
      lockBtn.children[0].classList.remove("fa-lock");
      lockBtn.children[0].classList.add("fa-unlock");
    } else {
      ticketArea.setAttribute("contenteditable", "false");
      lockBtn.children[0].classList.remove("fa-unlock");
      lockBtn.children[0].classList.add("fa-lock");
    }
    const ticketobj = allTickets.find((ticketobject) => {
      return ticketobject.id == id;
    });
    ticketobj.content = ticketArea.content;
    updateLocalStorage();
  });
}

// delete task ticket
function deleteTask(ticketContainer, id) {
  ticketContainer.addEventListener("click", (e) => {
    if (deleteflag) {
      ticketContainer.remove();
    }
    const restOfTickets = allTickets.filter((ticketobject) => {
      return ticketobject.id != id; // every not deleted ticket onto the new array.
    });
    allTickets = restOfTickets;
    updateLocalStorage();
  });
}

// updating local storage, needds to be called everywhere the array is getting updated.
function updateLocalStorage() {
  localStorage.setItem("localtask", JSON.stringify(allTickets));
}

// Dragging
const container = document.querySelectorAll(".container"); // returns a node list

let draggedELem = null;
container.forEach((container) => {
  //dragstart
  container.addEventListener("dragstart", (e) => {
    console.log("container", container);
    console.log("drag is started on  ");
    draggedELem = e.target;
  });

  //dragover
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    // console.log("dragging is going on  ");
  });

  // dragend
  container.addEventListener("dragend", (e) => {
    console.log("dragging is finished  ");
  });

  // drop
  container.addEventListener("drop", (e) => {
    console.log("item is dropped");
    if (draggedELem) {
      container.appendChild(draggedELem);
      const isPending =
        container.classList[0] === "pending-cont" ? true : false;
      const cId = draggedELem.querySelector(".ticket-id").innerText;
      const ticketobj = allTickets.find((ticket) => {
        return ticket.id === cId;
      });
      ticketobj.isPending = isPending; // updating the pending status in the array.
      updateLocalStorage(); // updating the storage.
    }
  });
});
