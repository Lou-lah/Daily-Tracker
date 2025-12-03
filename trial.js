/*DATA*/
let habits = []; 

/* each habit looks like: { id, name, done }  DOM elements*/

const form     = document.getElementById("habit-form");
const input    = document.getElementById("habit-input");
const list     = document.getElementById("habit-list");
const statsEl  = document.getElementById("stats");
const filterEl = document.getElementById("filter");
const resetBtn = document.getElementById("reset-Btn");


/* saved habits */

const saved = localStorage.getItem("habits");
if (saved) {
    try {
        habits = JSON.parse(saved);
    } catch {
        habits = [];
    }
}
render();

/* Save to localStorage */
function save() {
    localStorage.setItem("habits", JSON.stringify(habits));
}


/*Add Hbait */

function addHabit(name) {
    if (!name.trim()) {
        alert("Please enter a habit name.");
        return false;
    }

    habits.push({
        id: Date.now(),
        name: name.trim(),
        done: false
    });

    save();
    render();
    return true;
}


function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    habit.done = !habit.done;
    save();
    render();
}


/* Status*/

function calculateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.done).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percent };
}


/* RENDER LIST*/

function render() {
    list.innerHTML = "";

    const filter = filterEl?.value || "all";

    habits
        .filter(h => 
            filter === "all" ||
            (filter === "done" && h.done) ||
            (filter === "notdone" && !h.done)
        )
        .forEach(h => {
            const li = document.createElement("li");

/* LEFT SIDE (checkbox & name)*/
            const left = document.createElement("div");
            left.className = "left";

/*checkbox*/

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = h.done;
            checkbox.addEventListener("change", () => toggleHabit(h.id));

/*name*/

            const name = document.createElement("span");
            name.textContent = h.name;
            name.className = "name";
            if (h.done) name.classList.add("done");

            left.append(checkbox, name);

/* RIGHT SIDE (edit & delete)*/

            const right = document.createElement("div");

/*edit*/

            const edit = document.createElement("button");
            edit.textContent = "Edit";
            edit.className = "edit-btn";
            edit.addEventListener("click", () => {
                const newName = prompt("Rename habit:", h.name);
                if (newName?.trim()) {
                    h.name = newName.trim();
                    save();
                    render();
                }
            });

/*delete*/

            const del = document.createElement("button");
            del.textContent = "Delete";
            del.className = "delete";
            del.addEventListener("click", () => {
                if (confirm(`Delete habit "${h.name}"?`)) {
                    habits = habits.filter(item => item.id !== h.id);
                    save();
                    render();
                }
            });

            right.append(edit, del);

            li.append(left, right);
            list.appendChild(li);
        });

/* Update status*/

    const { total, completed, percent } = calculateStats();
    statsEl.textContent = `Total: ${total} • Completed: ${completed} • ${percent}% done`;
}


form.addEventListener("submit", e => {
    e.preventDefault();
    if (addHabit(input.value)) {
        input.value = "";
        input.focus();
    }
});

filterEl?.addEventListener("change", render);

let clickTimer;

resetBtn.addEventListener("click", () => {
    if (clickTimer) {
        // This is the second click (double-click)
        clearTimeout(clickTimer);
        clickTimer = null;

        if (!confirm("Clear ALL habits permanently?")) return;
        habits = [];
        save();
        render();

    } else {
        // First click, wait to see if double-click comes
        clickTimer = setTimeout(() => {
            clickTimer = null;

            if (!confirm("Clear all completed habits?")) return;
            habits.forEach(h => h.done = false);
            save();
            render();

        }, 250); // 250ms is a typical double-click threshold
    }
});


