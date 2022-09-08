let booklists = [];

const RENDER_EVENT = "render-booklist";

const STORAGE_KEY = "BOOKLIST_APPS";

// filtering
const search = document.querySelector("#search");
search.addEventListener("input", () => {
  // semuanya di ubah ke lowercase agar tidak case sensitive
  const valueSearch = search.value.toLowerCase();

  // mengambil semua container
  const containers = document.querySelectorAll(".item");

  for (const container of containers) {
    // mengambil semua judul buku dalam tiap container
    const titles = container.querySelectorAll("h2");

    for (const title of titles) {
      // semuanya di ubah ke lowercase agar tidak case sensitive
      const valueTitle = title.innerText.toLowerCase();

      // includes mengecek apakah text di valueSearch terdapat pada valueTitle
      if (valueTitle.includes(valueSearch)) {
        container.style.display = null;
      } else {
        container.style.display = "none";
      }
    }
  }
});

const submit = document.querySelector("#form");
submit.addEventListener("submit", (e) => {
  addBooklist();

  // agar auto scroll ke list buku
  document.querySelector("#start-booklist").scrollIntoView();

  // mengosongkan field input
  document.querySelector("#title").value = "";
  document.querySelector("#writer").value = "";
  document.querySelector("#year").value = "";

  e.preventDefault();
});

const generateId = () => {
  return Date.now();
};

const generateBooklistObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

const addBooklist = () => {
  const judul = document.querySelector("#title").value;
  const penulis = document.querySelector("#writer").value;
  const tahun = document.querySelector("#year").value;

  const newGeneratedId = generateId();

  const booklistObject = generateBooklistObject(
    newGeneratedId,
    judul,
    penulis,
    tahun,
    false
  );

  booklists.push(booklistObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
};

const findBooklist = (booklistId) => {
  for (const booklistItem of booklists) {
    if (booklistItem.id === booklistId) {
      return booklistItem;
    }
  }

  return null;
};

const findBooklistIndex = (booklistId) => {
  for (const index in booklists) {
    if (booklists[index].id === booklistId) {
      return index;
    }
  }

  return -1;
};

const addBookToCompleted = (booklistId) => {
  const booklistTarget = findBooklist(booklistId);

  if (booklistTarget == null) return;

  booklistTarget.isComplete = true;

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
};

const removeBookFromCompleted = (booklistId) => {
  // mengambil index target
  const booklistTarget = findBooklistIndex(booklistId);

  // mengecek apakah booklist index ada atau tidak
  if (booklistTarget === -1) return;

  const judulBuku = booklists[booklistTarget].title;

  // sweet alert
  Swal.fire({
    title: `Hapus buku "${judulBuku}"`,
    text: "Apakah anda yakin untuk menghapus buku ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#183153",
    cancelButtonColor: "#e0e0e0",
    confirmButtonText: "Hapus",
  }).then((result) => {
    if (result.isConfirmed) {
      booklists.splice(booklistTarget, 1);

      document.dispatchEvent(new Event(RENDER_EVENT));

      saveData();

      Swal.fire({
        position: "center",
        icon: "success",
        title: `Buku "${judulBuku}" telah berhasil terhapus`,
        showConfirmButton: false,
        timer: 1500,
      });
    }

    return;
  });

  // const confirmRemove = confirm("Are you sure you want to remove this book?");

  // if (confirmRemove) {
  // }
};

const undoBookFromCompleted = (booklistId) => {
  const booklistTarget = findBooklist(booklistId);

  if (booklistTarget == null) return;

  booklistTarget.isComplete = false;

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
};

const makeBooklist = (booklistObject) => {
  const textTitle = document.createElement("h2");
  textTitle.innerText = booklistObject.title;

  const textAuthor = document.createElement("h4");
  textAuthor.innerText = booklistObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = booklistObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `booklist-${booklistObject.id}`);

  if (booklistObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", () => {
      undoBookFromCompleted(booklistObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", () => {
      removeBookFromCompleted(booklistObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", () => {
      addBookToCompleted(booklistObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", () => {
      removeBookFromCompleted(booklistObject.id);
    });

    container.append(checkButton, trashButton);
  }

  return container;
};

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(booklists);

    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const booklist of data) {
      booklists.push(booklist);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const uncompletedBooklist = document.getElementById("booklists");
  uncompletedBooklist.innerHTML = "";

  const completedBooklist = document.getElementById("completed-booklists");
  completedBooklist.innerHTML = "";

  for (const booklistItem of booklists) {
    const booklistElement = makeBooklist(booklistItem);
    if (!booklistItem.isComplete) {
      uncompletedBooklist.append(booklistElement);
    } else {
      completedBooklist.append(booklistElement);
    }
  }
});
