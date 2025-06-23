// 🔸 合計時間を更新
function updateTotalTime(shiftColumn) {
  const timeSpans = shiftColumn.querySelectorAll('.task-time');
  let total = 0;
  timeSpans.forEach(span => {
    const value = parseInt(span.textContent.trim(), 10);
    if (!isNaN(value)) total += value;
  });
  const totalTimeDisplay = shiftColumn.querySelector('.total-time');
  if (totalTimeDisplay) totalTimeDisplay.textContent = `合計：${total}分`;
}

// 🔸 作業カード生成
function createTaskCard(task) {
  const template = document.getElementById("task-card-template");
  const card = template.content.cloneNode(true);

  card.querySelector(".editable-task-name").value = task.taskName || "";
  card.querySelector(".meal-select").value = task.meal || "喫食";
  card.querySelector(".category-select").value = task.category || "区分";
  card.querySelector(".task-time").textContent = task.time || "20";
  card.querySelector(".remark-textarea").value = task.remark || "";

  if (task.remark && task.remark.trim() !== "") {
    card.querySelector(".remark-box").classList.remove("d-none");
  }

  return card;
}

// 🔸 タスク追加ボタン
document.querySelectorAll('.add-task').forEach(button => {
  button.addEventListener('click', () => {
    const shiftColumn = button.closest('.shift-column');
    const container = shiftColumn.querySelector('.task-container');
    const newCard = createTaskCard({});
    container.appendChild(newCard);
    setTimeout(() => updateTotalTime(shiftColumn), 0);
  });
});

// 🔸 作業時間編集時に合計更新
['input', 'blur'].forEach(eventName => {
  document.addEventListener(eventName, (e) => {
    if (e.target.classList.contains('task-time')) {
      const shiftColumn = e.target.closest('.shift-column');
      if (shiftColumn) updateTotalTime(shiftColumn);
    }
  }, true);
});

// 🔸 カード選択＆削除（ダブルクリック＆Delete）
let selectedCard = null;
document.addEventListener('dblclick', (e) => {
  const card = e.target.closest('.task-card');
  document.querySelectorAll('.task-card').forEach(c => c.classList.remove('selected'));
  if (card) {
    selectedCard = card;
    card.classList.add('selected');
  } else {
    selectedCard = null;
  }
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCard) {
    const shiftColumn = selectedCard.closest('.shift-column');
    selectedCard.remove();
    selectedCard = null;
    updateTotalTime(shiftColumn);
  }
});

// 🔸 ドラッグ＆ドロップ処理
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("task-card")) {
    e.target.classList.add("dragging");
  }
});
document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("task-card")) {
    e.target.classList.remove("dragging");
    const shiftColumn = e.target.closest('.shift-column');
    if (shiftColumn) updateTotalTime(shiftColumn);
  }
});
document.querySelectorAll(".task-container").forEach(container => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
});

// 🔸 備考ボタン切り替え
['click', 'input'].forEach(eventName => {
  document.addEventListener(eventName, (e) => {
    const card = e.target.closest(".task-card");
    if (!card) return;

    if (eventName === "click" && e.target.classList.contains("toggle-remark")) {
      const remarkBox = card.querySelector(".remark-box");
      remarkBox.classList.toggle("d-none");
    }

    if (eventName === "input" && e.target.classList.contains("remark-textarea")) {
      const button = card.querySelector(".toggle-remark");
      if (e.target.value.trim() !== "") {
        button.classList.remove("btn-outline-info");
        button.classList.add("btn-warning");
      } else {
        button.classList.remove("btn-warning");
        button.classList.add("btn-outline-info");
      }
    }
  });
});

// 🔸 shift内の作業データ取得
function getShiftTasks(shift) {
  const column = document.querySelector(`.shift-column[data-shift="${shift}"]`);
  if (!column) return [];
  const container = column.querySelector(".task-container");
  if (!container) return [];

  return [...container.querySelectorAll(".task-card")].map(card => ({
    taskName: card.querySelector(".editable-task-name")?.value.trim() || "",
    meal: card.querySelector(".meal-select")?.value || "",
    category: card.querySelector(".category-select")?.value || "",
    time: card.querySelector(".task-time")?.innerText.trim() || "",
    remark: card.querySelector(".remark-textarea")?.value.trim() || "",
    startTime: ""
  }));
}

// 🔸 現在の入力状態を取得
function collectCurrentData() {
  return {
    facilityName: document.getElementById("facility-name").value,
    meals: {
      breakfast: {
        time: document.getElementById("breakfast-time").value,
        qty: document.getElementById("breakfast-qty").value
      },
      lunch: {
        time: document.getElementById("lunch-time").value,
        qty: document.getElementById("lunch-qty").value
      },
      snack: {
        time: document.getElementById("snack-time").value,
        qty: document.getElementById("snack-qty").value
      },
      dinner: {
        time: document.getElementById("dinner-time").value,
        qty: document.getElementById("dinner-qty").value
      }
    },
    shifts: {
      morning: getShiftTasks("morning"),
      lunch: getShiftTasks("lunch"),
      dinner: getShiftTasks("dinner")
    }
  };
}

// 🔸 DOM読み込み後の統合処理
document.addEventListener("DOMContentLoaded", () => {
  // 「保存」ボタン（shiftWorkData）
  const saveButton = document.getElementById("saveBtn");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const data = collectCurrentData();
      localStorage.setItem("shiftWorkData", JSON.stringify(data));
      alert("保存しました！");
    });
  }

  // 「名前をつけて保存」ボタン（shiftPlansへ追加）
  const exportBtn = document.getElementById("export-json");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const name = prompt("保存名を入力してください（例：〇〇施設｜6月15日）");
      if (!name) return;

      const currentData = collectCurrentData();
      const id = Date.now().toString();

      const newEntry = {
        id,
        name,
        ...currentData
      };

      const existing = JSON.parse(localStorage.getItem("shiftPlans") || "[]");
      existing.push(newEntry);
      localStorage.setItem("shiftPlans", JSON.stringify(existing));

      alert("名前をつけて保存しました！");
    });
  }

  // URLから?id=○○ を取得して工程表を復元
  const id = new URLSearchParams(location.search).get("id");
  if (id) {
    const plans = JSON.parse(localStorage.getItem("shiftPlans") || "[]");
    const plan = plans.find(p => p.id === id);
    if (!plan) {
      alert("指定された工程表が見つかりません。");
      return;
    }

    // 入力欄に反映
    document.getElementById("facility-name").value = plan.facilityName || "";
    document.getElementById("breakfast-time").value = plan.meals?.breakfast?.time || "";
    document.getElementById("breakfast-qty").value = plan.meals?.breakfast?.qty || "";
    document.getElementById("lunch-time").value = plan.meals?.lunch?.time || "";
    document.getElementById("lunch-qty").value = plan.meals?.lunch?.qty || "";
    document.getElementById("snack-time").value = plan.meals?.snack?.time || "";
    document.getElementById("snack-qty").value = plan.meals?.snack?.qty || "";
    document.getElementById("dinner-time").value = plan.meals?.dinner?.time || "";
    document.getElementById("dinner-qty").value = plan.meals?.dinner?.qty || "";

    // 作業カード表示
    function loadTasksToShift(shiftKey, tasks) {
      const column = document.querySelector(`.shift-column[data-shift="${shiftKey}"]`);
      const container = column?.querySelector(".task-container");
      if (!container) return;
      container.innerHTML = "";
      tasks.forEach(task => {
        const card = createTaskCard(task);
        container.appendChild(card);
      });
    }

    loadTasksToShift("morning", plan.shifts?.morning || []);
    loadTasksToShift("lunch", plan.shifts?.lunch || []);
    loadTasksToShift("dinner", plan.shifts?.dinner || []);

    document.querySelectorAll(".shift-column").forEach(col => updateTotalTime(col));
  }
});
